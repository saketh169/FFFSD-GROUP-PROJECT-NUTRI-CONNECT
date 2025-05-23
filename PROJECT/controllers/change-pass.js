const express = require('express');
const bcrypt = require('bcrypt');
const { User, Admin, Dietitian, Organization } = require('../models/userModel');
const router = express.Router();

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    next();
  } else {
    res.redirect('/roles_signin');
  }
}

// Middleware to ensure role-based authorization
function ensureAuthorized(role) {
  return (req, res, next) => {
    if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
      if (
        (role === 'user' && req.session.user) ||
        (role === 'dietitian' && req.session.dietitian) ||
        (role === 'admin' && req.session.admin) ||
        (role === 'organization' && req.session.organization)
      ) {
        next();
      } else {
        res.status(403).render('error', {
          message: 'Unauthorized Access',
          error: 'You do not have permission to access this page.',
          backLink: '/roles_signin',
          backLinkText: 'Go to Sign In'
        });
      }
    } else {
      res.redirect('/roles_signin');
    }
  };
}

// Middleware to validate entities
const validateUser = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not a user' });
  }
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    req.model = User;
    req.entity = user;
    next();
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const validateAdmin = async (req, res, next) => {
  if (!req.session.admin) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not an admin' });
  }
  try {
    const admin = await Admin.findById(req.session.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    req.model = Admin;
    req.entity = admin;
    next();
  } catch (error) {
    console.error('Error validating admin:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const validateDietitian = async (req, res, next) => {
  if (!req.session.dietitian) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not a dietitian' });
  }
  try {
    const dietitian = await Dietitian.findById(req.session.dietitian.id);
    if (!dietitian) {
      return res.status(404).json({ success: false, message: 'Dietitian not found' });
    }
    req.model = Dietitian;
    req.entity = dietitian;
    next();
  } catch (error) {
    console.error('Error validating dietitian:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const validateOrganization = async (req, res, next) => {
  if (!req.session.organization) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not an organization' });
  }
  try {
    const organization = await Organization.findById(req.session.organization.id);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    req.model = Organization;
    req.entity = organization;
    next();
  } catch (error) {
    console.error('Error validating organization:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Render change password page
const renderChangePassword = (req, res, role) => {
  const validRoles = ['user', 'dietitian', 'admin', 'organization'];
  if (!validRoles.includes(role)) {
    return res.status(400).render('error', {
      message: 'Invalid Role',
      error: 'The specified role is not valid.',
      backLink: '/roles_signin',
      backLinkText: 'Go to Sign In'
    });
  }
  res.render('change-pass', { role });
};

// Verify current password
const verifyPass = async (req, res) => {
  const { currentPassword } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is required' });
  }

  try {
    const isMatch = await bcrypt.compare(currentPassword, req.entity.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }
    res.json({ success: true, message: 'Password verified' });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update password
const updatePass = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  try {
    const isMatch = await bcrypt.compare(currentPassword, req.entity.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await req.model.findByIdAndUpdate(
      req.entity._id,
      { password: hashedPassword },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// User Routes
router.get('/user_dash/change-pass', ensureAuthenticated, ensureAuthorized('user'), validateUser, (req, res) => renderChangePassword(req, res, 'user'));
router.post('/user_dash/verify-pass', ensureAuthenticated, ensureAuthorized('user'), validateUser, verifyPass);
router.post('/user_dash/update-pass', ensureAuthenticated, ensureAuthorized('user'), validateUser, updatePass);

// Admin Routes
router.get('/admin_dash/change-pass', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, (req, res) => renderChangePassword(req, res, 'admin'));
router.post('/admin_dash/verify-pass', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, verifyPass);
router.post('/admin_dash/update-pass', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, updatePass);

// Dietitian Routes
router.get('/dietitian_dash/change-pass', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, (req, res) => renderChangePassword(req, res, 'dietitian'));
router.post('/dietitian_dash/verify-pass', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, verifyPass);
router.post('/dietitian_dash/update-pass', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, updatePass);

// Organization Routes
router.get('/organization_dash/change-pass', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, (req, res) => renderChangePassword(req, res, 'organization'));
router.post('/organization_dash/verify-pass', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, verifyPass);
router.post('/organization_dash/update-pass', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, updatePass);

module.exports = router;