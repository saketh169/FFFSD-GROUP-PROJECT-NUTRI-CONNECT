const express = require('express');
const multer = require('multer');

// Create a router
const router = express.Router();

// Configure multer for in-memory file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Handle file uploads
router.post('/upload', upload.fields([
    { name: 'orgLogo', maxCount: 1 },
    { name: 'orgBrochure', maxCount: 1 },
    { name: 'legalDocument', maxCount: 1 },
    { name: 'taxDocument', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'authorizedRepId', maxCount: 1 },
    { name: 'bankDocument', maxCount: 1 }
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

// Route to display all received files (in-memory files are not stored, so this will return an empty list)
router.get('/upload', (req, res) => {
    // Since files are not stored on disk, return an empty list
    res.json({ 
        message: 'No files stored on disk (in-memory uploads only)', 
        files: [] 
    });
});

// Export the router
module.exports = router;