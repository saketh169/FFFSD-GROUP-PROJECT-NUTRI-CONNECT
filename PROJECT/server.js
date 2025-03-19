require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8100;

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
app.use(express.static(__dirname));

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
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dietitians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      age INTEGER NOT NULL,
      phone TEXT NOT NULL
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
}

// Export db so that it can be used in routes
module.exports = db;

// Import routes
const signupRoutes = require('./routes/signup-route');
const signinRoutes = require('./routes/signin-route');
const appRoutes = require('./routes/app-route'); 

// Use routes
app.use('/', signupRoutes);
app.use('/', signinRoutes);
app.use('/', appRoutes);


// Import sub-apps
const dietitianApp = require('./routes/server-diet');
const organizationApp = require('./routes/server-org');

// Mount sub-apps under the root path (/)
app.use('/dietitian-doc', dietitianApp);
app.use('/organization-doc', organizationApp);

const expressListEndpoints = require('express-list-endpoints');

// Display all routes
console.log(expressListEndpoints(app));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});