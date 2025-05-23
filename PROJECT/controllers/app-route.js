const express = require("express");
const path = require("path");
const router = express.Router();
const { Question } = require('../models/chatModel');
const Blog = require('../models/blogModel');
const { Dietitian, Organization } = require('../models/userModel');
const mongoose = require('mongoose');
const { BookedSlots } = require('../models/bookingModel');

// Define the path to the public folder (outside the routes folder)
const publicPath = path.join(__dirname, '..', 'public'); // Adjust the relative path as needed

// Serve static files from the public folder
router.use(express.static(publicPath));

// ================= MIDDLEWARE =================

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
                <a href="/roles_signin">Go to Sign In</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } else {
      // User is not authenticated, redirect to sign-in page
      res.redirect("/roles_signin");
    }
  };
}

// Middleware to check if dietitian's final report is verified
async function ensureDietitianReportVerified(req, res, next) {
  try {
    const dietitian = await Dietitian.findById(req.session.dietitian?.id);
    if (!dietitian) {
      return res.redirect("/roles_signin");
    }

    const status = dietitian.verificationStatus.finalReport;
    if (status === "Verified") {
      return next();
    } else if (status === "Rejected") {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Rejected</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .modal {
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
            .modal-content {
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
          <div class="modal">
            <div class="modal-content">
              <h1>🚫 Access Denied</h1>
                <p>Your final report has been rejected. Please View your Evaluation Report .</p>
                <a href="/dietitian_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else if (status === "Not Received" ) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Pending</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .modal {
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
            .modal-content {
              background-color: #fff;
              padding: 2rem;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
              width: 100%;
            }
            h1 {
              color: #ffc107;
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
          <div class="modal">
            <div class="modal-content">
              <h1>⏳ Verification Pending</h1>
              <p>Your final report is still under review. Please try again later.</p>
              <a href="/dietitian_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      // Handle 'Not Received' or unexpected status
      return res.redirect("/roles_signin");
    }
  } catch (err) {
    console.error('Error checking dietitian report status:', err);
    res.status(500).send('Server error');
  }
}

// Middleware to check if organization's final report is verified
async function ensureOrganizationReportVerified(req, res, next) {
  try {
    const organization = await Organization.findById(req.session.organization?.id);
    if (!organization) {
      return res.redirect("/roles_signin");
    }

    const status = organization.verificationStatus.finalReport;
    if (status === "Verified") {
      return next();
    } else if (status === "Rejected") {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Rejected</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .modal {
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
            .modal-content {
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
          <div class="modal">
            <div class="modal-content">
              <h1>🚫 Access Denied</h1>
               <p>Your final report has been rejected. Please view your Evaluation Report .</p>
               <a href="/dietitian_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else if (status === "Not Received" ) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Pending</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .modal {
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
            .modal-content {
              background-color: #fff;
              padding: 2rem;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
              width: 100%;
            }
            h1 {
              color: #ffc107;
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
          <div class="modal">
            <div class="modal-content">
              <h1>⏳ Verification Pending</h1>
              <p>Your final report is still under review. Please try again later.</p>
              <a href="/organization_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      // Handle 'Not Received' or unexpected status
      return res.redirect("/roles_signin");
    }
  } catch (err) {
    console.error('Error checking organization report status:', err);
    res.status(500).send('Server error');
  }
}

// List of public routes
const publicRoutes = ["/", "/blog", "/contact", "/roles_signin", "/roles_signup", "/post", 
  "/submit", "/blog/:id" , "/blog-submit", "/Sign_in","/Sign_up" , "/chatbot" ,"/privacy-policy","/terms_conditions"];

// Middleware to check if the route is public or protected
router.use((req, res, next) => {
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes(":id")) {
      return req.path.startsWith(route.split(":id")[0]); 
    }
    return req.path === route;
  });

  if (isPublicRoute) {
    next();
  } else {
    ensureAuthenticated(req, res, next); 
  }
});

// ================= PUBLIC ROUTES =================

// Home page
router.get("/", (req, res) => {
  res.render("index"); 
});

// Chatbot Page
router.get("/chatbot", (req, res) => {
  res.render("chatbot");
});

// Chatbot Ask Route with Keyword-Based Matching
router.post("/chatbot/ask", async (req, res) => {
  let userMessage = req.body.message.toLowerCase().trim();
  // Remove punctuation from user input
  userMessage = userMessage.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, '');

  try {
      // Fetch all questions from the database
      const questions = await Question.find({});

      // Define common stop words to ignore
      const stopWords = new Set([
          'what', 'is', 'a', 'the', 'how', 'can', 'i', 'should', 'are', 'do',
          'for', 'in', 'to', 'with', 'on', 'of', 'my', 'more', 'get', 'eat'
      ]);

      // Process user message into keywords
      const userWords = userMessage.split(/\s+/);
      const userKeywords = userWords.filter(word => !stopWords.has(word) && word.length > 2);

      if (userKeywords.length === 0) {
          return res.json({ reply: "I’m not sure about that. Try asking something like 'What is a balanced diet?'" });
      }

      // Find the best matching question based on keyword overlap
      let bestMatch = null;
      let highestScore = 0;

      for (const q of questions) {
          // Remove punctuation from stored question and convert to lowercase
          const storedQuestion = q.question.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, '');
          const questionWords = storedQuestion.split(/\s+/);
          const questionKeywords = questionWords.filter(word => !stopWords.has(word) && word.length > 2);

          // Calculate the number of matching keywords
          let matchScore = 0;
          for (const userKeyword of userKeywords) {
              if (questionKeywords.includes(userKeyword)) {
                  matchScore++;
              }
          }

          // Update best match if this question has a higher score
          if (matchScore > highestScore) {
              highestScore = matchScore;
              bestMatch = q;
          }
      }

      if (bestMatch && highestScore > 0) {
          res.json({ reply: bestMatch.answer });
      } else {
          res.json({ reply: "I'm not sure about that. Try asking something like 'What is a balanced diet?'" });
      }
  } catch (err) {
      console.error('Error fetching chatbot response:', err);
      res.status(500).json({ reply: 'Sorry, something went wrong. Please try again!' });
  }
});

// Contact page
router.get("/contact", (req, res) => {
  res.render("contactus"); 
});

// Role sign-in page
router.get("/roles_signin", (req, res) => {
  res.render("roles_signin"); 
});

// Role sign-up page
router.get("/roles_signup", (req, res) => {
  res.render("roles_signup"); 
});

// Route to handle the role parameter
router.get('/Sign_in', (req, res) => {
  const role = req.query.role;
  res.render('Sign_in', { role });
});

// Route to handle the role parameter
router.get('/Sign_up', (req, res) => {
  const role = req.query.role;
  res.render('Sign_up', { role });
});

// ================= HEALTH SPECIALTY ROUTES =================

// Weight Management route
router.get("/weight-management", ensureAuthorized("user"), (req, res) => {
  res.render("weight-management");
});

// Diabetes/Thyroid route
router.get("/diabetes-thyroid", ensureAuthorized("user"), (req, res) => {
  res.render("diabetes-thyroid");
});

// Cardiac Health route
router.get("/cardiac-health", ensureAuthorized("user"), (req, res) => {
  res.render("cardiac-health");
});

// Women's Health route
router.get("/womens-health", ensureAuthorized("user"), (req, res) => {
  res.render("womens-health");
});

// Skin & Hair Care route
router.get("/skin-hair", ensureAuthorized("user"), (req, res) => {
  res.render("skin-hair");
});

// Gut Health route
router.get("/gut-health", ensureAuthorized("user"), (req, res) => {
  res.render("gut-health");
});

// ================= TERMS-CONDITIONS AND PRIVACY POLICY =================

// Terms and Conditions Page
router.get("/terms_conditions", (req, res) => {
  res.render("terms_conditions");
});

// Privacy Policy Page
router.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy");
});

// ================= PROTECTED ROUTES =================


// User routes
router.get('/user',ensureAuthorized("user"), async (req, res) => {
  try {
    // Fetch 3 random blog posts using $sample
    const blogs = await Blog.aggregate([
      { $match: { authorType: 'user' } },
      { $sample: { size: 3 } }
    ]);
   
    res.render('user', {
      blogs, 
    });

  } catch (error) {
    console.error('Error fetching random blogs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// User Guide
router.get("/user-guide", ensureAuthorized("user"), (req, res) => {
  res.render("guide_user");
});


// GET /user-consultations
router.get('/user-consultations', ensureAuthorized('user'), (req, res) => {
  const userId = req.session.user.id;
  console.log('Rendering consultations_user with userId:', userId);
  res.render('consultations_user', { userId });
});



// Pricing route
router.get("/pricing", ensureAuthorized("user"), (req, res) => {
  res.render("pricing"); 
});

router.get("/pricing_plan", ensureAuthorized("user"), (req, res) => {
  res.render("pricing_plan"); 
});

router.get("/payment", ensureAuthorized("user"), (req, res) => {
  res.render("payment"); 
});



// Dietitian routes
router.get('/dietitian', ensureAuthorized("dietitian"), async (req, res) => {
  try {
   
    const blogs = await Blog.aggregate([
      { $match: { authorType: 'dietitian' } },
      { $sample: { size: 3 } }
    ]);

    res.render('dietitian', {
      blogs, 
    });
  } catch (error) {
    console.error('Error fetching random dietitian blogs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Dietitian Guide route
router.get("/dietitian-guide", ensureAuthorized("dietitian"), (req, res) => {
  res.render("guide_dietitian");
});

// Dietitian Setup route
router.get("/dietitian-setup", ensureAuthorized("dietitian"), (req, res) => {
  res.render("dietitian_setup");
});


// GET /dietitian-consultations
router.get('/dietitian-consultations', ensureAuthorized('dietitian'), ensureDietitianReportVerified, (req, res) => {
  const dietitianId = req.session.dietitian.id;
  console.log('Rendering consultations_dietitian with dietitianId:', dietitianId);
  res.render('consultations_dietitian', { dietitianId });
});



// User Schedule Page

router.get("/user-schedule", ensureAuthorized("user"), async (req, res) => {
  try {
    const userId = req.session.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const bookings = await BookedSlots.find({ 
      userId: new mongoose.Types.ObjectId(userId),
      status: 'Booked'
    })
      .populate({
        path: 'dietitianId',
        select: 'name specialization profileImage',
        match: { isDeleted: false }
      })
      .sort({ date: 1, time: 1 });

    const bookingsByDay = {};
    bookings.forEach(booking => {
      if (!booking.dietitianId) {
        console.log(`Booking ${booking._id} has no valid dietitian (dietitianId: ${booking.dietitianId})`);
        return;
      }

      const date = new Date(booking.date);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!bookingsByDay[dayKey]) {
        bookingsByDay[dayKey] = [];
      }
      
      bookingsByDay[dayKey].push({
        id: booking._id,
        time: booking.time,
        date: booking.date,
        consultationType: booking.consultationType,
        dietitianName: booking.dietitianId.name || 'Unknown Dietitian',
        specialization: booking.dietitianId.specialization || 'General Nutrition',
        profileImage: booking.dietitianId.profileImage
          ? `data:image/jpeg;base64,${booking.dietitianId.profileImage.toString('base64')}`
          : null
      });
    });

    res.render("Schedule_user", { 
      bookingsByDay,
      userName: req.session.user.name || 'User' // Get name from session
    });
  } catch (error) {
    console.error('Error fetching user schedule:', error);
    res.status(500).send('Server error');
  }
});

// Dietitian Schedule Route
router.get("/dietitian-schedule", ensureAuthorized("dietitian"), ensureDietitianReportVerified, async (req, res) => {
  try {
    const dietitianId = req.session.dietitian.id;
    if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }

    const bookings = await BookedSlots.find({ 
      dietitianId: new mongoose.Types.ObjectId(dietitianId),
      status: 'Booked'
    })
      .populate({
        path: 'userId',
        select: 'name profileImage',
        match: { isDeleted: false }
      })
      .sort({ date: 1, time: 1 });

    const bookingsByDay = {};
    bookings.forEach(booking => {
      if (!booking.userId) {
        console.log(`Booking ${booking._id} has no valid user (userId: ${booking.userId})`);
        return;
      }

      const date = new Date(booking.date);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!bookingsByDay[dayKey]) {
        bookingsByDay[dayKey] = [];
      }
      
      bookingsByDay[dayKey].push({
        id: booking._id,
        time: booking.time,
        date: booking.date,
        consultationType: booking.consultationType,
        clientName: booking.userId.name || 'Unknown Client',
        profileImage: booking.userId.profileImage
          ? `data:image/jpeg;base64,${booking.userId.profileImage.toString('base64')}`
          : null
      });
    });

    res.render("Schedule_dietitian", { 
      bookingsByDay,
      dietitianName: req.session.dietitian.name || 'Dietitian' // Get name from session
    });
  } catch (error) {
    console.error('Error fetching dietitian schedule:', error);
    res.status(500).send('Server error');
  }
});


// API Route to fetch dietitian schedule in JSON format
router.get("/dietitian/today-schedule", ensureAuthorized("dietitian"), ensureDietitianReportVerified, async (req, res) => {
  try {
    const dietitianId = req.session.dietitian.id;
    if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }

    const bookings = await BookedSlots.find({ 
      dietitianId: new mongoose.Types.ObjectId(dietitianId),
      status: 'Booked'
    })
      .populate({
        path: 'userId',
        select: 'name profileImage',
        match: { isDeleted: false }
      })
      .sort({ date: 1, time: 1 });

    const bookingsByDay = {};
    bookings.forEach(booking => {
      if (!booking.userId) {
        console.log(`Booking ${booking._id} has no valid user (userId: ${booking.userId})`);
        return;
      }

      const date = new Date(booking.date);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!bookingsByDay[dayKey]) {
        bookingsByDay[dayKey] = [];
      }
      
      bookingsByDay[dayKey].push({
        id: booking._id,
        time: booking.time,
        date: booking.date,
        consultationType: booking.consultationType,
        clientName: booking.userId.name || 'Unknown Client',
        profileImage: booking.userId.profileImage
          ? `data:image/jpeg;base64,${booking.userId.profileImage.toString('base64')}`
          : null
      });
    });

    res.status(200).json({ 
      bookingsByDay,
      dietitianName: req.session.dietitian.name || 'Dietitian'
    });
  } catch (error) {
    console.error('Error fetching dietitian schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Admin routes
router.get("/admin", ensureAuthorized("admin"), (req, res) => {
  res.render("admin");
});

// Verify organization route
router.get("/verify_org", ensureAuthorized("admin"), (req, res) => {
  res.render("verify_org");
});

// Queries route
router.get("/queries", ensureAuthorized("admin"), (req, res) => {
  res.render("Queries");
});

router.get("/users", ensureAuthorized("admin"), (req, res) => {
  res.render("users");
});

router.get("/analytics", ensureAuthorized("admin"), (req, res) => {
  res.render("analytics");
});





// Organization routes
router.get("/organization", ensureAuthorized("organization"), (req, res) => {
  res.render("organization");
});

// Verify dietitian route
router.get("/verify_diet", ensureAuthorized("organization"), ensureOrganizationReportVerified, (req, res) => {
  res.render("verify_diet");
});

// Received organization route
router.get("/recieved_org", ensureAuthorized("organization"), (req, res) => {
  res.render("recieved_org");
});


// ================= USER SIDEBAR EXTRA ROUTES =================

// User Meal Plans Page
router.get("/user-meal-plans", ensureAuthorized("user"), (req, res) => {
  res.render("meal_user");
});


const Progress = require('../models/progressModel'); // Path to your Progress model


// GET /user-progress - Return JSON or render page
router.get('/user-progress', ensureAuthorized("user"), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const progress = await Progress.find({ userId: req.session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

  const totalEntries = await Progress.countDocuments({ userId: req.session.user.id });
  const totalPages = Math.ceil(totalEntries / limit);

  if (req.query.json === 'true') {
      // Return JSON for dashboard
      return res.json({ progress, currentPage: page, totalPages });
  }

  // Render progress page
  res.render('user-progress', {
      progressData: progress,
      currentPage: page,
      totalPages
  });
});



// POST /user-progress - Add a new progress entry
router.post('/user-progress', ensureAuthorized("user"), async (req, res) => {
  const { weight, waterIntake, goal } = req.body;

  // Validate required fields
  if (!weight || !waterIntake || !goal) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Validate input ranges
  if (weight < 20 || weight > 300 || waterIntake < 0 || waterIntake > 10 || goal.length > 50) {
    return res.status(400).json({ success: false, message: 'Invalid input values' });
  }

  try {
    const progress = new Progress({
      userId: req.session.user.id,
      weight,
      waterIntake,
      goal
    });
    await progress.save();

    // Return JSON response for AJAX requests
    return res.status(201).json({ success: true, message: 'Progress saved successfully', entry: progress });
  } catch (error) {
    console.error('Error saving progress:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /user-progress/:id - Delete a progress entry
router.delete('/user-progress/:id', ensureAuthorized("user"), async (req, res) => {
  try {
    const progress = await Progress.findOne({ _id: req.params.id, userId: req.session.user.id });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress entry not found' });
    }
    await Progress.deleteOne({ _id: req.params.id });
    return res.status(200).json({ success: true, message: 'Progress entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting progress:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});



// ================= DIETITIAN SIDEBAR EXTRA ROUTES =================

// Dietitian Meal Plans Page
router.get("/dietitian-meal-plans", ensureAuthorized("dietitian"), ensureDietitianReportVerified, (req, res) => {
  res.render("meal_dietitian");
});

// Dietitian Verification Status Page
router.get("/recieved_diet", ensureAuthorized("dietitian"), (req, res) => {
  res.render("recieved_diet");
});

// ================= DOCUMENT ROUTES =================


// Dietitian Document Page
router.get("/doc_dietitian", ensureAuthorized("dietitian"), (req, res) => {
  res.render("doc_dietitian");
});

// Organization Document Page
router.get("/doc_organization", ensureAuthorized("organization"), (req, res) => {
  res.render("doc_organization");
});

// 400 error route
router.get('/400', (req, res) => {
  res.status(400).render('400', { title: 'Bad Request | NutriConnect' });
});




// Export the router
module.exports = router;