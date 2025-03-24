const express = require('express');
const router = express.Router();
const db = require('../server'); // Adjust the path to your db file

// Handle form submission
router.post('/contact', (req, res) => {
 
  const { name, email, role, query } = req.body;
  console.log('Submitted Form Data:', { name, email, role, query });

  const sql = `INSERT INTO queries (name, email, role, query) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, email, role, query], function(err) {
    if (err) {
      console.error('Error inserting query into database:', err.message); // Log the error
      return res.status(500).json({ error: err.message });
    }
    console.log('Query inserted successfully with ID:', this.lastID); // Log the success
    res.status(200).json({ message: 'Query submitted successfully!', id: this.lastID });
  });
});

module.exports = router;