const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { BookedSlots } = require('../models/bookingModel');
const { Dietitian, User } = require('../models/userModel');
const { Message } = require('../models/chatModel');
const multer = require('multer');
const LabReport = require('../models/labReportModel');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit per file
    },
    fileFilter: function (req, file, cb) {
        // Accept only pdf, jpg, jpeg, png files
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .pdf, .jpg, .jpeg, and .png files are allowed!'));
    }
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    next(err);
};

// Middleware to ensure user is authorized for specific role
function ensureAuthorized(role) {
    return (req, res, next) => {
        if (req.session && 
            ((role === 'user' && req.session.user && req.session.user.role === 'user') || 
             (role === 'dietitian' && req.session.dietitian && req.session.dietitian.role === 'dietitian')||
              (role === 'admin' && req.session.admin && req.session.admin.role === 'admin'))) {
            return next();
        }
        console.warn(`Unauthorized access to ${req.path} for role ${role}`);
        return res.redirect('/roles_signin');
    };
}

// GET /consultation-revenue
router.get('/consultation-revenue', ensureAuthorized('admin'), async (req, res) => {
    try {
        const consultations = await BookedSlots.find({ status: { $in: ['Booked', 'Completed'] } }).select('userId dietitianId amount paymentId paymentMethod date time');
        
        // Format the consultation data to match frontend expectations
        const formattedConsultations = consultations.map(consultation => ({
            userId: consultation.userId.toString(),
            dietitianId: consultation.dietitianId.toString(),
            amount: consultation.amount,
            transactionId: consultation.paymentId,
            paymentMethod: consultation.paymentMethod,
            date: consultation.date, // Already in YYYY-MM-DD format
            time: consultation.time
        }));

        // Log for debugging (optional)
        formattedConsultations.forEach((consultation, index) => {
            console.log(`Consultation ${index + 1}:`, consultation);
        });

        // Return the data in the response
        res.status(200).json({ success: true, data: formattedConsultations });
    } catch (error) {
        console.error('Error fetching consultation revenue:', error.message);
        res.status(500).json({ error: 'Failed to fetch consultation revenue' });
    }
});

// GET /bookings/user-dietitians
router.get('/bookings/client-dietitians', ensureAuthorized('user'), async (req, res) => {
    try {
        const userId = req.session.user.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const bookings = await BookedSlots.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'Booked' } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$dietitianId',
                    date: { $first: '$date' },
                    time: { $first: '$time' },
                    consultationType: { $first: '$consultationType' }
                }
            },
            {
                $lookup: {
                    from: 'dietitians',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'dietitian'
                }
            },
            { $unwind: '$dietitian' },
            {
                $project: {
                    _id: '$dietitian._id',
                    name: '$dietitian.name',
                    specialization: '$dietitian.specialization',
                    profileImage: '$dietitian.profileImage',
                    date: 1,
                    time: 1,
                    consultationType: 1
                }
            }
        ]);

        const dietitians = bookings.map(booking => ({
            _id: booking._id,
            name: booking.name,
            specialization: booking.specialization,
            profileImage: booking.profileImage && booking.profileImage.buffer
                ? `data:image/jpeg;base64,${booking.profileImage.buffer.toString('base64')}`
                : null,
            date: booking.date,
            time: booking.time,
            consultationType: booking.consultationType
        }));

        res.json(dietitians);
    } catch (error) {
        console.error('Error fetching user dietitians:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /bookings/dietitian-clients
router.get('/bookings/dietitian-clients', ensureAuthorized('dietitian'), async (req, res) => {
    try {
        const dietitianId = req.session.dietitian.id;
        if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
            return res.status(400).json({ error: 'Invalid dietitian ID' });
        }
        const bookings = await BookedSlots.aggregate([
            { $match: { dietitianId: new mongoose.Types.ObjectId(dietitianId), status: 'Booked' } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$userId',
                    date: { $first: '$date' },
                    time: { $first: '$time' },
                    consultationType: { $first: '$consultationType' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: '$user._id',
                    name: '$user.name',
                    email: '$user.email',
                    profileImage: '$user.profileImage',
                    date: 1,
                    time: 1,
                    consultationType: 1
                }
            }
        ]);

        const clients = bookings.map(booking => ({
            _id: booking._id,
            name: booking.name,
            email: booking.email,
            profileImage: booking.profileImage && booking.profileImage.buffer
                ? `data:image/jpeg;base64,${booking.profileImage.buffer.toString('base64')}`
                : null,
            date: booking.date,
            time: booking.time,
            consultationType: booking.consultationType
        }));

        res.json(clients);
    } catch (error) {
        console.error('Error fetching dietitian clients:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /client-messages
router.post('/client-messages', ensureAuthorized('user'), async (req, res) => {
    try {
        if (!Message || typeof Message.find !== 'function') {
            throw new Error('Message model is not properly defined');
        }
        const { content, receiverId } = req.body;
        const senderId = req.session.user.id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: 'Invalid dietitian ID' });
        }
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const message = new Message({
            senderId,
            receiverId,
            content,
            createdAt: new Date()
        });

        await message.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error storing client message:', error.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// GET /client-messages
router.get('/client-messages', ensureAuthorized('user'), async (req, res) => {
    try {
        if (!Message || typeof Message.find !== 'function') {
            throw new Error('Message model is not properly defined');
        }
        const userId = req.session.user.id;
        const otherPartyId = req.query.otherPartyId;

        if (!mongoose.Types.ObjectId.isValid(otherPartyId)) {
            return res.status(400).json({ error: 'Invalid dietitian ID' });
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherPartyId },
                { senderId: otherPartyId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching client messages:', error.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /dietitian-messages
router.post('/dietitian-messages', ensureAuthorized('dietitian'), async (req, res) => {
    try {
        if (!Message || typeof Message.find !== 'function') {
            throw new Error('Message model is not properly defined');
        }
        const { content, receiverId } = req.body;
        const senderId = req.session.dietitian.id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const message = new Message({
            senderId,
            receiverId,
            content,
            createdAt: new Date()
        });

        await message.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error storing dietitian message:', error.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// GET /dietitian-messages
router.get('/dietitian-messages', ensureAuthorized('dietitian'), async (req, res) => {
    try {
        if (!Message || typeof Message.find !== 'function') {
            throw new Error('Message model is not properly defined');
        }
        const dietitianId = req.session.dietitian.id;
        const otherPartyId = req.query.otherPartyId;

        if (!mongoose.Types.ObjectId.isValid(otherPartyId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const messages = await Message.find({
            $or: [
                { senderId: dietitianId, receiverId: otherPartyId },
                { senderId: otherPartyId, receiverId: dietitianId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching dietitian messages:', error.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// GET /chat_user/:id
router.get('/chat_user/:id', ensureAuthorized('user'), async (req, res) => {
    try {
        const userId = req.session.user.id;
        const role = 'user';
        const otherPartyId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherPartyId)) {
            console.warn('Invalid ID:', { userId, otherPartyId });
            return res.status(400).send('Invalid ID');
        }

        console.log('Rendering chat_user:', { userId, role, otherPartyId });

        const dietitian = await Dietitian.findById(otherPartyId).select('name profileImage');
        if (!dietitian) {
            console.warn('Dietitian not found:', otherPartyId);
            return res.status(404).send('Dietitian not found');
        }

        let profileImage = null;
        if (dietitian.profileImage && dietitian.profileImage.buffer) {
            try {
                profileImage = `data:image/jpeg;base64,${dietitian.profileImage.buffer.toString('base64')}`;
            } catch (error) {
                console.error('Error converting dietitian profile image:', error.message);
            }
        }

        res.render('chat', {
            userId,
            role,
            otherPartyId,
            otherPartyName: dietitian.name || 'Unknown',
            otherPartyProfileImage: profileImage,
            backUrl: '/user-consultations'
        });
    } catch (error) {
        console.error('Error rendering chat_user:', error.message);
        res.status(500).send('Server error');
    }
});

// GET /chat_dietitian/:id
router.get('/chat_dietitian/:id', ensureAuthorized('dietitian'), async (req, res) => {
    try {
        const userId = req.session.dietitian.id;
        const role = 'dietitian';
        const otherPartyId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherPartyId)) {
            console.warn('Invalid ID:', { userId, otherPartyId });
            return res.status(400).send('Invalid ID');
        }

        console.log('Rendering chat_dietitian:', { userId, role, otherPartyId });

        const user = await User.findById(otherPartyId).select('name profileImage');
        if (!user) {
            console.warn('User not found:', otherPartyId);
            return res.status(404).send('User not found');
        }

        let profileImage = null;
        if (user.profileImage && user.profileImage.buffer) {
            try {
                profileImage = `data:image/jpeg;base64,${user.profileImage.buffer.toString('base64')}`;
            } catch (error) {
                console.error('Error converting user profile image:', error.message);
            }
        }

        res.render('chat', {
            userId,
            role,
            otherPartyId,
            otherPartyName: user.name || 'Unknown',
            otherPartyProfileImage: profileImage,
            backUrl: '/dietitian-consultations'
        });
    } catch (error) {
        console.error('Error rendering chat_dietitian:', error.message);
        res.status(500).send('Server error');
    }
});

// Route for dietitians to view lab reports
router.get('/view-lab-reports/:userId', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        console.log('Accessing view-lab-reports route');
        console.log('Session dietitian:', req.session.dietitian);
        
        const dietitianId = req.session.dietitian.id;
        const userId = req.params.userId;
        
        console.log('IDs:', { dietitianId, userId });

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID:', userId);
            return res.status(400).send('Invalid user ID');
        }

        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found:', userId);
            return res.status(404).send('User not found');
        }

        console.log('Found user:', user.name);

        res.render('Lab_diet', {
            userId: userId,
            dietitianId: dietitianId,
            userName: user.name,
            role: 'dietitian'
        });
    } catch (error) {
        console.error('Error in view-lab-reports route:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).send('Server error');
    }
});

// Route for users to view lab reports
router.get('/lab-reports/:dietitianId', ensureAuthorized("user"), async (req, res) => {
    try {
        console.log('Accessing lab-reports route');
        console.log('Session user:', req.session.user);
        
        const userId = req.session.user.id;
        const dietitianId = req.params.dietitianId;
        
        console.log('IDs:', { userId, dietitianId });

        if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
            console.error('Invalid dietitian ID:', dietitianId);
            return res.status(400).send('Invalid dietitian ID');
        }

        // Get dietitian info
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            console.error('Dietitian not found:', dietitianId);
            return res.status(404).send('Dietitian not found');
        }

        console.log('Found dietitian:', dietitian.name);

        res.render('Lab_user_reports', {
            userId: userId,
            dietitianId: dietitianId,
            dietitianName: dietitian.name,
            role: 'user'
        });
    } catch (error) {
        console.error('Error in lab-reports route:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).send('Server error');
    }
});

// Lab Reports Routes
router.get('/lab-reports-dietitian/:userId', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        const dietitianId = req.session.dietitian._id;
        const userId = req.params.userId;
        
        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('Lab_diet', {
            userId: userId,
            dietitianId: dietitianId,
            userName: user.name,
            role: 'dietitian'
        });
    } catch (error) {
        console.error('Error in lab reports route:', error);
        res.status(500).send('Server error');
    }
});

// API endpoint for dietitians to get lab reports
router.get('/booking/lab-report/dietitian', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        console.log('Accessing lab-report/dietitian API');
        console.log('Session dietitian:', req.session.dietitian);
        console.log('Query parameters:', req.query);
        
        const { otherPartyId } = req.query;
        const dietitianId = req.session.dietitian.id;
        
        console.log('IDs:', { dietitianId, otherPartyId });

        if (!mongoose.Types.ObjectId.isValid(otherPartyId)) {
            console.error('Invalid user ID:', otherPartyId);
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Convert string IDs to ObjectId
        const query = {
            userId: new mongoose.Types.ObjectId(otherPartyId),
            dietitianId: new mongoose.Types.ObjectId(dietitianId)
        };
        
        console.log('MongoDB query:', query);
        
        const reports = await LabReport.find(query).sort({ createdAt: -1 });
        console.log('Found reports:', reports.length);
        
        // Log each report's file data
        reports.forEach((report, index) => {
            console.log(`Report ${index + 1} files:`, {
                generalHealthReport: report.generalHealthReport ? 'Present' : 'Missing',
                bloodTestReport: report.bloodTestReport ? 'Present' : 'Missing',
                diabetesThyroidReport: report.diabetesThyroidReport ? 'Present' : 'Missing',
                bloodPressureReport: report.bloodPressureReport ? 'Present' : 'Missing',
                cardiacHealthReport: report.cardiacHealthReport ? 'Present' : 'Missing',
                hormonalProfileReport: report.hormonalProfileReport ? 'Present' : 'Missing'
            });
        });

        res.json(reports);
    } catch (error) {
        console.error('Error fetching lab reports:', {
            message: error.message,
            stack: error.stack,
            query: req.query,
            session: req.session.dietitian
        });
        res.status(500).json({ error: 'Failed to fetch lab reports' });
    }
});

// API endpoint to get lab reports for users
router.get('/booking/lab-report/:role', ensureAuthorized("user"), async (req, res) => {
    try {
        console.log('Accessing lab-report/user API');
        console.log('Session user:', req.session.user);
        console.log('Query parameters:', req.query);
        
        const { otherPartyId } = req.query;
        const userId = req.session.user.id;
        
        console.log('IDs:', { userId, otherPartyId });

        if (!mongoose.Types.ObjectId.isValid(otherPartyId)) {
            console.error('Invalid dietitian ID:', otherPartyId);
            return res.status(400).json({ error: 'Invalid dietitian ID' });
        }

        // Convert string IDs to ObjectId
        const query = {
            userId: new mongoose.Types.ObjectId(userId),
            dietitianId: new mongoose.Types.ObjectId(otherPartyId)
        };
        
        console.log('MongoDB query:', query);
        
        const reports = await LabReport.find(query).sort({ createdAt: -1 });
        console.log('Found reports:', reports.length);
        console.log('Reports data:', JSON.stringify(reports, null, 2));

        res.json(reports);
    } catch (error) {
        console.error('Error fetching lab reports:', {
            message: error.message,
            stack: error.stack,
            query: req.query,
            session: req.session.user
        });
        res.status(500).json({ error: 'Failed to fetch lab reports' });
    }
});

// Route to download report files
router.get('/download-report/:reportId/:fieldName', ensureAuthorized("user"), async (req, res) => {
    try {
        console.log('Download request:', req.params);
        const { reportId, fieldName } = req.params;
        
        const report = await LabReport.findById(reportId);
        if (!report) {
            console.error('Report not found:', reportId);
            return res.status(404).send('Report not found');
        }

        const fileData = report[fieldName];
        if (!fileData || !fileData.data) {
            console.error('File not found in report:', fieldName);
            return res.status(404).send('File not found');
        }

        console.log('Sending file:', {
            filename: fileData.filename,
            contentType: fileData.contentType,
            size: fileData.data.length
        });

        res.set('Content-Type', fileData.contentType);
        res.set('Content-Disposition', `attachment; filename="${fileData.filename}"`);
        res.send(fileData.data);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).send('Server error');
    }
});

// Route for dietitians to download report files
router.get('/download-report-dietitian/:reportId/:fieldName', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        console.log('Dietitian download request:', req.params);
        const { reportId, fieldName } = req.params;
        
        const report = await LabReport.findById(reportId);
        if (!report) {
            console.error('Report not found:', reportId);
            return res.status(404).send('Report not found');
        }

        const fileData = report[fieldName];
        if (!fileData || !fileData.data) {
            console.error('File not found in report:', fieldName);
            return res.status(404).send('File not found');
        }

        console.log('Sending file to dietitian:', {
            filename: fileData.filename,
            contentType: fileData.contentType,
            size: fileData.data.length
        });

        res.set('Content-Type', fileData.contentType);
        res.set('Content-Disposition', `attachment; filename="${fileData.filename}"`);
        res.send(fileData.data);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).send('Server error');
    }
});

// Route to render lab report submission form
router.get('/submit-lab-report/:dietitianId', ensureAuthorized("user"), async (req, res) => {
    try {
        console.log('Accessing submit-lab-report form');
        const userId = req.session.user.id;
        const dietitianId = req.params.dietitianId;
        
        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found:', userId);
            return res.status(404).send('User not found');
        }

        // Get dietitian info
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            console.error('Dietitian not found:', dietitianId);
            return res.status(404).send('Dietitian not found');
        }

        console.log('Found user:', user.name);
        console.log('Found dietitian:', dietitian.name);

        res.render('Lab_user', {
            userId: userId,
            dietitianId: dietitianId,
            dietitianName: dietitian.name,
            userData: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                age: user.age,
                gender: user.gender
            }
        });
    } catch (error) {
        console.error('Error rendering lab report form:', error);
        res.status(500).send('Server error');
    }
});

// Route to handle lab report submission
router.post('/submit-lab-report', ensureAuthorized("user"), upload.fields([
    { name: 'generalHealthReport', maxCount: 1 },
    { name: 'bloodTestReport', maxCount: 1 },
    { name: 'diabetesThyroidReport', maxCount: 1 },
    { name: 'bloodPressureReport', maxCount: 1 },
    { name: 'cardiacHealthReport', maxCount: 1 },
    { name: 'hormonalProfileReport', maxCount: 1 }
]), handleMulterError, async (req, res) => {
    try {
        console.log('Starting lab report submission...');
        console.log('Session user:', req.session.user);
        
        const userId = req.session.user.id;
        console.log('User ID from session:', userId);

        const {
            dietitianId,
            name,
            gender,
            email,
            phone,
            address,
            dietPlan,
            currentWeight,
            targetWeight,
            activityLevel,
            bloodSugar,
            medication,
            thyroidLevel,
            cholesterol,
            bloodPressure,
            heartCondition,
            pregnancyStatus,
            hormonalIssues,
            skinType,
            hairType,
            digestiveIssue,
            foodAllergies
        } = req.body;

        console.log('Received form data:', {
            dietitianId,
            name,
            gender,
            email,
            dietPlan
        });

        if (!userId || !dietitianId) {
            console.error('Missing required IDs:', { userId, dietitianId });
            return res.status(400).json({ error: 'User ID and Dietitian ID are required' });
        }

        // Create a new lab report
        const labReport = new LabReport({
            userId,
            dietitianId,
            name,
            gender,
            email,
            phone,
            address,
            dietPlan,
            currentWeight,
            targetWeight,
            activityLevel,
            bloodSugar,
            medication,
            thyroidLevel,
            cholesterol,
            bloodPressure,
            heartCondition,
            pregnancyStatus,
            hormonalIssues,
            skinType,
            hairType,
            digestiveIssue,
            foodAllergies
        });

        console.log('Created lab report object:', labReport);

        // Handle file uploads
        if (req.files) {
            console.log('Processing uploaded files:', Object.keys(req.files));
            
            if (req.files.generalHealthReport) {
                console.log('Processing general health report');
                labReport.generalHealthReport = {
                    data: req.files.generalHealthReport[0].buffer,
                    contentType: req.files.generalHealthReport[0].mimetype,
                    filename: req.files.generalHealthReport[0].originalname
                };
            }
            if (req.files.bloodTestReport) {
                console.log('Processing blood test report');
                labReport.bloodTestReport = {
                    data: req.files.bloodTestReport[0].buffer,
                    contentType: req.files.bloodTestReport[0].mimetype,
                    filename: req.files.bloodTestReport[0].originalname
                };
            }
            if (req.files.diabetesThyroidReport) {
                console.log('Processing diabetes/thyroid report');
                labReport.diabetesThyroidReport = {
                    data: req.files.diabetesThyroidReport[0].buffer,
                    contentType: req.files.diabetesThyroidReport[0].mimetype,
                    filename: req.files.diabetesThyroidReport[0].originalname
                };
            }
            if (req.files.bloodPressureReport) {
                console.log('Processing blood pressure report');
                labReport.bloodPressureReport = {
                    data: req.files.bloodPressureReport[0].buffer,
                    contentType: req.files.bloodPressureReport[0].mimetype,
                    filename: req.files.bloodPressureReport[0].originalname
                };
            }
            if (req.files.cardiacHealthReport) {
                console.log('Processing cardiac health report');
                labReport.cardiacHealthReport = {
                    data: req.files.cardiacHealthReport[0].buffer,
                    contentType: req.files.cardiacHealthReport[0].mimetype,
                    filename: req.files.cardiacHealthReport[0].originalname
                };
            }
            if (req.files.hormonalProfileReport) {
                console.log('Processing hormonal profile report');
                labReport.hormonalProfileReport = {
                    data: req.files.hormonalProfileReport[0].buffer,
                    contentType: req.files.hormonalProfileReport[0].mimetype,
                    filename: req.files.hormonalProfileReport[0].originalname
                };
            }
        }

        console.log('Attempting to save lab report...');
        await labReport.save();
        console.log('Lab report saved successfully');
        
        res.status(200).json({ message: 'Lab report submitted successfully' });
    } catch (error) {
        console.error('Detailed error in lab report submission:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to submit lab report',
            details: error.message
        });
    }
});

// Route for dietitians to view report files in browser
router.get('/view-report-dietitian/:reportId/:fieldName', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        console.log('Dietitian view request:', req.params);
        const { reportId, fieldName } = req.params;
        
        const report = await LabReport.findById(reportId);
        if (!report) {
            console.error('Report not found:', reportId);
            return res.status(404).send('Report not found');
        }

        const fileData = report[fieldName];
        if (!fileData || !fileData.data) {
            console.error('File not found in report:', fieldName);
            return res.status(404).send('File not found');
        }

        console.log('Sending file to dietitian for viewing:', {
            filename: fileData.filename,
            contentType: fileData.contentType,
            size: fileData.data.length
        });

        res.set('Content-Type', fileData.contentType);
        res.set('Content-Disposition', `inline; filename="${fileData.filename}"`);
        res.send(fileData.data);
    } catch (error) {
        console.error('Error viewing report:', error);
        res.status(500).send('Server error');
    }
});


router.get('/view-report/:reportId/:fieldName', ensureAuthorized("user"), async (req, res) => {
    try {
        console.log('User view request:', req.params);
        const { reportId, fieldName } = req.params;
        const userId = req.session.user.id;

        const report = await LabReport.findById(reportId);
        if (!report) {
            console.error('Report not found:', reportId);
            return res.status(404).send('Report not found');
        }

        if (report.userId.toString() !== userId) {
            console.error('Unauthorized access to report:', reportId);
            return res.status(403).send('Unauthorized access');
        }

        const fileData = report[fieldName];
        if (!fileData || !fileData.data) {
            console.error('File not found in report:', fieldName);
            return res.status(404).send('File not found');
        }

        console.log('Sending file to user for viewing:', {
            filename: fileData.filename,
            contentType: fileData.contentType,
            size: fileData.data.length
        });

        res.set('Content-Type', fileData.contentType);
        res.set('Content-Disposition', `inline; filename="${fileData.filename}"`);
        res.send(fileData.data);
    } catch (error) {
        console.error('Error viewing report:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;