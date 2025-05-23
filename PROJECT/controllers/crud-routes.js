const express = require('express');
const router = express.Router();
const { User, Dietitian, RemovedAccounts , Organization } = require('../models/userModel');
const mongoose = require('mongoose'); // Added for ObjectId validation
const DietPlan=require('../models/dietPlanModel');
// Enhanced authentication middleware
function ensureAuthenticated(req, res, next) {
    console.log('Session check:', req.session); // Debug session
    if (req.session && req.session.admin) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: Admin access required' });
}

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all active users
router.get('/users-list', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false })
            .select('name email phone dob gender address age createdAt')
            .sort({ createdAt: -1 });
        console.log('Users query result:', users); // Log the actual result
        console.log('Users fetched:', users.length); // Debug log
        res.json({ success: true, data: users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
}));

// GET all active dietitians
router.get('/dietitian-list', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        const dietitians = await Dietitian.find({ isDeleted: false })
            .select('name email age phone createdAt verificationStatus')
            .sort({ createdAt: -1 });
        console.log('Dietitians query result:', dietitians); // Log the actual result
        console.log('Dietitians fetched:', dietitians.length); // Debug log
        res.json({ success: true, data: dietitians });
    } catch (err) {
        console.error('Error fetching dietitians:', err);
        res.status(500).json({ success: false, message: 'Error fetching dietitians' });
    }
}));

// GET all removed accounts
router.get('/removed-accounts', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        const removedAccounts = await RemovedAccounts.find()
            .sort({ deletedAt: -1 });
        
        const formattedAccounts = removedAccounts.map(account => ({
            id: account._id,
            originalId: account.originalId,
            accountType: account.accountType,
            name: account.name,
            email: account.email,
            phone: account.phone,
            removedOn: account.deletedAt ? account.deletedAt.toISOString().split('T')[0] : 'N/A', // Use removedOn and handle null
            ...account.additionalData
        }));
        
        console.log('Removed accounts query result:', formattedAccounts); // Log the actual result
        console.log('Removed accounts fetched:', formattedAccounts.length); // Debug log
        res.json({ success: true, data: formattedAccounts });
    } catch (err) {
        console.error('Error fetching removed accounts:', err);
        res.status(500).json({ success: false, message: 'Error fetching removed accounts' });
    }
}));

// DELETE a user (soft delete)
router.delete('/users-list/:id', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        const user = await User.findOne({ _id: req.params.id, isDeleted: false });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isDeleted = true;
        await user.save();

        const deletedAccount = new RemovedAccounts({
            accountType: 'User',
            originalId: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            additionalData: {
                dob: user.dob,
                gender: user.gender,
                address: user.address,
                age: user.age
            }
        });

        console.log('Removed account to save:', deletedAccount); // Log before save
        await deletedAccount.save();
        console.log('Removed account saved:', deletedAccount._id); // Log after save
        console.log('Removed account deletedAt:', deletedAccount.deletedAt); // Debug date

        console.log('User deleted:', req.params.id); // Debug log
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, message: 'Error deleting user: ' + err.message });
    }
}));

// DELETE a dietitian (soft delete)
router.delete('/dietitian-list/:id', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid dietitian ID' });
        }
        const dietitian = await Dietitian.findOne({ _id: req.params.id, isDeleted: false });
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        dietitian.isDeleted = true;
        await dietitian.save();

        const deletedAccount = new RemovedAccounts({
            accountType: 'Dietitian',
            originalId: dietitian._id,
            name: dietitian.name,
            email: dietitian.email,
            phone: dietitian.phone,
            additionalData: {
                age: dietitian.age,
                verificationStatus: dietitian.verificationStatus
            }
        });

        console.log('Removed account to save:', deletedAccount); // Log before save
        await deletedAccount.save();
        console.log('Removed account saved:', deletedAccount._id); // Log after save
        console.log('Removed account deletedAt:', deletedAccount.deletedAt); // Debug date

        console.log('Dietitian deleted:', req.params.id); // Debug log
        res.json({ success: true, message: 'Dietitian deleted successfully' });
    } catch (err) {
        console.error('Error deleting dietitian:', err);
        res.status(500).json({ success: false, message: 'Error deleting dietitian: ' + err.message });
    }
}));

// POST restore an account
router.post('/removed-accounts/:id/restore', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.error('Invalid account ID:', req.params.id);
            return res.status(400).json({ success: false, message: 'Invalid account ID' });
        }
        const deletedAccount = await RemovedAccounts.findById(req.params.id);
        if (!deletedAccount) {
            console.error('Removed account not found:', req.params.id);
            return res.status(404).json({ success: false, message: 'Removed account not found' });
        }

        console.log('Found removed account:', deletedAccount);

        const accountType = deletedAccount.accountType.toLowerCase();
        if (accountType === 'user') {
            let user = await User.findById(deletedAccount.originalId);
            if (user) {
                user.isDeleted = false;
                await user.save();
                console.log('User restored:', user._id);
            } else {
                user = new User({
                    _id: deletedAccount.originalId,
                    name: deletedAccount.name,
                    email: deletedAccount.email,
                    phone: deletedAccount.phone,
                    dob: deletedAccount.additionalData.dob,
                    gender: deletedAccount.additionalData.gender,
                    address: deletedAccount.additionalData.address,
                    age: deletedAccount.additionalData.age,
                    password: 'temporary_password', // Consider a better approach for password
                    isDeleted: false
                });
                await user.save();
                console.log('New user created and restored:', user._id);
            }
        } else if (accountType === 'dietitian') {
            let dietitian = await Dietitian.findById(deletedAccount.originalId);
            if (dietitian) {
                dietitian.isDeleted = false;
                await dietitian.save();
                console.log('Dietitian restored:', dietitian._id);
            } else {
                dietitian = new Dietitian({
                    _id: deletedAccount.originalId,
                    name: deletedAccount.name,
                    email: deletedAccount.email,
                    phone: deletedAccount.phone,
                    age: deletedAccount.additionalData.age,
                    verificationStatus: deletedAccount.additionalData.verificationStatus || 'pending',
                    password: 'temporary_password', // Consider a better approach for password
                    isDeleted: false
                });
                await dietitian.save();
                console.log('New dietitian created and restored:', dietitian._id);
            }
        } else {
            console.error('Invalid account type:', accountType);
            return res.status(400).json({ success: false, message: 'Invalid account type' });
        }

        await deletedAccount.deleteOne();
        console.log('Removed account removed:', req.params.id);

        res.json({ success: true, message: 'Account restored successfully' });
    } catch (err) {
        console.error('Error restoring account:', err);
        res.status(500).json({ success: false, message: 'Error restoring account: ' + err.message });
    }
}));


// GET search removed accounts
router.get('/removed-accounts/search', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        const removedAccounts = await RemovedAccounts.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } },
                { accountType: { $regex: searchTerm, $options: 'i' } }
            ]
        }).sort({ deletedAt: -1 });

        const formattedAccounts = removedAccounts.map(account => ({
            id: account._id,
            originalId: account.originalId,
            accountType: account.accountType.toLowerCase(), // Ensure lowercase
            name: account.name,
            email: account.email,
            phone: account.phone,
            removedOn: account.deletedAt ? account.deletedAt.toISOString().split('T')[0] : 'N/A', // Use removedOn and handle null
            ...account.additionalData
        }));
        
        console.log('Removed accounts search query result:', formattedAccounts);
        console.log('Removed accounts searched:', formattedAccounts.length);
        res.json({ success: true, data: formattedAccounts });
    } catch (err) {
        console.error('Error searching removed accounts:', err);
        res.status(500).json({ success: false, message: 'Error searching removed accounts: ' + err.message });
    }
}));


// GET search users
router.get('/users-list/search', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        const users = await User.find({
            isDeleted: false,
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } }
            ]
        }).select('name email phone dob gender address age createdAt');
        console.log('Users search query result:', users); // Log the actual result
        console.log('Users searched:', users.length); // Debug log
        res.json({ success: true, data: users });
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ success: false, message: 'Error searching users' });
    }
}));

// GET search dietitians
router.get('/dietitian-list/search', ensureAuthenticated, asyncHandler(async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        const dietitians = await Dietitian.find({
            isDeleted: false,
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } }
            ]
        }).select('name email age phone createdAt verificationStatus');
        console.log('Dietitians search query result:', dietitians); // Log the actual result
        console.log('Dietitians searched:', dietitians.length); // Debug log
        res.json({ success: true, data: dietitians });
    } catch (err) {
        console.error('Error searching dietitians:', err);
        res.status(500).json({ success: false, message: 'Error searching dietitians' });
    }
}));

// Get count of verified organizations
router.get('/verifying-organizations', async (req, res) => {
  try {
    const count = await Organization.countDocuments({ 'verificationStatus.finalReport': 'Verified' });
    res.json({ success: true, data: count });
  } catch (error) {
    console.error('Error fetching verified organizations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch verified organizations' });
  }
});

// Get count of all dietitian diet plans
router.get('/active-diet-plans', async (req, res) => {
  try {
    const count = await DietPlan.countDocuments({});
    res.json({ success: true, data: count });
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch diet plans' });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Route error:', err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = router;
