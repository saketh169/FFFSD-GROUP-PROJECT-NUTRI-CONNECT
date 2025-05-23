const express = require('express');
const router = express.Router();
const { DietitianInfo, Dietitian } = require('../models/userModel');
const mongoose = require('mongoose');

// Middleware for form data and JSON
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Validate ObjectId
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Safe JSON parsing
const safeParseJSON = (str) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : str;
  } catch (err) {
    return null;
  }
};

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
                <a href="/role_signin">Go to Sign In</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } else {
      res.redirect('/role_signin');
    }
  };
}

// Get dietitian info by ID
router.get('/dietitians/:id', ensureAuthorized('user'), async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    const dietitianInfo = await DietitianInfo.findOne({ dietitianId: req.params.id }).lean();
    if (!dietitianInfo) {
      return res.status(404).json({ error: 'Dietitian information not found' });
    }
    const dietitian = await Dietitian.findById(req.params.id).lean();
    if (!dietitian) {
      return res.status(404).json({ error: 'Dietitian not found' });
    }
    // Merge Dietitian and DietitianInfo data
    res.json({ ...dietitianInfo, ...dietitian });
  } catch (err) {
    console.error('Error fetching dietitian information:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * @route POST /dietitians/:id/testimonials
 * @desc Submit a new testimonial for a dietitian
 * @access User
 */
router.post('/dietitians/:id/testimonials', ensureAuthorized('user'), async (req, res) => {
  try {
    const { id } = req.params;
    const { testimonialText, testimonialRating } = req.body;

    // Validate ObjectId
    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }

    // Validate input
    if (!testimonialText || typeof testimonialText !== 'string' || testimonialText.trim() === '') {
      return res.status(400).json({ error: 'Testimonial text is required and must be a non-empty string' });
    }
    const rating = parseInt(testimonialRating, 10);
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    // Find DietitianInfo document
    const dietitianInfo = await DietitianInfo.findOne({ dietitianId: id });
    if (!dietitianInfo) {
      return res.status(404).json({ error: 'Dietitian information not found' });
    }

    // Get user name from session (assuming session.user contains user data)
    const author = req.session.user.name || 'Anonymous';

    // Add new testimonial
    const newTestimonial = {
      text: testimonialText.trim(),
      author,
      rating
    };

    dietitianInfo.testimonials.push(newTestimonial);

    // Save updated document
    await dietitianInfo.save();

    res.status(201).json({ message: 'Testimonial submitted successfully', testimonial: newTestimonial });
  } catch (err) {
    console.error('Error submitting testimonial:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;