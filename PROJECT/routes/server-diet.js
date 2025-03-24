const express = require('express');
const multer = require('multer');
const path = require('path');

// Create a router
const router = express.Router();

// Configure multer for in-memory file uploads
const storage = multer.memoryStorage(); // Store files in memory
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
    console.log('Uploaded Files:');
    for (const field in req.files) {
        req.files[field].forEach(file => {
            console.log(`Field: ${field}`);
            console.log(`Original Name: ${file.originalname}`);
            console.log(`MIME Type: ${file.mimetype}`);
            console.log(`Size: ${file.size} bytes`);
            console.log('---------------------------');
        });
    }

    // Respond with a success message and uploaded file details
    res.json({ 
        message: 'Files uploaded successfully!', 
        files: req.files 
    });
});

// Export the router
module.exports = router;