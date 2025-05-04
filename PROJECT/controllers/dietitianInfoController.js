const express = require('express');
const router = express.Router();
const { DietitianInfo, Dietitian } = require('../models/userModel');
const Booking = require('../models/bookingModel');
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

// Get dietitian info by ID
router.get('/:id', ensureAuthorized('user'), async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    const dietitianInfo = await DietitianInfo.findOne({ dietitianId: req.params.id }).lean();
    if (!dietitianInfo) {
      return res.status(404).json({ error: 'Dietitian info not found' });
    }
    res.json(dietitianInfo);
  } catch (err) {
    console.error('Error fetching dietitian info:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available slots for a specific date
router.get('/:id/slots', ensureAuthorized('user'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid or missing date' });
    }
    const dietitian = await Dietitian.findById(id).select('slots isDeleted');
    if (!dietitian || dietitian.isDeleted) {
      return res.status(404).json({ error: 'Dietitian not found' });
    }
    const daySlots = (dietitian.slots || []).find(s => s.date === date) || { slots: [] };
    const bookings = await Booking.find({ dietitianId: id, date, status: 'active' }).select('time');
    const booked = bookings.map(b => b.time);
    const available = daySlots.slots.filter(slot => !booked.includes(slot));
    res.json({ available, booked });
  } catch (err) {
    console.error('Error fetching slots:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});



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
          // User is authenticated but does not have the correct role
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
        // User is not authenticated, redirect to sign-in page
        res.redirect("/role_signin");
      }
    };
  }
  

// Get user's bookings with the dietitian
router.get('/:id/user-bookings', ensureAuthorized('user'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const bookings = await Booking.find({
      dietitianId: id,
      userId: req.session.user.id,
      status: 'active'
    }).lean();
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching user bookings:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Book a slot
router.post('/:id/book', ensureAuthorized('user'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date or time' });
    }
    // Prevent booking past dates
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ error: 'Cannot book past dates' });
    }
    const dietitian = await Dietitian.findById(id).select('slots isDeleted');
    if (!dietitian || dietitian.isDeleted) {
      return res.status(404).json({ error: 'Dietitian not found' });
    }
    const daySlots = (dietitian.slots || []).find(s => s.date === date);
    if (!daySlots || !daySlots.slots.includes(time)) {
      return res.status(400).json({ error: 'Slot not available' });
    }
    const existingBooking = await Booking.findOne({ dietitianId: id, date, time, status: 'active' });
    if (existingBooking) {
      return res.status(400).json({ error: 'Slot already booked' });
    }
    const booking = new Booking({
      dietitianId: id,
      userId: req.session.user.id,
      date,
      time
    });
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error('Error booking slot:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel a booking
router.post('/:id/cancel-booking/:bookingId', ensureAuthorized('user'), async (req, res) => {
  try {
    const { id, bookingId } = req.params;
    if (!validateObjectId(id) || !validateObjectId(bookingId)) {
      return res.status(400).json({ error: 'Invalid dietitian or booking ID' });
    }
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const booking = await Booking.findOne({
      _id: bookingId,
      dietitianId: id,
      userId: req.session.user.id
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error cancelling booking:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add testimonial (supports JSON and form data)
router.post('/add-testimonial', ensureAuthorized('user'), async (req, res) => {
  try {
    const { dietitianId, text, rating } = req.body;
    if (!validateObjectId(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    if (!req.session?.user?.id || !req.session?.user?.name) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const parsedRating = parseInt(rating);
    if (!text || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Invalid testimonial data' });
    }
    const dietitian = await Dietitian.findById(dietitianId).select('isDeleted');
    if (!dietitian || dietitian.isDeleted) {
      return res.status(404).json({ error: 'Dietitian not found' });
    }
    const dietitianInfo = await DietitianInfo.findOne({ dietitianId });
    if (!dietitianInfo) {
      return res.status(404).json({ error: 'Dietitian info not found' });
    }
    dietitianInfo.testimonials = dietitianInfo.testimonials || [];
    dietitianInfo.testimonials.push({
      text,
      author: req.session.user.name,
      rating: parsedRating,
      userId: req.session.user.id
    });
    await dietitianInfo.save();
    // Update dietitian rating (average of testimonials)
    const avgRating = dietitianInfo.testimonials.reduce((sum, t) => sum + t.rating, 0) / dietitianInfo.testimonials.length;
    await Dietitian.findByIdAndUpdate(dietitianId, { rating: avgRating.toFixed(1) });
    res.json({
      success: true,
      testimonial: dietitianInfo.testimonials[dietitianInfo.testimonials.length - 1]
    });
  } catch (err) {
    console.error('Error adding testimonial:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update detailed info (supports form data)
router.put('/detailed', ensureAuthorized('dietitian'), async (req, res) => {
  try {
    const {
      title,
      description,
      specialties,
      education,
      expertise,
      certifications,
      awards,
      publications,
      languages
    } = req.body;
    const dietitianId = req.session?.dietitian?.id;
    if (!validateObjectId(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    // Parse arrays if sent as JSON strings or arrays
    const parsedSpecialties = safeParseJSON(specialties) || specialties || [];
    const parsedEducation = safeParseJSON(education) || education || [];
    const parsedExpertise = safeParseJSON(expertise) || expertise || [];
    const parsedCertifications = safeParseJSON(certifications) || certifications || [];
    const parsedAwards = safeParseJSON(awards) || awards || [];
    const parsedPublications = safeParseJSON(publications) || publications || [];
    const parsedLanguages = safeParseJSON(languages) || languages || [];
    const updatedInfo = await DietitianInfo.findOneAndUpdate(
      { dietitianId },
      {
        title,
        description,
        specialties: Array.isArray(parsedSpecialties) ? parsedSpecialties : [],
        education: Array.isArray(parsedEducation) ? parsedEducation : [],
        expertise: Array.isArray(parsedExpertise) ? parsedExpertise : [],
        certifications: Array.isArray(parsedCertifications) ? parsedCertifications : [],
        awards: Array.isArray(parsedAwards) ? parsedAwards : [],
        publications: Array.isArray(parsedPublications) ? parsedPublications : [],
        languages: Array.isArray(parsedLanguages) ? parsedLanguages : []
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({
      message: 'Detailed info updated successfully',
      info: updatedInfo
    });
  } catch (err) {
    console.error('Error updating dietitian info:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update availability
router.put('/availability', ensureAuthorized('dietitian'), async (req, res) => {
  try {
    const { workingDays, workingHours } = req.body;
    const dietitianId = req.session?.dietitian?.id;
    if (!validateObjectId(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    // Parse arrays/objects if sent as JSON strings
    const parsedWorkingDays = safeParseJSON(workingDays) || workingDays || [];
    const parsedWorkingHours = safeParseJSON(workingHours) || workingHours || [];
    const updatedInfo = await DietitianInfo.findOneAndUpdate(
      { dietitianId },
      { availability: { workingDays: parsedWorkingDays, workingHours: parsedWorkingHours } },
      { new: true, runValidators: true }
    );
    if (!updatedInfo) {
      return res.status(404).json({ error: 'Dietitian info not found' });
    }
    res.json({
      message: 'Availability updated successfully',
      availability: updatedInfo.availability
    });
  } catch (err) {
    console.error('Error updating availability:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update consultation types
router.put('/consultation-types', ensureAuthorized('dietitian'), async (req, res) => {
  try {
    const { consultationTypes } = req.body;
    const dietitianId = req.session?.dietitian?.id;
    if (!validateObjectId(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    // Parse array if sent as JSON string
    const parsedConsultationTypes = safeParseJSON(consultationTypes) || consultationTypes || [];
    const updatedInfo = await DietitianInfo.findOneAndUpdate(
      { dietitianId },
      { consultationTypes: Array.isArray(parsedConsultationTypes) ? parsedConsultationTypes : [] },
      { new: true, runValidators: true }
    );
    if (!updatedInfo) {
      return res.status(404).json({ error: 'Dietitian info not found' });
    }
    res.json({
      message: 'Consultation types updated successfully',
      consultationTypes: updatedInfo.consultationTypes
    });
  } catch (err) {
    console.error('Error updating consultation types:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update social media
router.put('/social-media', ensureAuthorized('dietitian'), async (req, res) => {
  try {
    const { socialMedia } = req.body;
    const dietitianId = req.session?.dietitian?.id;
    if (!validateObjectId(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }
    // Parse object if sent as JSON string
    const parsedSocialMedia = safeParseJSON(socialMedia) || socialMedia || {};
    const updatedInfo = await DietitianInfo.findOneAndUpdate(
      { dietitianId },
      { socialMedia: parsedSocialMedia },
      { new: true, runValidators: true }
    );
    if (!updatedInfo) {
      return res.status(404).json({ error: 'Dietitian info not found' });
    }
    res.json({
      message: 'Social media links updated successfully',
      socialMedia: updatedInfo.socialMedia
    });
  } catch (err) {
    console.error('Error updating social media links:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;