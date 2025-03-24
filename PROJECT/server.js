require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5100;

const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database setup (in-memory SQLite database)
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the in-memory SQLite database.');
    initializeDatabase();
  }
});



// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,                        
      address TEXT NOT NULL,      
      age INTEGER
    )
  `)

  db.run(`CREATE TABLE dietitians (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INTEGER NOT NULL,
    phone TEXT NOT NULL,
    specialization TEXT,
    rating INTEGER,
    image TEXT,
    location TEXT,
    mode TEXT,
    experience INTEGER,
    fees INTEGER,
    language TEXT
  )
`);

db.run(`
  CREATE TABLE dietitians_info (
    id INTEGER PRIMARY KEY,
    dietitian_id INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    specialties TEXT,
    education TEXT,
    expertise TEXT,
    testimonials TEXT,
    FOREIGN KEY (dietitian_id) REFERENCES dietitians(id) ON DELETE CASCADE
    
  )
`);


// Dietitian Doc Database
db.run(`
  CREATE TABLE IF NOT EXISTS dietitian_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dietitian_id INTEGER NOT NULL,
    resume BLOB,
    degree_certificate BLOB,
    license_document BLOB,
    id_proof BLOB,
    experience_certificates BLOB,
    specialization_certifications BLOB,
    internship_certificate BLOB,
    research_papers BLOB,
    FOREIGN KEY (dietitian_id) REFERENCES dietician(id)
  )
`);


  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      admin_key TEXT NOT NULL,
      phone TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      address TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      org_id TEXT NOT NULL
    )
      
  `);

  // Organizaation doc Database
db.run(`
  CREATE TABLE IF NOT EXISTS organization_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    org_logo BLOB,
    org_brochure BLOB,
    legal_document BLOB,
    tax_document BLOB,
    address_proof BLOB,
    business_license BLOB,
    authorized_rep_id BLOB,
    bank_document BLOB,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
  )
`);


// Payments  Database

db.run(`
  CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,  
      plan_type TEXT NOT NULL,
      billing_type TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);



// Patient Details Database

db.run(`
  CREATE TABLE IF NOT EXISTS patient_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    allergies TEXT NOT NULL,
    current_medication TEXT NOT NULL,
    food_preferences TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    diet_plan TEXT NOT NULL,
    current_weight REAL,
    target_weight REAL,
    activity_level TEXT,
    blood_sugar REAL,
    medication TEXT,
    thyroid_level REAL,
    cholesterol REAL,
    blood_pressure TEXT,
    heart_condition TEXT,
    pregnancy_status TEXT,
    hormonal_issues TEXT,
    skin_type TEXT,
    hair_type TEXT,
    digestive_issue TEXT,
    food_allergies TEXT,
    general_health_report BLOB,
    blood_test_report BLOB,
    diabetes_thyroid_report BLOB,
    blood_pressure_report BLOB,
    cardiac_health_report BLOB,
    hormonal_profile_report BLOB,
    dermatological_evaluation_report BLOB,
    trichological_evaluation_report BLOB,
    gastrointestinal_evaluation_report BLOB,
    stool_analysis_report BLOB,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);



  // For Storing Messages
  db.run(`CREATE TABLE IF NOT EXISTS client_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    client_msg TEXT NOT NULL, 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);


  db.run(`CREATE TABLE IF NOT EXISTS dietitian_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dietitian_id INTEGER,
    dietitian_msg TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dietitian_id) REFERENCES dietitians(id)
  )`);
  
  
// Booking slots Database ( Used for Schedule User and Schedule dietitian Modifications )

db.run(`
  CREATE TABLE IF NOT EXISTS booked_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nutritionist_id INTEGER NOT NULL,
      nutritionist_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL, 
      mode TEXT NOT NULL, 
      fees INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (nutritionist_id) REFERENCES dietitians(id) ON DELETE CASCADE 
  )`);

  // For Storing Appointments

  db.run(`CREATE TABLE IF NOT EXISTS Clients_list (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    bookedDate TEXT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booked_slots(id)

  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Dietitians_list (
    dietitian_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    bookedDate TEXT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booked_slots(id)
  )`);

  // Queries Database

  db.run(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      query TEXT NOT NULL,
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  
  // Dietitian Customized Meal Plans Database

  db.run(`
    CREATE TABLE IF NOT EXISTS nutrition_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dietitian_name TEXT NOT NULL,
        diet_type TEXT NOT NULL,
        calories INTEGER NOT NULL,
        meals TEXT NOT NULL
    )
`);


// Blogs Database
db.run(`
  CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image BLOB,
      theme TEXT NOT NULL
  )
`);

}

// Export db so that it can be used in routes
module.exports = db;

// Import routes
const signupRoutes = require('./routes/signup-route');
const signinRoutes = require('./routes/signin-route');
const appRoutes = require('./routes/app-route'); 


const dietitianApp = require('./routes/server-diet');
const organizationApp = require('./routes/server-org');


const editProfile = require('./routes/edit-profile');
const changePass = require('./routes/change-pass');


const contactRoutes = require('./routes/contact-route');
const labRoutes = require('./routes/Lab-server'); 
const dietitianInfoRoutes=require('./routes/dietitian-info-server');
const paymentRoutes = require('./routes/payment-server'); 
const bookingRoutes = require('./routes/booking-server'); 


// Use routes
app.use('/', signupRoutes);
app.use('/', signinRoutes);
app.use('/', appRoutes);

app.use('/', editProfile);
app.use('/', changePass);


app.use('/dietitian-doc', dietitianApp);
app.use('/organization-doc', organizationApp);


app.use('/', contactRoutes);
app.use('/',labRoutes);
app.use('/', dietitianInfoRoutes);
app.use('/', paymentRoutes);
app.use('/',bookingRoutes);



const expressListEndpoints = require('express-list-endpoints');

// Display all routes
console.log(expressListEndpoints(app));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
