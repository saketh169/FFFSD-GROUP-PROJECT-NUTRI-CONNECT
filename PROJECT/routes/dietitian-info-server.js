const express = require('express');
const router = express.Router();
const db = require('../server');

// Reusable function to display table data
function displayTableData(tableName) {
  db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
    if (err) {
      console.error(`Error fetching data from ${tableName}:`, err.message);
    } else {
      console.log(`${tableName} Table:`);
      // Display each row one by one
      rows.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
    }
  });
}


// Middleware to ensure role-based authorization
function ensureAuthorized(role) {
  return (req, res, next) => {
    // Check if the user is authenticated
    if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
      // Check if the session object matches the role
      if (
        (role === "user" && req.session.user) ||
        (role === "dietitian" && req.session.dietitian) ||
        (role === "admin" && req.session.admin) ||
        (role === "organization" && req.session.organization)
      ) {
        // User is authenticated and has the correct role, allow access
        next();
      } else {
            // User is not authorized for this role
            res.status(403).json({ 
              error: 'Unauthorized', 
              message: 'You do not have permission to access this resource.' 
          });
      }
    } else {
      // User is not authenticated, redirect to sign-in page
      res.redirect("/role_signin");
    }
  };
}


// POST route for dietitians to add extra details in table
router.post('/dietitians-info1', ensureAuthorized("dietitian"), (req, res) => {
  const { specialization, rating, image, location, mode, experience, fees, language } = req.body;
  const dietitian_id = req.session.dietitian.id;

  const query = `
    UPDATE dietitians
    SET specialization = ?,
        rating = ?,
        image = ?,
        location = ?,
        mode = ?,
        experience = ?,
        fees = ?,
        language = ?
    WHERE id = ?
  `;

  db.run(query, [specialization, rating, image, location, mode, experience, fees, language, dietitian_id], function (err) {
    if (err) {
      console.error('Error updating dietitians table:', err.message);
      return res.status(500).json({ error: err.message });
    }

    // Check if any rows were updated
    if (this.changes === 0) {
      console.log('No rows updated. Dietitian ID not found:', dietitian_id);
      return res.status(404).json({ error: 'Dietitian ID not found' });
    }

    console.log('Data updated in dietitians table for dietitian ID:', dietitian_id);
    res.json({ message: 'Data updated successfully', dietitian_id });

    // Display the updated dietitians table
    displayTableData('dietitians');
  });
});

// POST route for dietitians_info table
router.post('/dietitians-info2', ensureAuthorized("dietitian"), (req, res) => {
  const { title, description, specialties, education, expertise, testimonials } = req.body;
  const dietitian_id = req.session.dietitian.id;

  const query = `
    INSERT INTO dietitians_info (dietitian_id, title, description, specialties, education, expertise, testimonials)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [dietitian_id, title, description, specialties, education, expertise, testimonials], function (err) {
    if (err) {
      console.error('Error inserting into dietitians_info table:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Data inserted into dietitians_info table with ID:', this.lastID);
    res.json({ id: this.lastID });

    // Display the updated dietitians_info table
    displayTableData('dietitians_info');
  });
});

module.exports = router;