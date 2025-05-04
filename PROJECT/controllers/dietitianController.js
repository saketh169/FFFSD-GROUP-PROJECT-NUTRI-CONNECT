const express = require('express');
const router = express.Router();
const { Dietitian, DietitianInfo, User } = require('../models/userModel');
const { BookedSlots } = require('../models/bookingModel');
const { body, query, param, validationResult } = require('express-validator');

const ensureUserAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
    next();
};

const ensureAuthorized = (roles) => (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
};

const checkBookingRestrictions = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated', paymentStatus: 'failed' });
        }

        const userId = req.session.user.id;
        const { dietitianId, date, time } = req.body;

        const slotAlreadyBooked = await BookedSlots.findOne({
            dietitianId,
            date,
            time,
            status: 'Booked'
        });

        if (slotAlreadyBooked) {
            return res.status(400).json({
                error: 'Select a Slot to book the Consultation',
                paymentStatus: 'failed'
            });
        }

        const userBookingCount = await BookedSlots.countDocuments({
            userId,
            date,
            status: 'Booked'
        });

        if (userBookingCount >= 4) {
            return res.status(400).json({
                error: 'Maximum 4 bookings per day reached for this user',
                paymentStatus: 'failed'
            });
        }

        next();
    } catch (error) {
        console.error('Error checking booking restrictions:', error);
        res.status(500).json({ 
            error: 'Error checking booking availability',
            paymentStatus: 'failed'
        });
    }
};

router.get('/dietitians/:id/slots', ensureUserAuthenticated, [
    param('id').isMongoId().withMessage('Invalid dietitian ID'),
    query('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date is required (YYYY-MM-DD)').custom((date) => {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d) && date === d.toISOString().split('T')[0];
    }).withMessage('Invalid date')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { date } = req.query;

        const dietitian = await Dietitian.findById(id);
        if (!dietitian || dietitian.isDeleted) {
            return res.status(404).json({ error: 'Dietitian not found' });
        }

        const dietitianInfo = await DietitianInfo.findOne({ dietitianId: id });
        if (!dietitianInfo?.availability?.workingHours) {
            return res.status(400).json({ error: 'No availability information found' });
        }

        const { start, end } = dietitianInfo.availability.workingHours;
        const [startHour, startMinute] = start.split(':').map(Number);
        let [endHour, endMinute] = end.split(':').map(Number);

        // Cap end time at 20:00 (8:00 PM) if it exceeds
        if (endHour > 20 || (endHour === 20 && endMinute > 0)) {
            endHour = 20;
            endMinute = 0;
        }

        let availableSlots = [];
        let currentHour = startHour;
        let currentMinute = startMinute;

        // Generate slots up to and including 20:00
        while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
            // Ensure slots do not exceed 20:00
            if (currentHour > 20 || (currentHour === 20 && currentMinute > 0)) {
                break;
            }
            const slot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            availableSlots.push(slot);
            currentMinute += 30;
            if (currentMinute >= 60) {
                currentHour += 1;
                currentMinute = 0;
            }
        }

        // Ensure 20:00 is included if end time is exactly 20:00
        if (endHour === 20 && endMinute === 0 && !availableSlots.includes('20:00')) {
            availableSlots.push('20:00');
        }

        // Fetch booked slots for this dietitian on this date
        const bookedSlotsRecords = await BookedSlots.find({
            dietitianId: id,
            date,
            status: 'Booked'
        }).select('time');
        const bookedSlots = bookedSlotsRecords.map(record => record.time);

        // Filter out booked slots
        const filteredAvailableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

        res.json({
            success: true,
            availableSlots: filteredAvailableSlots,
            bookedSlots
        });
    } catch (err) {
        console.error('Error fetching slots:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Other routes remain unchanged
router.get('/dietitian-profiles', ensureUserAuthenticated, (req, res) => {
    res.render('dietitian_profiles');
});

router.get('/dietitian-profiles/:id', ensureUserAuthenticated, [
    param('id').isMongoId().withMessage('Invalid dietitian ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('error', { message: 'Invalid dietitian ID' });
        }

        const { id } = req.params;
        const dietitian = await Dietitian.findById(id).select('-password -profileImage -files');
        if (!dietitian || dietitian.isDeleted) {
            return res.status(404).render('error', { message: 'Dietitian not found' });
        }

        const dietitianInfo = await DietitianInfo.findOne({ dietitianId: id }).lean();
        if (!dietitianInfo) {
            return res.status(404).render('error', { message: 'Dietitian info not found' });
        }

        const user = await User.findById(req.session.user.id).select('name email');

        const dietitianData = {
            ...dietitian.toObject(),
            _id: dietitian._id.toString(),
            profileImage: `/dietitians/${dietitian._id}/photo`,
            title: dietitianInfo.title || dietitian.name,
            specialties: dietitianInfo.specialties || dietitian.specialization || [],
            education: dietitianInfo.education || dietitian.education || [],
            languages: dietitianInfo.languages || dietitian.languages || [],
            availability: dietitianInfo.availability || {},
            description: dietitianInfo.description || dietitian.about || '',
            expertise: dietitianInfo.expertise || [],
            certifications: dietitianInfo.certifications || [],
            awards: dietitianInfo.awards || [],
            publications: dietitianInfo.publications || [],
            testimonials: dietitianInfo.testimonials || [],
            socialMedia: dietitianInfo.socialMedia || {},
            rating: dietitian.rating || 0,
            fees: dietitian.fees || 0,
            online: dietitian.online || false,
            offline: dietitian.offline || false,
            location: dietitian.location || ''
        };

        res.render('dietitian_info', {
            dietitian: dietitianData,
            user: user ? user.toObject() : null
        });
    } catch (err) {
        console.error('Error fetching dietitian profile:', err.message);
        res.status(500).render('error', { message: 'Server error' });
    }
});

router.get('/dietitians', async (req, res) => {
    try {
        const dietitians = await Dietitian.find({ isDeleted: false })
            .select('-password -profileImage -files')
            .sort({ rating: -1 });

        const dietitiansWithInfo = await Promise.all(
            dietitians.map(async (dietitian) => {
                const info = await DietitianInfo.findOne({ dietitianId: dietitian._id });
                return {
                    ...dietitian.toObject(),
                    _id: dietitian._id.toString(),
                    photo: `/dietitians/${dietitian._id}/photo`,
                    title: info?.title || dietitian.name,
                    specialties: info?.specialties || dietitian.specialization,
                    education: info?.education || [],
                    languages: info?.languages || dietitian.languages,
                    availability: info?.availability || {}
                };
            })
        );

        res.json(dietitiansWithInfo);
    } catch (err) {
        console.error('Error fetching dietitians:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/dietitians/:id', [
    param('id').isMongoId().withMessage('Invalid dietitian ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const dietitian = await Dietitian.findById(req.params.id).select('-password -profileImage -files');
        if (!dietitian || dietitian.isDeleted) {
            return res.status(404).json({ error: 'Dietitian not found' });
        }

        const dietitianInfo = await DietitianInfo.findOne({ dietitianId: dietitian._id });
        res.json({
            ...dietitian.toObject(),
            _id: dietitian._id.toString(),
            photo: `/dietitians/${dietitian._id}/photo`,
            title: dietitianInfo?.title || dietitian.name,
            specialties: dietitianInfo?.specialties || dietitian.specialization,
            education: dietitianInfo?.education || [],
            languages: dietitianInfo?.languages || dietitian.languages,
            availability: dietitianInfo?.availability || {}
        });
    } catch (err) {
        console.error('Error fetching dietitian:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/dietitians/:id/photo', [
    param('id').isMongoId().withMessage('Invalid dietitian ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const dietitian = await Dietitian.findById(req.params.id).select('profileImage');
        if (!dietitian || !dietitian.profileImage) {
            return res.status(404).json({ error: 'Profile image not found' });
        }

        res.set('Content-Type', 'image/jpeg');
        res.send(dietitian.profileImage);
    } catch (err) {
        console.error('Error fetching profile image:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/dietitians/book-slot', ensureUserAuthenticated, checkBookingRestrictions, [
    body('dietitianId').isMongoId().withMessage('Invalid dietitian ID'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Invalid date format (YYYY-MM-DD)').custom((date) => {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d) && date === d.toISOString().split('T')[0];
    }).withMessage('Invalid date'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('Invalid time format (HH:MM)'),
    body('consultationType').isIn(['Online', 'In-person']).withMessage('Consultation type must be Online or In-person'),
    body('paymentId').optional().trim().notEmpty().withMessage('Payment ID is required'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
    body('paymentMethod').optional().isIn(['Credit Card', 'UPI', 'PayPal']).withMessage('Invalid payment method'),
    body('amount').optional().custom(async (amount, { req }) => {
        const dietitian = await Dietitian.findById(req.body.dietitianId);
        if (!dietitian) throw new Error('Dietitian not found');
        if (amount !== dietitian.fees) throw new Error('Amount does not match dietitian fees');
        return true;
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                errors: errors.array(), 
                paymentStatus: 'failed' 
            });
        }

        const { dietitianId, date, time, consultationType, paymentId, amount, paymentMethod } = req.body;
        const userId = req.session.user.id;

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian || dietitian.isDeleted) {
            return res.status(404).json({ 
                error: 'Dietitian not found', 
                paymentStatus: 'failed' 
            });
        }

        const dietitianInfo = await DietitianInfo.findOne({ dietitianId });
        if (!dietitianInfo) {
            return res.status(400).json({ 
                error: 'Dietitian profile information not found', 
                paymentStatus: 'failed' 
            });
        }

        if (!dietitianInfo.availability?.workingHours) {
            return res.status(400).json({ 
                error: 'No availability information found', 
                paymentStatus: 'failed' 
            });
        }

        const { start, end } = dietitianInfo.availability.workingHours;
        const slotTime = parseInt(time.split(':')[0]) + (time.includes(':30') ? 0.5 : 0);
        const startTime = parseInt(start.split(':')[0]) + (start.includes(':30') ? 0.5 : 0);
        let endTime = parseInt(end.split(':')[0]) + (end.includes(':30') ? 0.5 : 0);
        if (endTime > 20) endTime = 20;

        if (slotTime < startTime || slotTime > endTime) {
            return res.status(400).json({ 
                error: 'Slot is outside working hours', 
                paymentStatus: 'failed' 
            });
        }

        const slotDateTime = new Date(`${date}T${time}:00`);
        const now = new Date();
        if (slotDateTime <= now) {
            return res.status(400).json({ 
                error: 'Cannot book past or current slots', 
                paymentStatus: 'failed' 
            });
        }

        if (!paymentId && !amount && !paymentMethod) {
            return res.json({
                success: true,
                message: 'Slot is eligible for booking'
            });
        }

        const booking = new BookedSlots({
            dietitianId,
            userId,
            date,
            time,
            consultationType,
            paymentId,
            amount,
            paymentMethod,
            status: 'Booked'
        });
        await booking.save();

        const dietitianName = dietitianInfo?.title || dietitian.name;

        res.json({
            success: true,
            paymentStatus: 'success',
            booking: {
                _id: booking._id.toString(),
                dietitianName,
                date,
                time,
                consultationType
            }
        });
    } catch (err) {
        console.error('Error booking slot:', err.message);
        res.status(500).json({ 
            error: 'Failed to book slot: ' + err.message, 
            paymentStatus: 'failed' 
        });
    }
});

router.post('/bookings/:id/cancel', ensureUserAuthenticated, [
    param('id').isMongoId().withMessage('Invalid booking ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const userId = req.session.user.id;

        const booking = await BookedSlots.findById(id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only cancel your own bookings' });
        }

        if (booking.status !== 'Booked') {
            return res.status(400).json({ error: 'Booking is not active' });
        }

        const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
        if (bookingDateTime <= new Date()) {
            return res.status(400).json({ error: 'Cannot cancel past bookings' });
        }

        booking.status = 'Cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (err) {
        console.error('Error cancelling booking:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/bookings/:id/complete', ensureUserAuthenticated, [
    param('id').isMongoId().withMessage('Invalid booking ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const userId = req.session.user.id;

        const booking = await BookedSlots.findById(id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only complete your own bookings' });
        }

        if (booking.status !== 'Booked') {
            return res.status(400).json({ error: 'Booking is not active' });
        }

        booking.status = 'Completed';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking marked as completed'
        });
    } catch (err) {
        console.error('Error completing booking:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/bookings/:id/details', ensureUserAuthenticated, [
    param('id').isMongoId().withMessage('Invalid booking ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const userId = req.session.user.id;

        const booking = await BookedSlots.findById(id).populate('dietitianId', 'name');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You can only view your own bookings' });
        }

        const dietitianInfo = await DietitianInfo.findOne({ dietitianId: booking.dietitianId });
        const dietitianName = dietitianInfo?.title || booking.dietitianId.name;

        res.json({
            success: true,
            booking: {
                _id: booking._id.toString(),
                dietitianName,
                date: booking.date,
                time: booking.time,
                status: booking.status
            }
        });
    } catch (err) {
        console.error('Error fetching booking details:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/bookings/user', ensureUserAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const bookings = await BookedSlots.find({ userId, status: 'Booked' })
            .populate('dietitianId', 'name');

        const formattedBookings = await Promise.all(bookings.map(async (booking) => {
            const dietitianInfo = await DietitianInfo.findOne({ dietitianId: booking.dietitianId });
            const dietitianName = dietitianInfo?.title || booking.dietitianId.name;
            return {
                _id: booking._id.toString(),
                dietitianName,
                date: booking.date,
                time: booking.time,
                status: booking.status
            };
        }));

        res.json({
            success: true,
            bookings: formattedBookings
        });
    } catch (err) {
        console.error('Error fetching user bookings:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;