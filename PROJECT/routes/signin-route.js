const express = require('express');
const router = express.Router();
const db = require('../server'); 

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Unauthorized' });
}

// Sub-router for sign-in routes
const signinRouter = express.Router();

// User Sign-in Route
signinRouter.post('/user', (req, res) => {
  const { email, password } = req.body;
  console.log('Received user sign-in data:', req.body);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    if (!row) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Store user data in session
    req.session.user = row;
    res.status(200).json({ success: true, message: 'User sign-in successful', user: row });
  });
});

// Dietitian Sign-in Route
signinRouter.post('/dietitian', (req, res) => {
  const { email, password } = req.body;
  console.log('Received dietitian sign-in data:', req.body);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  db.get('SELECT * FROM dietitians WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    if (!row) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Store dietitian data in session
    req.session.dietitian = row;
    res.status(200).json({ success: true, message: 'Dietitian sign-in successful', dietitian: row });
  });
});

// Admin Sign-in Route
signinRouter.post('/admin', (req, res) => {
  const { email, password } = req.body;
  console.log('Received admin sign-in data:', req.body);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  db.get('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    if (!row) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Store admin data in session
    req.session.admin = row;
    res.status(200).json({ success: true, message: 'Admin sign-in successful', admin: row });
  });
});

// Organization Sign-in Route
signinRouter.post('/organization', (req, res) => {
  const { email, password } = req.body;
  console.log('Received organization sign-in data:', req.body);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  db.get('SELECT * FROM organizations WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    if (!row) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Store organization data in session
    req.session.organization = row;
    res.status(200).json({ success: true, message: 'Organization sign-in successful', organization: row });
  });
});

// Sub-router for dashboard routes
const dashboardRouter = express.Router();

// User Dashboard Route
dashboardRouter.get('/user_dash', ensureAuthenticated, (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Render the template and pass the user object
  res.render('dash_user', { title: 'User Dashboard', user: user });
});

// Dietitian Dashboard Route
dashboardRouter.get('/dietitian_dash', ensureAuthenticated, (req, res) => {
  const dietitian = req.session.dietitian;
  if (!dietitian) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  res.render('dash_dietitian', { title: 'Dietitian Dashboard', dietitian: dietitian });
});

// Admin Dashboard Route
dashboardRouter.get('/admin_dash', ensureAuthenticated, (req, res) => {
  const admin = req.session.admin;
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  res.render('dash_admin', { title: 'Admin Dashboard', admin: admin });
});

// Organization Dashboard Route
dashboardRouter.get('/organization_dash', ensureAuthenticated, (req, res) => {
  const organization = req.session.organization;
  if (!organization) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.render('dash_organization', { title: 'Organization Dashboard', organization: organization });
});



// Mount the sub-routers
router.use('/signin', signinRouter); // Sign-in routes under /signin
router.use('/', dashboardRouter); // Dashboard routes under /

module.exports = router;