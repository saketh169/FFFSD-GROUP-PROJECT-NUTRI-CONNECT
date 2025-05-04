const express = require('express');
const multer = require('multer');
const { User, Admin, Dietitian, Organization } = require('../models/userModel'); // Adjust path to your userModel file

const router = express.Router();

// Configure Multer for memory storage (to keep file in memory as Buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: fileFilter
});

// Route to upload profile image for User
router.post('/uploaduser', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const userId = req.session.user?.id; // Assuming authentication middleware provides user ID
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User must be authenticated' });
        }

        // Store image as Buffer in the database
        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading user profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
});

// Route to upload profile image for Admin
router.post('/uploadadmin', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const adminId = req.session.admin?.id; // Assuming authentication middleware provides admin ID
        if (!adminId) {
            return res.status(401).json({ success: false, message: 'Admin must be authenticated' });
        }

        // Store image as Buffer in the database
        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading admin profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
});

// Route to upload profile image for Dietitian
router.post('/uploaddietitian', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const dietitianId = req.session.dietitian?.id; // Assuming authentication middleware provides dietitian ID
        if (!dietitianId) {
            return res.status(401).json({ success: false, message: 'Dietitian must be authenticated' });
        }

        // Store image as Buffer in the database
        const dietitian = await Dietitian.findByIdAndUpdate(
            dietitianId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading dietitian profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
});

// Route to upload profile image for Organization
router.post('/uploadorganization', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const orgId = req.session.organization?.id; // Assuming authentication middleware provides organization ID
        if (!orgId) {
            return res.status(401).json({ success: false, message: 'Organization must be authenticated' });
        }

        // Store image as Buffer in the database
        const organization = await Organization.findByIdAndUpdate(
            orgId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading organization profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
});

module.exports = router;