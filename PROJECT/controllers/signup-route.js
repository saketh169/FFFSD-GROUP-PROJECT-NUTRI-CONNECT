const express = require('express');
const router = express.Router();
const { User, Admin, Dietitian, Organization } = require('../models/userModel');
const multer = require('multer');

// Middleware to handle Multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: `Unexpected field: ${err.field}. Expected fields: ${JSON.stringify(req.route.path.includes('dietitian') ? dietitianFields : organizationFields)}`,
            });
        }
        return res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
    } else if (err.message === 'Invalid file type. Only JPEG, PNG, and PDF are allowed.') {
        console.error('File type error:', err.message);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
};

const dietitianFields = ['resume', 'degree_certificate', 'license_document', 'id_proof', 'experience_certificates', 'specialization_certifications', 'internship_certificate', 'research_papers'];
const organizationFields = ['org_logo', 'org_brochure', 'legal_document', 'tax_document', 'address_proof', 'business_license', 'authorized_rep_id', 'bank_document'];

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
        res.status(200).json({ success: true, message: 'User sign-up successful', user: { id: newUser._id, email: newUser.email, name: newUser.name } });
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
        res.status(200).json({ success: true, message: 'Admin sign-up successful', admin: { id: newAdmin._id, email: newAdmin.email, name: newAdmin.name } });
    } catch (err) {
        console.error('Error during admin sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Dietitian Sign-up Route (MongoDB with Multer)
signupRouter.post('/dietitian',  async (req, res) => {
    const { name, email, password, age, phone } = req.body;
    console.log('Received dietitian signup data:', req.body);

    if (!name || !email || !password || !age || !phone) {
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
            phone
        });

        await newDietitian.save();
        req.session.dietitian = { id: newDietitian._id, role: 'dietitian', email: newDietitian.email, name: newDietitian.name };
        res.status(200).json({ success: true, message: 'Dietitian sign-up successful', dietitian: { id: newDietitian._id, email: newDietitian.email, name: newDietitian.name } });
    } catch (err) {
        console.error('Error during dietitian sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Organization Sign-up Route (MongoDB with Multer)
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
        res.status(200).json({ success: true, message: 'Organization sign-up successful', organization: { id: newOrg._id, email: newOrg.email, org_name: newOrg.org_name } });
    } catch (err) {
        console.error('Error during organization sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});


// Sub-router for dashboard routes
const dashboardRouter = express.Router();

// User Dashboard Route
dashboardRouter.get('/user_dash', ensureAuthenticated, (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.render('dash_user', { title: 'User Dashboard', user });
});

// Dietitian Dashboard Route
dashboardRouter.get('/dietitian_dash', ensureAuthenticated, (req, res) => {
    const dietitian = req.session.dietitian;
    if (!dietitian) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.render('dash_dietitian', { title: 'Dietitian Dashboard', dietitian });
});

// Admin Dashboard Route
dashboardRouter.get('/admin_dash', ensureAuthenticated, (req, res) => {
    const admin = req.session.admin;
    if (!admin) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.render('dash_admin', { title: 'Admin Dashboard', admin });
});

// Organization Dashboard Route
dashboardRouter.get('/organization_dash', ensureAuthenticated, (req, res) => {
    const organization = req.session.organization;
    if (!organization) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.render('dash_organization', { title: 'Organization Dashboard', organization });
});

// Logout Route
dashboardRouter.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out, please try again' });
        }
        res.redirect('/login');
    });
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