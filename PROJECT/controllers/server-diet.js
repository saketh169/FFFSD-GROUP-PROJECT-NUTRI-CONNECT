const express = require('express');
const multer = require('multer');
const { Dietitian } = require('../models/userModel'); // Adjust path to your models file

// Create a router
const router = express.Router();

// Configure multer for in-memory file uploads
const storage = multer.memoryStorage();
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
]), async (req, res) => {
    try {
        // Collect file details for logging
        let fileDetails = 'Uploaded Files:\n';
        const filesData = {};

        for (const field in req.files) {
            req.files[field].forEach(file => {
                fileDetails += `Field: ${field}\n`;
                fileDetails += `Original Name: ${file.originalname}\n`;
                fileDetails += `MIME Type: ${file.mimetype}\n`;
                fileDetails += `Size: ${file.size} bytes\n`;
                fileDetails += '---------------------------\n';

                // Map field names to schema field names
                const fieldMap = {
                    resume: 'resume',
                    degreeCertificate: 'degree_certificate',
                    licenseDocument: 'license_document',
                    idProof: 'id_proof',
                    experienceCertificates: 'experience_certificates',
                    specializationCertifications: 'specialization_certifications',
                    internshipCertificate: 'internship_certificate',
                    researchPapers: 'research_papers'
                };
                filesData[fieldMap[field]] = file.buffer; // Store file buffer
            });
        }

        // Print all details at once
        console.log(fileDetails);

        // Assuming the dietitian is logged in and their email is in the session
        if (!req.session.dietitian || !req.session.dietitian.email) {
            return res.status(401).json({ message: 'Unauthorized: No active dietitian session' });
        }

        // Find the dietitian by email and update with files
        const updatedDietitian = await Dietitian.findOneAndUpdate(
            { email: req.session.dietitian.email },
            { $set: { files: filesData } },
            { new: true }
        );

        if (!updatedDietitian) {
            return res.status(404).json({ message: 'Dietitian not found' });
        }

        // Update session data
        req.session.dietitian = {
            id: updatedDietitian._id,
            role: 'dietitian',
            email: updatedDietitian.email,
            name: updatedDietitian.name
        };

        // Respond with a success message and uploaded file details
        res.json({ 
            message: 'Files uploaded and saved successfully!', 
            files: req.files 
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export the router
module.exports = router;