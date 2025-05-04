
const express = require("express");
const path = require("path");
const router = express.Router();
const Question = require('../models/chatModel');




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
  res.render("weight-management"); // Renders weight_management.ejs
});

// Diabetes/Thyroid route
router.get("/diabetes-thyroid", ensureAuthorized("user"), (req, res) => {
  res.render("diabetes-thyroid"); // Renders diabetes_thyroid.ejs
});

// Cardiac Health route
router.get("/cardiac-health", ensureAuthorized("user"), (req, res) => {
  res.render("cardiac-health"); // Renders cardiac-health.ejs
});

// Women's Health route
router.get("/womens-health", ensureAuthorized("user"), (req, res) => {
  res.render("womens-health"); // Renders womens-health.ejs
});

// Skin & Hair Care route
router.get("/skin-hair", ensureAuthorized("user"), (req, res) => {
  res.render("skin-hair"); // Renders skin-hair.ejs
});

// Gut Health route
router.get("/gut-health", ensureAuthorized("user"), (req, res) => {
  res.render("gut-health"); // Renders gut-health.ejs
});


// ================= TERMS-CONDITIONS AND PRIVACY POLICY =================


// User Meal Plans Page
router.get("/terms_conditions", (req, res) => {
  res.render("terms_conditions"); // Render meal_user.ejs
});

// User Schedule Page
router.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy"); // Render Schedule_user.ejs
});



// ================= PROTECTED ROUTES =================

// User routes

router.get("/user", ensureAuthorized("user"), (req, res) => {
  res.render("user"); // Render user.ejs
});

// User Guide
router.get("/user-guide", ensureAuthorized("user"), (req, res) => {
  res.render("guide_user"); // Render guide_user.ejs
});

// User consultations route
router.get("/user-consultations", ensureAuthorized("user"), (req, res) => {
  res.render("consultations_user"); // Render consultations_user.ejs
});

// Chat and Medical Reports
router.get("/chat_user", ensureAuthorized("user"), (req, res) => {
  res.render("chat_user"); 
});

router.get("/Lab_user", ensureAuthorized("user"), (req, res) => {
  res.render("Lab_user"); 
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

router.get("/dietitian", ensureAuthorized("dietitian"), (req, res) => {
  res.render("dietitian"); // Render dietitian.ejs
});

// Dietitian Guide route
router.get("/dietitian-guide", ensureAuthorized("dietitian"), (req, res) => {
  res.render("guide_dietitian"); // Render guide_dietitian.ejs
});


// Dietitian Guide route
router.get("/dietitian-additional", ensureAuthorized("dietitian"), (req, res) => {
  res.render("dietitian_info(form)"); // Render guide_dietitian.ejs
});

// Dietitian consultations route
router.get("/dietitian-consultations", ensureAuthorized("dietitian"), (req, res) => {
  res.render("consultations_dietitian"); // Render consultations_dietitian.ejs
});


// Chat and Medical Reports
router.get("/chat_dietitian", ensureAuthorized("dietitian"), (req, res) => {
  res.render("chat_dietitian"); // Render consultations_user.ejs
});

router.get("/Lab_diet", ensureAuthorized("dietitian"), (req, res) => {
  res.render("Lab_diet"); // Render consultations_user.ejs
});

// Dietitian schedule route
router.get("/dietitian-schedule", ensureAuthorized("dietitian"), (req, res) => {
  res.render("Schedule_dietitian"); // Render Schedule_dietitian.ejs
});


// Admin routes

router.get("/admin", ensureAuthorized("admin"), (req, res) => {
  res.render("admin"); // Render admin.ejs
});

// Verify organization route
router.get("/verify_org", ensureAuthorized("admin"), (req, res) => {
  res.render("verify_org"); // Render verify_org.ejs
});

// Queries route
router.get("/queries", ensureAuthorized("admin"), (req, res) => {
  res.render("Queries"); // Render Queries.ejs
});


router.get("/users", ensureAuthorized("admin"), (req, res) => {
  res.render("users"); // Render Queries.ejs
});

router.get("/analytics", ensureAuthorized("admin"), (req, res) => {
  res.render("analytics"); // Render Queries.ejs
});



// Organization routes

router.get("/organization", ensureAuthorized("organization"), (req, res) => {
  res.render("organization"); // Render organization.ejs
});

// Verify dietitian route
router.get("/verify_diet", ensureAuthorized("organization"), (req, res) => {
  res.render("verify_diet"); // Render verify_diet.ejs
});

// Received organization route
router.get("/recieved_org", ensureAuthorized("organization"), (req, res) => {
  res.render("recieved_org"); // Render recieved_org.ejs
});


// ================= USER SIDEBAR EXTRA ROUTES =================

// User Meal Plans Page
router.get("/user-meal-plans", ensureAuthorized("user"), (req, res) => {
  res.render("meal_user"); // Render meal_user.ejs
});

// User Schedule Page
router.get("/user-schedule", ensureAuthorized("user"), (req, res) => {
  res.render("Schedule_user"); // Render Schedule_user.ejs
});


// ================= DIETITIAN SIDEBAR EXTRA ROUTES =================

// Dietitian Meal Plans Page
router.get("/dietitian-meal-plans", ensureAuthorized("dietitian"), (req, res) => {
  res.render("meal_dietitian"); // Render meal_dietitian.ejs
});


// Dietitian Verification Status Page
router.get("/recieved_diet", ensureAuthorized("dietitian"), (req, res) => {
  res.render("recieved_diet"); // Render recieved_diet.ejs
});


// ================= DOCUMENT ROUTES =================

// User Meal Plans Page
router.get("/doc_dietitian", ensureAuthorized("dietitian"), (req, res) => {
  res.render("doc_dietitian"); // Render meal_user.ejs
});

// User Schedule Page
router.get("/doc_organization", ensureAuthorized("organization"), (req, res) => {
  res.render("doc_organization"); // Render Schedule_user.ejs
});





// 400 error route
router.get('/400', (req, res) => {
  res.status(400).render('400', { title: 'Bad Request | NutriConnect' });
});



// Export the router
module.exports = router;