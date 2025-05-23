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

const { Subscription } = require('../models/paymentModel');

// Middleware to check booking restrictions based on subscription plan
const checkBookingRestrictions = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated', paymentStatus: 'failed' });
        }

        const userId = req.session.user.id;
        const { dietitianId, date, time } = req.body;

        // Check if the user has booked this time slot with ANY dietitian
        const userSlotBooked = await BookedSlots.findOne({
            userId,
            date,
            time,
            status: 'Booked'
        });

        if (userSlotBooked) {
            return res.status(400).json({
                error: 'You have already booked a slot at this time with another dietitian.',
                paymentStatus: 'failed'
            });
        }

        // Check if the specific dietitian has this slot booked by ANY user
        const dietitianSlotBooked = await BookedSlots.findOne({
            dietitianId,
            date,
            time,
            status: 'Booked'
        });

        if (dietitianSlotBooked) {
            return res.status(400).json({
                error: 'This time slot is already booked for this dietitian.',
                paymentStatus: 'failed'
            });
        }

        // Determine the user's daily booking limit based on their subscription
        let dailyBookingLimit = 2; // Default for users without a plan
        let errorMessage = 'Maximum 2 bookings per day reached. Subscribe to a membership plan to book more.';
        const activeSubscription = await Subscription.findOne({
            userId,
            active: true,
            status: 'success',
            expiresAt: { $gt: new Date() } // Ensure subscription is not expired
        });

        if (activeSubscription) {
            const planName = activeSubscription.name;
            if (planName === 'Basic Plan') {
                dailyBookingLimit = 4;
                errorMessage = 'Maximum 4 bookings per day reached for your Basic plan , Try a other day ';
            } else if (planName === 'Premium Plan' ) {
                dailyBookingLimit = 6;
                errorMessage = 'Maximum 6 bookings per day reached for your Premium plan, Try a other day ';
            }
            else if (planName === 'Ultimate Plan' ) {
                dailyBookingLimit = 8;
                errorMessage = 'Maximum 8 bookings per day reached for your Ultimate plan, Try a other day ';
            }
        }

        // Check the user's daily booking count against their limit
        const userBookingCount = await BookedSlots.countDocuments({
            userId,
            date,
            status: 'Booked'
        });

        if (userBookingCount >= dailyBookingLimit) {
            return res.status(400).json({
                error: errorMessage,
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
        const userId = req.session.user.id;

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

        // Fetch slots booked by the current user for ANY dietitian on this date
        const userBookedSlots = await BookedSlots.find({
            userId,
            date,
            status: 'Booked'
        }).select('time');

        // Fetch slots booked for this specific dietitian by ANY user on this date
        const dietitianBookedSlots = await BookedSlots.find({
            dietitianId: id,
            date,
            status: 'Booked'
        }).select('time');

        // Combine booked slots from both queries, removing duplicates
        const bookedSlots = [
            ...new Set([
                ...userBookedSlots.map(record => record.time),
                ...dietitianBookedSlots.map(record => record.time)
            ])
        ];

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
        const dietitians = await Dietitian.find({ 
            isDeleted: false,
            specialization: { $exists: true, $ne: [] } // Ensure specialization is not empty
        })
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

        // Fetch user to get username
        const user = await User.findById(userId).select('name');
        if (!user) {
            return res.status(404).json({ 
                error: 'User not found', 
                paymentStatus: 'failed' 
            });
        }

        const booking = new BookedSlots({
            dietitianId,
            userId,
            username: user.name,
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
                consultationType,
                username: user.name
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
                status: booking.status,
                username: booking.username
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


// Middleware to ensure the user is authenticated
function ensureDietitianAuthenticated(req, res, next) {
    if (req.session.dietitian) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
}

router.post('/dietitians-info1', ensureDietitianAuthenticated, async (req, res) => {
    const dietitianSession = req.session.dietitian;
    if (!dietitianSession) {
        console.log('Unauthorized access to /dietitians-info1');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
        name,
        email,
        password,
        age,
        phone,
        specializationDomain,
        specialization,
        experience,
        fees,
        languages,
        location,
        online,
        offline,
        about,
        education,
    } = req.body;

    console.log('Received Dietitian Data:', req.body);

    try {
        const dietitian = await Dietitian.findById(dietitianSession.id);
        if (!dietitian) {
            console.log('Dietitian not found for ID:', dietitianSession.id);
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        // Update dietitian fields
        dietitian.name = name || dietitian.name;
        dietitian.email = email || dietitian.email;
        if (password) dietitian.password = password; // Password will be hashed by pre-save hook
        dietitian.age = age ? Number(age) : dietitian.age;
        dietitian.phone = phone || dietitian.phone;
        dietitian.specializationDomain = specializationDomain || dietitian.specializationDomain;
        dietitian.specialization = specialization ? specialization.split(',').map(s => s.trim()) : dietitian.specialization;
        dietitian.experience = experience ? Number(experience) : dietitian.experience;
        dietitian.fees = fees ? Number(fees) : dietitian.fees;
        dietitian.languages = languages ? languages.split(',').map(l => l.trim()) : dietitian.languages;
        dietitian.location = location || dietitian.location;
        dietitian.online = typeof online === 'boolean' ? online : dietitian.online;
        dietitian.offline = typeof offline === 'boolean' ? offline : dietitian.offline;
        dietitian.about = about || dietitian.about;
        dietitian.education = education ? education.split(',').map(e => e.trim()) : dietitian.education;

        await dietitian.save();
        console.log('Dietitian updated:', dietitian);
        res.status(200).json({ success: true, message: 'Dietitian details updated successfully' });
    } catch (err) {
        console.error('Error saving dietitian details:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to save or update DietitianInfo details (Form 2)
router.post('/dietitians-info2', ensureDietitianAuthenticated, async (req, res) => {
    const dietitianSession = req.session.dietitian;
    if (!dietitianSession) {
        console.log('Unauthorized access to /dietitians-info2');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
        title,
        description,
        specialties,
        infoEducation,
        expertise,
        certifications,
        awards,
        publications,
        infoLanguages,
        consultationTypes,
        workingDays,
        workingHoursStart,
        workingHoursEnd,
        linkedin,
        twitter,
    } = req.body;

    console.log('Received DietitianInfo Data:', req.body);

    try {
        // Validate that certifications, awards, publications, and consultationTypes are arrays
        const validatedCertifications = Array.isArray(certifications) ? certifications : [];
        const validatedAwards = Array.isArray(awards) ? awards : [];
        const validatedPublications = Array.isArray(publications) ? publications : [];
        const validatedConsultationTypes = Array.isArray(consultationTypes) ? consultationTypes : [];

        // Prepare the data to save or update
        const dietitianInfoData = {
            dietitianId: dietitianSession.id,
            title: title || '',
            description: description || '',
            specialties: specialties ? specialties.split(',').map(s => s.trim()) : [],
            education: infoEducation ? infoEducation.split(',').map(e => e.trim()) : [],
            expertise: expertise ? expertise.split(',').map(e => e.trim()) : [],
            certifications: validatedCertifications,
            awards: validatedAwards,
            publications: validatedPublications,
            languages: infoLanguages ? infoLanguages.split(',').map(l => l.trim()) : [],
            consultationTypes: validatedConsultationTypes,
            availability: {
                workingDays: workingDays ? workingDays.split(',').map(d => d.trim()) : [],
                workingHours: {
                    start: workingHoursStart || '',
                    end: workingHoursEnd || '',
                },
            },
            socialMedia: {
                linkedin: linkedin || '',
                twitter: twitter || '',
            },
        };

        // Check if a DietitianInfo entry already exists for this dietitianId
        let dietitianInfo = await DietitianInfo.findOne({ dietitianId: dietitianSession.id });

        if (dietitianInfo) {
            // Update existing entry
            dietitianInfo.title = dietitianInfoData.title;
            dietitianInfo.description = dietitianInfoData.description;
            dietitianInfo.specialties = dietitianInfoData.specialties;
            dietitianInfo.education = dietitianInfoData.education;
            dietitianInfo.expertise = dietitianInfoData.expertise;
            dietitianInfo.certifications = dietitianInfoData.certifications;
            dietitianInfo.awards = dietitianInfoData.awards;
            dietitianInfo.publications = dietitianInfoData.publications;
            dietitianInfo.languages = dietitianInfoData.languages;
            dietitianInfo.consultationTypes = dietitianInfoData.consultationTypes;
            dietitianInfo.availability = dietitianInfoData.availability;
            dietitianInfo.socialMedia = dietitianInfoData.socialMedia;

            await dietitianInfo.save();
            console.log('DietitianInfo updated:', dietitianInfo);
        } else {
            // Create new entry
            dietitianInfo = new DietitianInfo(dietitianInfoData);
            await dietitianInfo.save();
            console.log('DietitianInfo created:', dietitianInfo);
        }

        res.status(200).json({ success: true, message: 'Professional details saved successfully' });
    } catch (err) {
        console.error('Error saving dietitian info:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

/*
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
                status: booking.status,
                username: booking.username
            }
        });
    } catch (err) {
        console.error('Error fetching booking details:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});
*/


module.exports = router;