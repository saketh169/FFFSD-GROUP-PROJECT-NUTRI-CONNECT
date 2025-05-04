require('dotenv').config({ 
  path: require('path').join(__dirname, 'utils', '.env') 
});

const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./utils/db'); // Import MongoDB connection from db.js

const app = express();
const PORT = process.env.PORT || 3200;


// Generate a strong 64-byte hex session secret
const generateSessionSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Configuration
const MONGODB_URI = 'mongodb://localhost:27017/NutriConnectDB';
const SESSION_SECRET = process.env.SESSION_SECRET || generateSessionSecret();

// Log the generated secret (remove in production)
if (!process.env.SESSION_SECRET) {
  console.log('\n🔑 Generated Session Secret:', SESSION_SECRET);
  console.log('⚠️  For production, set SESSION_SECRET in .env file instead!');
}


// Session Configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'strict'
  },
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'interval',
    autoRemoveInterval: 60 // Minutes
  })
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
const db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('\n❌ SQLite3 DB Connection Error:', err.message);
    process.exit(1);
  } else {
    console.log('\n✅ SQLite3 DB Connected Successfully!');
    initializeDatabase();
  }
});

connectDB();

// Initialize SQLite database tables (excluding users and admins)
function initializeDatabase() {
  /*
  db.run(`
    CREATE TABLE IF NOT EXISTS dietitians (
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
    CREATE TABLE IF NOT EXISTS dietitians_info (
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
      FOREIGN KEY (dietitian_id) REFERENCES dietitians(id)
    )
  `);

  */

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_type TEXT NOT NULL,
      billing_type TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
      stool_analysis_report BLOB
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS client_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      client_msg TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dietitian_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dietitian_id INTEGER,
      dietitian_msg TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dietitian_id) REFERENCES dietitians(id)
    )
  `);

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
      FOREIGN KEY (nutritionist_id) REFERENCES dietitians(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Clients_list (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      bookedDate TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES booked_slots(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Dietitians_list (
      dietitian_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      bookedDate TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES booked_slots(id)
    )
  `);

 

}

// Export SQLite db for use in routes
module.exports = db;

// Import routes
const signupRoutes = require('./controllers/signup-route');
const signinRoutes = require('./controllers/signin-route');
const appRoutes = require('./controllers/app-route');

const dietitianApp = require('./controllers/server-diet');
const organizationApp = require('./controllers/server-org');

const editProfile = require('./controllers/edit-profile');
const changePass = require('./controllers/change-pass');
const contactRoutes = require('./controllers/contact-route');
const dietPlanRoutes = require('./controllers/dietPlan-route');
const labRoutes = require('./controllers/lab-server');

const dietitianRoutes = require('./controllers/dietitianController');
const dietitianInfoRoutes = require('./controllers/dietitianInfoController');

const paymentRoutes = require('./controllers/payment-server');
const bookingRoutes = require('./controllers/booking-server');
const blogRoutes = require('./controllers/blog-route');


const crudRoutes = require('./controllers/crud-routes');
const profileRoutes = require('./controllers/upload-routes');


// Use routes
app.use('/', signupRoutes);
app.use('/', signinRoutes);
app.use('/', appRoutes);
app.use('/', editProfile);
app.use('/', changePass);

app.use('/dietitian-doc', dietitianApp);
app.use('/organization-doc', organizationApp);

app.use('/', contactRoutes);
app.use('/', dietPlanRoutes);

app.use('/', labRoutes);
app.use('/', dietitianRoutes);
app.use('/dietitians', dietitianInfoRoutes);
app.use('/', paymentRoutes);
app.use('/', bookingRoutes);

app.use('/', blogRoutes);
app.use('/', crudRoutes);
app.use('/', profileRoutes);

// Display all routes
const expressListEndpoints = require('express-list-endpoints');
console.log(expressListEndpoints(app));


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});