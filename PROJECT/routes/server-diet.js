const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create a router
const router = express.Router();

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../upload/dietitian');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using the current timestamp and original filename
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


// Handle file uploads
router.post('/upload', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'experienceCertificates', maxCount: 1 },
    { name: 'specializationCertifications', maxCount: 1 },
    { name: 'internshipCertificate', maxCount: 1 },
    { name: 'researchPapers', maxCount: 1 }
]), (req, res) => {
    // Log the uploaded files
    console.log('Uploaded Files:', req.files);

    // Respond with a success message and uploaded file details
    res.json({ 
        message: 'Files uploaded successfully!', 
        files: req.files 
    });
});

// Route to display all received files
router.get('/upload', (req, res) => {
    // Read all files in the upload directory
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Error reading upload directory:', err);
            return res.status(500).json({ error: 'Unable to read upload directory' });
        }

        // Respond with the list of files
        res.json({ 
            message: 'List of uploaded files', 
            files: files 
        });
    });
});

// Export the router
module.exports = router;