const express = require('express');
const router = express.Router();
const db = require('../server'); // Adjust the path to your db file
const bodyParser = require('body-parser');
const multer = require('multer'); // For handling file uploads

// Middleware for parsing JSON and URL-encoded data
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Multer configuration for file uploads (storing files in memory)
const storage = multer.memoryStorage(); // Store files in memory as Buffers
const upload = multer({ storage: storage });

// Middleware to ensure authorized access
function ensureAuthorized(role) {
    return (req, res, next) => {
        if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
            if (
                (role === "user" && req.session.user) ||
                (role === "dietitian" && req.session.dietitian) ||
                (role === "admin" && req.session.admin) ||
                (role === "organization" && req.session.organization)
            ) {
                next();
            } else {
                // User is not authorized for this role
                res.status(403).json({ 
                    error: 'Unauthorized', 
                    message: 'You do not have permission to access this resource.' 
                });
            }
        } else {
            res.redirect("/role_signin");
        }
    };
}


router.post('/submit-medical-reports', ensureAuthorized("user"), upload.fields([
    { name: 'generalHealthReport', maxCount: 1 },
    { name: 'bloodTestReport', maxCount: 1 },
    { name: 'diabetesThyroidReport', maxCount: 1 },
    { name: 'bloodPressureReport', maxCount: 1 },
    { name: 'cardiacHealthReport', maxCount: 1 },
    { name: 'hormonalProfileReport', maxCount: 1 },
    { name: 'dermatologicalEvaluationReport', maxCount: 1 },
    { name: 'trichologicalEvaluationReport', maxCount: 1 },
    { name: 'gastrointestinalEvaluationReport', maxCount: 1 },
    { name: 'stoolAnalysisReport', maxCount: 1 }
  ]), (req, res) => {
    // Extract form data from the request body
    const formData = req.body;
  
    // Extract uploaded files from the request
    const files = req.files;
  
    // Log the received form data (for debugging)
    console.log("Received Form Data:", formData);
  
    // Log the received files (for debugging)
    if (files) {
      console.log("Received Files:");
      Object.keys(files).forEach((fieldName) => {
        const file = files[fieldName][0]; // Get the first file in the array
        console.log(`Field Name: ${fieldName}`);
        console.log(`File Name: ${file.originalname}`);
        console.log(`MIME Type: ${file.mimetype}`);
        console.log(`File Size: ${file.size} bytes`);
        console.log('-----------------------------');
      });
    } else {
      console.log("No files were uploaded.");
    }
  
    // Send a response back to the client with the received data
    res.status(200).json({
      message: "Form data received successfully!",
      formData: formData,
      files: files ? Object.keys(files).map((fieldName) => ({
        fieldName: fieldName,
        fileName: files[fieldName][0].originalname,
        fileSize: files[fieldName][0].size,
        fileType: files[fieldName][0].mimetype
      })) : []
    });
  });

module.exports = router;