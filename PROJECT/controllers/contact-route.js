const express = require('express');
const router = express.Router();
const Query = require('../models/contactusModel');
require('dotenv').config();

// Enhanced authentication middleware
function ensureAuthenticated(req, res, next) {
  console.log('Session check:', req.session); // Debug session
  if (req.session && req.session.admin) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized: Admin access required' });
}

// Submit Contact Form
router.post('/contact', async (req, res) => {
  const { name, email, role, query } = req.body;
  console.log('Received contact form data:', { name, email, role, query });

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }

  try {
    const newQuery = new Query({
      name,
      email,
      role,
      query,
    });
    await newQuery.save();
    console.log('Query saved successfully:', newQuery);
    res.status(200).json({ success: true, message: 'Query submitted successfully', id: newQuery._id });
  } catch (err) {
    console.error('Error saving query:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
});

// Fetch All Queries (Pending and Replied)
router.get('/queries-list', ensureAuthenticated, async (req, res) => {
  console.log('Received GET request for /queries-list'); // Debug log
  try {
    console.log('Attempting to query database for all queries...');
    const queries = await Query.find({}).sort({ created_at: -1 });
    console.log('Queries fetched successfully:', queries.length);
    console.log('Query details:');
    if (queries.length === 0) {
      console.log('No queries found.');
    } else {
      queries.forEach((query, index) => {
        console.log(`Query ${index + 1}:`);
        console.log('  ID:', query._id);
        console.log('  Name:', query.name);
        console.log('  Email:', query.email);
        console.log('  Role:', query.role);
        console.log('  Query:', query.query);
        console.log('  Status:', query.status);
        console.log('  Created At:', query.created_at);
        console.log('  Updated At:', query.updated_at);
        if (query.admin_reply) {
          console.log('  Admin Reply:', query.admin_reply);
          console.log('  Replied At:', query.replied_at);
        }
        console.log('---');
      });
    }
    res.status(200).json({ success: true, data: queries });
  } catch (err) {
    console.error('Error fetching queries:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch queries.', error: err.message });
  }
});

// Submit Reply to a Query
router.put('/queries-list/:id/reply', ensureAuthenticated, async (req, res) => {
  const { admin_reply } = req.body;
  const { id } = req.params;

  console.log('Received reply request for query ID:', id, 'with reply:', admin_reply);

  if (!admin_reply) {
    console.error('Missing admin reply');
    return res.status(400).json({ success: false, message: 'Reply is required.' });
  }

  try {
    console.log('Attempting to update query with ID:', id);
    const updatedQuery = await Query.findByIdAndUpdate(
      id,
      {
        admin_reply,
        replied_at: new Date(),
        status: 'replied',
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuery) {
      console.error('Query not found:', id);
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    console.log('Query updated successfully:', updatedQuery);

    res.status(200).json({
      success: true,
      message: 'Reply submitted successfully',
      data: updatedQuery,
    });
  } catch (err) {
    console.error('Error processing reply:', err.stack);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to submit reply.', error: err.message });
  }
});

module.exports = router;