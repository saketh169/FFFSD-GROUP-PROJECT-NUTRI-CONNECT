const express = require("express");
const path = require("path");
const multer = require("multer"); 
const fs = require("fs");
const router = express.Router();
const projectPath = path.join(__dirname, "..");

// Serve static files from the project root
router.use(express.static(projectPath));

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(projectPath, "upload"); 
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
   
    const sanitizedFileName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + sanitizedFileName); 
  },
});

const upload = multer({ storage: storage });


// Default blog posts (these will appear when the server starts)
let blogs = [
  {
      title: "10 Weight Loss Tips",
      content: "Here are 10 effective weight loss tips: 1. Drink plenty of water. 2. Eat more protein. 3. Avoid sugary drinks. 4. Exercise regularly. 5. Get enough sleep. 6. Reduce stress. 7. Eat more fiber. 8. Practice portion control. 9. Avoid processed foods. 10. Track your progress.",
      image: "https://media.licdn.com/dms/image/v2/D4E12AQEx5l2fZykY1g/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1670062385901?e=2147483647&v=beta&t=LtKVEzpyNrAGpQ5DFhVtHPyk9J-Rw5MiId6tu18bVj8" // External URL
  },
  {
      title: "Healthy Eating Habits",
      content: "Learn about balanced diets and portion control. A balanced diet includes a variety of foods: fruits, vegetables, whole grains, lean proteins, and healthy fats. Portion control helps prevent overeating and ensures you consume the right amount of nutrients.",
      image: "https://i0.wp.com/images-prod.healthline.com/hlcmsresource/images/AN_images/healthy-eating-ingredients-1296x728-header.jpg?w=1155&h=1528" // External URL
  },
  {
      title: "The Benefits of Yoga",
      content: "Yoga is a great way to improve flexibility, strength, and mental clarity. It combines physical postures, breathing exercises, and meditation to promote overall well-being. Regular practice can reduce stress, improve posture, and boost energy levels.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqp_TAuXW1yv0S0Ubp7_kUznTEO_2uTLCQeQ&s" // External URL
  },
  {
      title: "5 Morning Routines for a Productive Day",
      content: "Start your day right with these 5 morning routines: 1. Wake up early. 2. Drink a glass of water. 3. Exercise or stretch. 4. Eat a healthy breakfast. 5. Plan your day. These habits can help you stay focused and energized throughout the day.",
      image: "https://img.freepik.com/free-photo/young-woman-training-outdoors-autumn-sunshine-concept-sport_155003-42585.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid" // Local image (to be stored in 'upload')
  },
  {
      title: "How to Stay Motivated to Exercise",
      content: "Staying motivated to exercise can be challenging. Here are some tips: 1. Set realistic goals. 2. Find a workout buddy. 3. Mix up your routine. 4. Track your progress. 5. Reward yourself. Remember, consistency is key to achieving your fitness goals.",
      image: "https://img.freepik.com/premium-photo/focused-man-checking-his-sports-watch-while-jogging-by-city-waterfront_283470-11070.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid" // Local image (to be stored in 'upload')
  },
  {
      title: "The Importance of Mental Health",
      content: "Mental health is just as important as physical health. Practice self-care by getting enough sleep, eating well, exercising, and seeking support when needed. Mindfulness and meditation can also help reduce stress and improve mental clarity.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZGM9d9EW-EMZfFUtMfK1bbF21PfLQmJal_Q&s" // External URL
  },
  {
      title: "Top 5 Superfoods for Energy",
      content: "Boost your energy levels with these superfoods: 1. Blueberries. 2. Spinach. 3. Quinoa. 4. Almonds. 5. Chia seeds. These nutrient-rich foods provide sustained energy and support overall health.",
      image: "https://img.freepik.com/free-photo/buddha-bowl-dish-with-vegetables-legumes-top-view_1150-42589.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid" // Local image (to be stored in 'upload')
  },
  {
      title: "How to Build a Home Workout Routine",
      content: "You don't need a gym to stay fit. Create a home workout routine with bodyweight exercises like push-ups, squats, lunges, and planks. Add cardio with jumping jacks or running in place. Consistency is key to seeing results.",
      image: "https://img.freepik.com/free-photo/full-shot-man-doing-yoga-mat_23-2149249455.jpg?t=st=1742235099~exp=1742238699~hmac=d12f6abecdbdc0a78fc46f0720e70ea56b14e2128d390aee87cfdec722d8ed73&w=1380" // Local image (to be stored in 'upload')
  },
  {
      title: "The Science of Sleep",
      content: "Sleep is essential for physical and mental health. Aim for 7-9 hours of quality sleep each night. Create a bedtime routine, avoid screens before bed, and keep your sleep environment cool and dark for better rest.",
      image: "https://img.freepik.com/premium-photo/asleep-young-arab-man-sleeping-resting-peacefully-comfortable-bed-lying-with-closed-eyes-free_922936-69017.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid" // Local image (to be stored in 'upload')
  },
  {
      title: "Hydration and Its Benefits",
      content: "Staying hydrated is crucial for overall health. Water helps regulate body temperature, supports digestion, and improves skin health. Aim to drink at least 8 glasses of water a day, and more if you're active.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZGM9d9EW-EMZfFUtMfK1bbF21PfLQmJal_Q&s" // External URL
  }
];


// ================= MIDDLEWARE =================

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    next();
  } else {
    res.redirect("/role_signin");
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

// List of public routes
const publicRoutes = ["/", "/blog", "/contact", "/role_signin", "/role_signup", "/post", "/submit", "/blog/:id"];

// Middleware to check if the route is public or protected
router.use((req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    next();
  } else {
    ensureAuthenticated(req, res, next);
  }
});

// ================= PUBLIC ROUTES =================

// Home page
router.get("/", (req, res) => {
  res.sendFile(path.join(projectPath, "index.html"));
});

// Blog page
router.get("/blog", (req, res) => {
  res.render("blog", { blogs: blogs }); // Render the blog page with EJS
});

// Contact page
router.get("/contact", (req, res) => {
  res.sendFile(path.join(projectPath, "Contactus.html"));
});

// Role sign-in page
router.get("/role_signin", (req, res) => {
  res.sendFile(path.join(projectPath, "roles_signin.html"));
});

// Role sign-up page
router.get("/role_signup", (req, res) => {
  res.sendFile(path.join(projectPath, "roles_signup.html"));
});


// Render the "Post a Blog" page
router.get("/post", (req, res) => {
  res.render("post"); // Render the post page with EJS
});

// Handle new blog submissions
router.post("/submit", upload.single("image"), (req, res) => {
  const { title, content, imageUrl } = req.body;
  let image = "";

  // If a file is uploaded, use the file path
  if (req.file) {
    console.log("Uploaded File:", req.file); // Log the uploaded file details
    image = `/upload/${req.file.filename}`; // Path to the uploaded file
  } else if (imageUrl) {
    // If an external URL is provided, use it
    image = imageUrl;
  }

  // Validate required fields
  if (title.trim() === "" || content.trim() === "") {
    return res.redirect("/post"); // Redirect back if fields are empty
  }

  // Add new blog post to the list
  blogs.push({ title, content, image });

  // Redirect to home page after posting
  res.redirect("/blog");
});

// Serve images from the 'upload' folder
router.use("/upload", express.static(path.join(projectPath, "upload")));

// Render a single blog post
router.get("/blog/:id", (req, res) => {
  const blogId = req.params.id;
  const blog = blogs[blogId];

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  res.render("single-blog", { blog });
});

// ================= PROTECTED ROUTES =================

// User routes
router.get("/user", ensureAuthorized("user"), (req, res) => {
  res.sendFile(path.join(projectPath, "user.html"));
});

// User Guide
router.get("/user-guide", ensureAuthorized("user"), (req, res) => {
  res.sendFile(path.join(projectPath, "guide_user.html"));
});


// Dietitian profiles route
router.get('/dietitian-profiles', ensureAuthorized("user") , (req, res) => {
  res.sendFile(path.join(projectPath, 'dietitian_profiles.html'));
});

// Dietitian info route
router.get('/dietitian-profiles/:id', ensureAuthorized("user"), (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).render('400', { title: 'Bad Request | NutriConnect' });
  }

  const dietitian = dietitians.find(d => d.id === id);
  if (!dietitian) {
    return res.status(404).render('404', { title: 'Not Found | NutriConnect' });
  }

  res.render('dietitian_info', {
    title: `${dietitian.name} | NutriConnect`,
    dietitian: dietitian
  });
});


router.get("/user-consultations", ensureAuthorized("user"), (req, res) => {
  res.sendFile(path.join(projectPath, "consultations_user.html"));
});

router.get("/pricing", ensureAuthorized("user"), (req, res) => {
  res.sendFile(path.join(projectPath, "pricing.html"));
});

// Dietitian routes
router.get("/dietitian", ensureAuthorized("dietitian"), (req, res) => {
  res.sendFile(path.join(projectPath, "dietitian.html"));
});

router.get("/dietitian-guide", ensureAuthorized("dietitian"), (req, res) => {
  res.sendFile(path.join(projectPath, "guide_dietitian.html"));
});

router.get("/dietitian-consultations", ensureAuthorized("dietitian"), (req, res) => {
  res.sendFile(path.join(projectPath, "consultations_dietitian.html"));
});

router.get("/dietitian-schedule", ensureAuthorized("dietitian"), (req, res) => {
  res.sendFile(path.join(projectPath, "Schedule_dietitian.html"));
});

// Admin routes
router.get("/admin", ensureAuthorized("admin"), (req, res) => {
  res.sendFile(path.join(projectPath, "admin.html"));
});

router.get("/verify_org", ensureAuthorized("admin"), (req, res) => {
  res.sendFile(path.join(projectPath, "verify_org.html"));
});

router.get("/queries", ensureAuthorized("admin"), (req, res) => {
  res.sendFile(path.join(projectPath, "Queries.html"));
});

// Organization routes
router.get("/organization", ensureAuthorized("organization"), (req, res) => {
  res.sendFile(path.join(projectPath, "organization.html"));
});

router.get("/verify_diet", ensureAuthorized("organization"), (req, res) => {
  res.sendFile(path.join(projectPath, "verify_diet.html"));
});

router.get("/recieved_org", ensureAuthorized("organization"), (req, res) => {
  res.sendFile(path.join(projectPath, "recieved_org.html"));
});



const dietitians = [
    {
      "id": 1, 
      "name": "Dr. Anjali Sharma",
      "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
      "title": "Skin and Hair Care Specialist",
      "description": "Dr. Anjali Sharma has over 7 years of experience in dermatology and nutrition, specializing in skin and hair care. She provides personalized dietary plans to enhance skin health and promote hair growth.",
      "specialties": ["Skin Health", "Hair Care", "Nutritional Dermatology"],
      "education": [
        "M.S. in Dermatology",
        "Certified Nutrition Specialist (CNS)"
      ],
      "expertise": [
        "Skin Health Nutrition",
        "Hair Growth Diets",
        "Anti-Aging Nutrition",
        "Holistic Dermatology"
      ],
      "testimonials": [
        {
          "text": "Dr. Anjali's dietary advice has significantly improved my skin texture and reduced hair fall. Highly recommend her expertise!",
          "author": "Riya M."
        },
        {
          "text": "Her personalized approach and deep knowledge made all the difference in my skin and hair health.",
          "author": "Ananya S."
        }
      ],
      "location": "Mumbai",
      "mode": "online",
      "experience": 7,
      "fees": 1500,
      "language": ["English", "Hindi", "Telugu"]
    },
    {
      "id": 2,  
      "name": "Dr. Priya Singh",
      "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
      "title": "PCOS Nutrition Specialist",
      "description": "Dr. Priya Singh specializes in managing Polycystic Ovary Syndrome (PCOS) through tailored nutrition plans. With 5 years of experience, she helps women balance hormones and improve overall health.",
      "specialties": ["PCOS Management", "Hormonal Balance", "Women's Health"],
      "education": [
        "M.S. in Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Certified in Women's Health Nutrition"
      ],
      "expertise": [
        "PCOS Diet Plans",
        "Hormonal Health",
        "Weight Management for Women",
        "Fertility Nutrition"
      ],
      "testimonials": [
        {
          "text": "Dr.Priya's guidance helped me manage my PCOS symptoms effectively. Her diet plans are easy to follow and highly effective.",
          "author": "Sneha R."
        },
        {
          "text": "I feel more in control of my health thanks to Dr. Priya's expertise and support.",
          "author": "Kavita P."
        }
      ],
      "location": "Hyderabad",
      "mode": "offline, online",
      "experience": 5,
      "fees": 1000,
      "language": ["English", "Hindi"]
    },
    {
      "id": 3,
      "name": "Dr. Vikas Gupta",
      "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
      "title": "Thyroid Care Specialist",
      "description": "Dr. Vikas Gupta focuses on thyroid health and provides evidence-based nutrition plans to manage thyroid disorders. With 3 years of experience, he has helped numerous clients improve their thyroid function.",
      "specialties": ["Thyroid Management", "Metabolic Health", "Weight Control"],
      "education": [
        "M.S. in Clinical Nutrition",
        "Registered Dietitian Nutritionist (RDN)"
      ],
      "expertise": [
        "Thyroid Diet Plans",
        "Hypothyroidism Management",
        "Hyperthyroidism Nutrition",
        "Metabolic Syndrome"
      ],
      "testimonials": [
        {
          "text": "Dr. Vikas's diet plan helped me manage my hypothyroidism effectively. I feel more energetic and healthier.",
          "author": "Rahul S."
        },
        {
          "text": "His expertise in thyroid care is unmatched. Highly recommend him for anyone struggling with thyroid issues.",
          "author": "Priya K."
        }
      ],
      "location": "Pune",
      "mode": "offline",
      "experience": 3,
      "fees": 800,
      "language": ["Hindi"]
    },
    {
      "id": 4,
      "name": "Dr. Deepak Chowdary",
      "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
      "title": "Weight Loss Specialist",
      "description": "Dr. Deepak Chowdary has 7 years of experience in weight management and specializes in creating sustainable weight loss plans. His holistic approach ensures long-term results.",
      "specialties": ["Weight Loss", "Obesity Management", "Metabolic Health"],
      "education": [
        "Ph.D. in Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Certified Obesity Specialist"
      ],
      "expertise": [
        "Weight Loss Programs",
        "Obesity Management",
        "Metabolic Syndrome",
        "Sustainable Diet Plans"
      ],
      "testimonials": [
        {
          "text": "Dr. Chowdary's weight loss program helped me shed 20 kgs in a healthy and sustainable way. Highly recommend him!",
          "author": "Arjun Thakur."
        },
        {
          "text": "His approach is practical and effective. I finally found a diet plan that works for me.",
          "author": "Suman Aiyer."
        }
      ],
      "location": "Chennai",
      "mode": "offline",
      "experience": 7,
      "fees": 2000,
      "language": ["Telugu", "Hindi", "English", "Tamil"]
    },
    {
      "id": 5,
      "name": "Dr. Shriya Patel",
      "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
      "title": "Pregnancy Care Specialist",
      "description": "Dr. Shriya Patel specializes in maternal and prenatal nutrition, ensuring the health of both mother and baby. With 1 year of experience, she provides tailored nutrition plans for pregnant women.",
      "specialties": ["Pregnancy Nutrition", "Maternal Health", "Postpartum Care"],
      "education": [
        "M.S. in Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Certified in Maternal Nutrition"
      ],
      "expertise": [
        "Prenatal Nutrition",
        "Postpartum Recovery",
        "Lactation Support",
        "Healthy Pregnancy Diets"
      ],
      "testimonials": [
        {
          "text": "Mam Shriya's guidance during my pregnancy was invaluable. Her diet plans kept me and my baby healthy.",
          "author": "Anjali R."
        },
        {
          "text": "Her expertise in pregnancy nutrition is exceptional. I felt confident and well-supported throughout my journey.",
          "author": "Meera K."
        }
      ],
      "location": "Tanjavur",
      "mode": "offline",
      "experience": 1,
      "fees": 500,
      "language": ["Telugu", "Hindi", "Tamil"]
    },
    {
      "id": 6,
      "name": "Dr. Laura Sen",
      "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
      "title": "Cardiac Health Nutrition Specialist",
      "description": "Dr. Laura Sen has 7 years of experience in cardiac nutrition, helping clients manage heart health through tailored diet plans. Her expertise ensures optimal cardiovascular health.",
      "specialties": ["Cardiac Health", "Cholesterol Management", "Heart Disease Prevention"],
      "education": [
        "Ph.D. in Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Certified in Cardiac Nutrition"
      ],
      "expertise": [
        "Heart-Healthy Diets",
        "Cholesterol Control",
        "Hypertension Management",
        "Cardiac Rehabilitation"
      ],
      "testimonials": [
        {
          "text": "Dr. Sen's diet plan helped me lower my cholesterol levels significantly. Her expertise is unmatched.",
          "author": "Rajesh P."
        },
        {
          "text": "I feel more confident about my heart health thanks to Dr. Laura's guidance.",
          "author": "Sonia M."
        }
      ],
      "location": "Vijayawada",
      "mode": "online",
      "experience": 7,
      "fees": 1800,
      "language": ["Telugu"]
    },
    {
      "id": 7,
      "name": "Dr. Reyansh Gupta",
      "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
      "title": "Cholesterol Control Specialist",
      "description": "Dr. Reyansh Gupta specializes in cholesterol management and metabolic health. With 3 years of experience, he provides effective nutrition plans to improve lipid profiles.",
      "specialties": ["Cholesterol Control", "Metabolic Health", "Weight Management"],
      "education": [
        "M.S. in Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Certified in Lipid Management"
      ],
      "expertise": [
        "Cholesterol-Lowering Diets",
        "Metabolic Syndrome",
        "Weight Loss Programs",
        "Heart Health"
      ],
      "testimonials": [
        {
          "text": "Dr. Gupta's diet plan helped me lower my cholesterol levels naturally. Highly recommend his expertise!",
          "author": "Vikram Seth."
        },
        {
          "text": "His approach is practical and effective. I feel healthier and more energetic.",
          "author": "Neha Rachit."
        }
      ],
      "location": "Bangalore",
      "mode": "offline, online",
      "experience": 3,
      "fees": 700,
      "language": ["Hindi", "English"]
    },
    {
      "id": 8,
      "name": "Dr. Bhaskar Rao",
      "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
      "title": "Weight Loss Specialist",
      "description": "Dr. Bhaskar Rao has 7 years of experience in weight management and specializes in creating sustainable weight loss plans. His holistic approach ensures long-term results.",
      "specialties": ["Weight Loss", "Obesity Management", "Metabolic Health"],
      "education": [
        "Ph.D. in Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Certified Obesity Specialist"
      ],
      "expertise": [
        "Weight Loss Programs",
        "Obesity Management",
        "Metabolic Syndrome",
        "Sustainable Diet Plans"
      ],
      "testimonials": [
        {
          "text": "Dr. Rao's weight loss program helped me achieve my goals in a healthy and sustainable way. Highly recommend him!",
          "author": "Suresh K."
        },
        {
          "text": "His approach is practical and effective. I finally found a diet plan that works for me.",
          "author": "Latha R."
        }
      ],
      "location": "Warangal",
      "mode": "offline",
      "experience": 7,
      "fees": 2000,
      "language": ["Telugu", "Hindi", "English"]
    },
    {
      "id": 9,
      "name": "Dr. Rahul Sharma",
      "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
      "title": "Sports Nutrition Specialist",
      "description": "Dr. Rahul Sharma specializes in sports nutrition, helping athletes optimize their performance and recovery. With 5 years of experience, he provides tailored nutrition plans for all fitness levels.",
      "specialties": ["Sports Nutrition", "Performance", "Recovery"],
      "education": [
        "M.S. in Sports Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Certified Specialist in Sports Dietetics (CSSD)"
      ],
      "expertise": [
        "Athletic Performance Nutrition",
        "Muscle Building",
        "Race/Event Preparation",
        "Recovery Optimization"
      ],
      "testimonials": [
        {
          "text": "Dr. Sharma's nutrition plan helped me improve my marathon time by 15 minutes. His knowledge of sports nutrition is unmatched.",
          "author": "David K., Marathon Runner"
        },
        {
          "text": "As a professional athlete, nutrition is critical to my performance. Dr. Rahul's guidance has been instrumental in taking my game to the next level.",
          "author": "Lisa M., Professional Tennis Player"
        }
      ],
      "location": "Delhi",
      "mode": "online",
      "experience": 5,
      "fees": 1100,
      "language": ["English", "Hindi"]
    },
    {
      "id": 10,
      "name": "Dr. Neha Reddy",
      "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
      "title": "Pediatric Nutrition Specialist",
      "description": "Dr. Neha Reddy is passionate about child nutrition and helping families establish healthy eating habits. She works with children of all ages, from infancy through adolescence.",
      "specialties": ["Pediatric Nutrition", "Family Meal Planning", "Food Allergies"],
      "education": [
        "M.S. in Nutrition",
        "Registered Dietitian Nutritionist (RDN)",
        "Board Certified Specialist in Pediatric Nutrition"
      ],
      "expertise": [
        "Childhood Nutrition",
        "Food Allergies & Intolerances",
        "Picky Eating",
        "Maternal & Infant Nutrition"
      ],
      "testimonials": [
        {
          "text": "Dr. Reddy helped us navigate our daughter's multiple food allergies with practical meal ideas that our whole family enjoys.",
          "author": "Amanda S., Parent"
        },
        {
          "text": "Our son was an extremely picky eater, and Dr. Neha's creative approach has completely transformed our mealtimes. We're so grateful!",
          "author": "Thomas & Rebecca P., Parents"
        }
      ],
      "location": "Visakhapatnam",
      "mode": "offline",
      "experience": 1,
      "fees": 600,
      "language": ["Telugu"]
    }
];


// 400 error route
router.get('/400', (req, res) => {
  res.status(400).render('400', { title: 'Bad Request | NutriConnect' });
});




// Export the router
module.exports = router;