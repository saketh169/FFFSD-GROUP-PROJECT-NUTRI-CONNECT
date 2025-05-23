const express = require('express');
const router = express.Router();
const { User, Admin, Dietitian, Organization } = require('../models/userModel');

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.user || req.session.admin || req.session.dietitian || req.session.organization) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
}

// Sub-router for sign-up routes
const signupRouter = express.Router();

// User Sign-up Route (MongoDB)
signupRouter.post('/user', async (req, res) => {
    const { name, email, password, phone, dob, gender, address } = req.body;
    console.log('Received user signup data:', req.body);

    if (!name || !email || !password || !phone || !dob || !gender || !address) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newUser = new User({ name, email, password, phone, dob, gender, address, age });
        await newUser.save();

        req.session.user = { id: newUser._id, role: 'user', email: newUser.email, name: newUser.name };
        res.status(200).json({
            success: true,
            message: 'User sign-up successful',
            user: { id: newUser._id, email: newUser.email, name: newUser.name },
        });
    } catch (err) {
        console.error('Error during user sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Admin Sign-up Route (MongoDB)
signupRouter.post('/admin', async (req, res) => {
    const { name, email, password, adminKey, phone, dob, gender, address } = req.body;
    console.log('Received admin signup data:', req.body);

    if (!name || !email || !password || !adminKey || !phone || !dob || !gender || !address) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const DEFAULT_ADMIN_KEY = 'Nutri112233';
    if (adminKey !== DEFAULT_ADMIN_KEY) {
        return res.status(400).json({ success: false, message: 'Invalid admin key.' });
    }

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newAdmin = new Admin({ name, email, password, admin_key: adminKey, phone, dob, gender, address });
        await newAdmin.save();

        req.session.admin = { id: newAdmin._id, role: 'admin', email: newAdmin.email, name: newAdmin.name };
        res.status(200).json({
            success: true,
            message: 'Admin sign-up successful',
            admin: { id: newAdmin._id, email: newAdmin.email, name: newAdmin.name },
        });
    } catch (err) {
        console.error('Error during admin sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Dietitian Sign-up Route (MongoDB)
signupRouter.post('/dietitian', async (req, res) => {
    const { name, email, password, age, phone, licenseNumber } = req.body;
    console.log('Received dietitian signup data:', req.body);

    if (!name || !email || !password || !age || !phone || !licenseNumber) {
        return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    try {
        const existingDietitian = await Dietitian.findOne({ email });
        if (existingDietitian) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newDietitian = new Dietitian({
            name,
            email,
            password,
            age,
            phone,
            licenseNumber
        });

        await newDietitian.save();
        req.session.dietitian = { id: newDietitian._id, role: 'dietitian', email: newDietitian.email, name: newDietitian.name };
        res.status(200).json({
            success: true,
            message: 'Dietitian sign-up successful',
            dietitian: { id: newDietitian._id, email: newDietitian.email, name: newDietitian.name },
        });
    } catch (err) {
        console.error('Error during dietitian sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Organization Sign-up Route (MongoDB)
signupRouter.post('/organization', async (req, res) => {
    const { org_name, email, password, phone, address, org_id } = req.body;
    console.log('Received organization signup data:', req.body);

    if (!org_name || !email || !password || !phone || !address || !org_id) {
        return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    try {
        const existingOrg = await Organization.findOne({ email });
        if (existingOrg) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newOrg = new Organization({ org_name, email, password, phone, address, org_id });
        await newOrg.save();

        req.session.organization = { id: newOrg._id, role: 'organization', email: newOrg.email, org_name: newOrg.org_name };
        res.status(200).json({
            success: true,
            message: 'Organization sign-up successful',
            organization: { id: newOrg._id, email: newOrg.email, org_name: newOrg.org_name },
        });
    } catch (err) {
        console.error('Error during organization sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Sub-router for dashboard routes
const dashboardRouter = express.Router();

const Progress = require('../models/progressModel');

// User Dashboard Route
dashboardRouter.get('/user_dash', ensureAuthenticated, async (req, res) => {
    const userSession = req.session.user;
    if (!userSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Fetch full user data from MongoDB
        const user = await User.findById(userSession.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Convert profileImage Buffer to base64 if it exists
        user.profileImageBase64 = user.profileImage
            ? `data:image/jpeg;base64,${user.profileImage.toString('base64')}`
            : null;

        // Fetch progress data for the user (latest 4 entries)
        const progressData = await Progress.find({ userId: userSession.id })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        res.render('dash_user', { title: 'User Dashboard', user, progressData });
    } catch (err) {
        console.error('Error fetching user or progress data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Dietitian Dashboard Route
dashboardRouter.get('/dietitian_dash', ensureAuthenticated, async (req, res) => {
    const dietitianSession = req.session.dietitian;
    if (!dietitianSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Fetch full dietitian data from MongoDB
        const dietitian = await Dietitian.findById(dietitianSession.id).select('-password').lean();
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }
        // Convert profileImage Buffer to base64 if it exists
        dietitian.profileImageBase64 = dietitian.profileImage
            ? `data:image/jpeg;base64,${dietitian.profileImage.toString('base64')}`
            : null;
        res.render('dash_dietitian', { title: 'Dietitian Dashboard', dietitian });
    } catch (err) {
        console.error('Error fetching dietitian data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Admin Dashboard Route
dashboardRouter.get('/admin_dash', ensureAuthenticated, async (req, res) => {
    const adminSession = req.session.admin;
    if (!adminSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Fetch full admin data from MongoDB
        const admin = await Admin.findById(adminSession.id).select('-password').lean();
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        // Convert profileImage Buffer to base64 if it exists
        admin.profileImageBase64 = admin.profileImage
            ? `data:image/jpeg;base64,${admin.profileImage.toString('base64')}`
            : null;
        res.render('dash_admin', { title: 'Admin Dashboard', admin });
    } catch (err) {
        console.error('Error fetching admin data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Organization Dashboard Route
dashboardRouter.get('/organization_dash', ensureAuthenticated, async (req, res) => {
    const organizationSession = req.session.organization;
    if (!organizationSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Fetch full organization data from MongoDB
        const organization = await Organization.findById(organizationSession.id).select('-password').lean();
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        // Convert profileImage Buffer to base64 if it exists
        organization.profileImageBase64 = organization.profileImage
            ? `data:image/jpeg;base64,${organization.profileImage.toString('base64')}`
            : null;
        res.render('dash_organization', { title: 'Organization Dashboard', organization });
    } catch (err) {
        console.error('Error fetching organization data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});


// Mount the sub-routers
router.use('/signup', signupRouter);
router.use('/', dashboardRouter);

// Global error handler
router.use((err, req, res, next) => {
    console.error('Global error:', err.stack);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

module.exports = router;