
const express = require('express');
const { User, Admin, Organization, Dietitian } = require('../models/userModel');

const router = express.Router();

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    next();
  } else {
    res.redirect("/roles_signin");
  }
}

// Middleware to ensure role-based authorization
function ensureAuthorized(role) {
  return (req, res, next) => {
    if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
      if (
        (role === "user" && req.session.user) ||
        (role === "dietitian" && req.session.dietitian) ||
        (role === "admin" && req.session.admin) ||
        (role === "organization" && req.session.organization)
      ) {
        next();
      } else {
        res.status(403).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unauthorized Access</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
              }
              .unauthorized-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
              }
              .unauthorized-content {
                background-color: #fff;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                width: 100%;
              }
              h1 {
                color: #dc3545;
                font-size: 2rem;
                margin-bottom: 1rem;
              }
              p {
                color: #6c757d;
                font-size: 1rem;
                margin-bottom: 2rem;
              }
              a {
                text-decoration: none;
                color: #fff;
                background-color: #007bff;
                padding: 0.75rem 1.5rem;
                border-radius: 5px;
                font-size: 1rem;
                transition: background-color 0.3s ease;
              }
              a:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="unauthorized-modal">
              <div class="unauthorized-content">
                <h1>🚫 Unauthorized Access</h1>
                <p>You do not have permission to access this page.</p>
                <a href="/roles_signin">Go to Sign In</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } else {
      res.redirect("/roles_signin");
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

// Allowed fields for updates
const allowedFields = {
  user: ['name', 'email', 'phone', 'dob', 'gender', 'address', 'age'],
  admin: ['name', 'email', 'phone', 'dob', 'gender', 'address', 'admin_key'],
  dietitian: ['name', 'email', 'phone', 'age', 'interestedField', 'degreeType', 'licenseIssuer', 'idProofType', 'specializationDomain'],
  organization: ['org_name', 'email', 'phone', 'address', 'org_id']
};

// Render edit profile page with entity data
const renderEditProfile = async (req, res, role, sessionKey) => {
  try {
    const entity = await req.model.findById(req.session[sessionKey].id).select('-password -profileImage -files').lean();
    if (!entity) {
      console.error(`${role} not found for ID:`, req.session[sessionKey].id);
      return res.status(404).render('error', { message: `${role} not found`, error: `${role} not found` });
    }
    console.log(`${role} profile data:`, entity);
    const profile = {
      _id: entity._id?.toString() || '',
      name: entity.name || entity.org_name || '',
      email: entity.email || '',
      phone: entity.phone || '',
      dob: entity.dob ? new Date(entity.dob).toISOString().split('T')[0] : '',
      gender: entity.gender || '',
      address: entity.address || '',
      age: entity.age || '',
      admin_key: entity.admin_key || '',
      org_id: entity.org_id || '',
      interestedField: entity.interestedField || '',
      degreeType: entity.degreeType || '',
      licenseIssuer: entity.licenseIssuer || '',
      idProofType: entity.idProofType || '',
      specializationDomain: entity.specializationDomain || ''
    };
    res.render('edit-profile', { profile, role });
  } catch (error) {
    console.error(`Error fetching ${role} profile:`, error);
    res.status(500).render('error', { message: 'Server error', error: error.message });
  }
};

// Update entity profile
const updateProfile = async (req, res, role, sessionKey) => {
  try {
    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields[role].includes(key)) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    if (updates.email && updates.email !== req.session[sessionKey].email) {
      const existingEntity = await req.model.findOne({ email: updates.email });
      if (existingEntity) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const entity = await req.model.findByIdAndUpdate(
      req.session[sessionKey].id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -profileImage -files');

    req.session[sessionKey] = {
      id: entity._id,
      email: entity.email,
      name: entity.name || entity.org_name
    };

    res.json({ success: true, message: 'Profile updated successfully', profile: entity });
  } catch (error) {
    console.error(`Error updating ${role} profile:`, error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// User Routes
router.get('/user_dash/edit-profile', ensureAuthenticated, ensureAuthorized('user'), validateUser, (req, res) => renderEditProfile(req, res, 'user', 'user'));
router.post('/user_dash/update-profile', ensureAuthenticated, ensureAuthorized('user'), validateUser, (req, res) => updateProfile(req, res, 'user', 'user'));

// Admin Routes
router.get('/admin_dash/edit-profile', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, (req, res) => renderEditProfile(req, res, 'admin', 'admin'));
router.post('/admin_dash/update-profile', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, (req, res) => updateProfile(req, res, 'admin', 'admin'));

// Dietitian Routes
router.get('/dietitian_dash/edit-profile', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, (req, res) => renderEditProfile(req, res, 'dietitian', 'dietitian'));
router.post('/dietitian_dash/update-profile', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, (req, res) => updateProfile(req, res, 'dietitian', 'dietitian'));

// Organization Routes
router.get('/organization_dash/edit-profile', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, (req, res) => renderEditProfile(req, res, 'organization', 'organization'));
router.post('/organization_dash/update-profile', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, (req, res) => updateProfile(req, res, 'organization', 'organization'));

module.exports = router;
