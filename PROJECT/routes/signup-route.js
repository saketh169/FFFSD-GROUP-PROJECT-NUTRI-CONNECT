const express = require('express');
const router = express.Router();
const db = require('../server'); // Import the in-memory SQLite database connection

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Unauthorized' });
}

// Sub-router for sign-up routes
const signupRouter = express.Router();

// User Sign-up Route
signupRouter.post('/user', (req, res) => {
  const { name, email, password, phone, dob, gender, address } = req.body;
  console.log('Received user signup data:', req.body);

  // Validate required fields
  if (!name || !email || !password || !phone || !dob || !gender || !address) {
    console.error('Missing required fields');
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Calculate age from DOB
  const dobDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDifference = today.getMonth() - dobDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  // Check if email already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Database error while checking email:', err.message);
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
    if (row) {
      console.error('Email already exists:', email);
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Insert new user into the database
    db.run(
      `INSERT INTO users (name, email, password, phone, dob, gender, address, age) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, phone, dob, gender, address, age],
      function (err) {
        if (err) {
          console.error('Database error while inserting user:', err.message);
          return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        // Fetch the newly created user
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
          if (err) {
            console.error('Database error while fetching user:', err.message);
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
          }

          // Store user data in session
          req.session.user = user;
          console.log('User sign-up successful:', user);
          res.status(200).json({ success: true, message: 'User sign-up successful', user: user });
        });
      }
    );
  });
});

// Dietitian Sign-up Route
signupRouter.post('/dietitian', (req, res) => {
  const { name, email, password, age, phone } = req.body;
  console.log('Received dietitian signup data:', req.body);

  if (!name || !email || !password || !age || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  db.get('SELECT * FROM dietitians WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    if (row) return res.status(400).json({ success: false, message: 'Email already exists' });

    db.run(
      `INSERT INTO dietitians (name, email, password, age, phone) VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, age, phone],
      function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });

        // Fetch the newly created dietitian
        db.get('SELECT * FROM dietitians WHERE id = ?', [this.lastID], (err, dietitian) => {
          if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });

          // Store dietitian data in session
          req.session.dietitian = dietitian;
          res.status(200).json({ success: true, message: 'Dietitian sign-up successful', dietitian: dietitian });
        });
      }
    );
  });
});

// Admin Sign-up Route
signupRouter.post('/admin', (req, res) => {
  const { name, email, password, adminKey, phone, dob, gender, address } = req.body;
  console.log('Received admin signup data:', req.body);

  // Validate required fields
  if (!name || !email || !password || !adminKey || !phone || !dob || !gender || !address) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Validate admin_key
  const DEFAULT_ADMIN_KEY = 'Nutri112233'; // Default admin key
  if (adminKey !== DEFAULT_ADMIN_KEY) {
    return res.status(400).json({ success: false, message: 'Invalid admin key.' });
  }

  // Check if email already exists
  db.get('SELECT * FROM admins WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
    if (row) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Insert new admin into the database
    db.run(
      `INSERT INTO admins (name, email, password, admin_key, phone, dob, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, adminKey, phone, dob, gender, address],
      function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        // Fetch the newly created admin
        db.get('SELECT * FROM admins WHERE id = ?', [this.lastID], (err, admin) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
          }

          // Store admin data in session
          req.session.admin = admin;
          res.status(200).json({ success: true, message: 'Admin sign-up successful', admin: admin });
        });
      }
    );
  });
});


// Organization Sign-up Route
signupRouter.post('/organization', (req, res) => {
  const { orgName, email, password, phone, address, orgId } = req.body;
  console.log('Received organization signup data:', req.body);

  if (!orgName || !email || !password || !phone || !address || !orgId) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  db.get('SELECT * FROM organizations WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    if (row) return res.status(400).json({ success: false, message: 'Email already exists' });

    db.run(
      `INSERT INTO organizations (org_Name, email, password, phone, address, org_Id) VALUES (?, ?, ?, ?, ?, ?)`,
      [orgName, email, password, phone, address, orgId],
      function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });

        // Fetch the newly created organization
        db.get('SELECT * FROM organizations WHERE id = ?', [this.lastID], (err, organization) => {
          if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });

          // Store organization data in session
          req.session.organization = organization;
          res.status(200).json({ success: true, message: 'Organization sign-up successful', organization: organization });
        });
      }
    );
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

// Logout Route
dashboardRouter.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out, please try again' });
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});

// Mount the sub-routers
router.use('/signup', signupRouter); // Sign-up routes under /signup
router.use('/', dashboardRouter); // Dashboard routes under /

module.exports = router;