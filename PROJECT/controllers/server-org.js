const express = require('express');
const multer = require('multer');
const { Organization } = require('../models/userModel'); // Adjust path to your models file

// Create a router
const router = express.Router();

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.organization) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
}

// Middleware to handle Multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: `Unexpected field: ${err.field}. Expected fields: orgLogo, orgBrochure, legalDocument, taxDocument, addressProof, businessLicense, authorizedRepId, bankDocument`,
            });
        }
        return res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
    } else if (err.message === 'Invalid file type. Only JPEG, PNG, and PDF are allowed.') {
        console.error('File type error:', err.message);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
};

// Multer configuration for organization file uploads
const storage = multer.memoryStorage(); // In-memory storage for files

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
};

const organizationUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit to accommodate orgBrochure
}).fields([
    { name: 'orgLogo', maxCount: 1 },
    { name: 'orgBrochure', maxCount: 1 },
    { name: 'legalDocument', maxCount: 1 },
    { name: 'taxDocument', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'authorizedRepId', maxCount: 1 },
    { name: 'bankDocument', maxCount: 1 }
]);

// Handle organization file uploads
router.post('/upload', ensureAuthenticated, handleMulterError, organizationUpload, async (req, res) => {
    try {
        // Check if the user is an organization
        const organization = req.session.organization;
        if (!organization || organization.role !== 'organization') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Only organizations can upload files' });
        }

        // Collect file details for logging
        let fileDetails = 'Uploaded Files:\n';
        const filesUpdate = {};

        // Map frontend field names to schema field names
        const fieldMap = {
            orgLogo: 'org_logo',
            orgBrochure: 'org_brochure',
            legalDocument: 'legal_document',
            taxDocument: 'tax_document',
            addressProof: 'address_proof',
            businessLicense: 'business_license',
            authorizedRepId: 'authorized_rep_id',
            bankDocument: 'bank_document'
        };

        for (const field in req.files) {
            req.files[field].forEach(file => {
                fileDetails += `Field: ${field}\n`;
                fileDetails += `Original Name: ${file.originalname}\n`;
                fileDetails += `MIME Type: ${file.mimetype}\n`;
                fileDetails += `Size: ${file.size} bytes\n`;
                fileDetails += '---------------------------\n';

                // Map the frontend field name to the schema field name
                const schemaField = fieldMap[field];
                if (schemaField) {
                    filesUpdate[`files.${schemaField}`] = file.buffer;
                }
            });
        }

        // Print all file details at once
        console.log(fileDetails);

        // Update the organization document with the uploaded files
        const updatedOrganization = await Organization.findByIdAndUpdate(
            organization.id,
            { $set: filesUpdate },
            { new: true } // Return the updated document
        );

        if (!updatedOrganization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        // Update session data
        req.session.organization = {
            id: updatedOrganization._id,
            role: 'organization',
            email: updatedOrganization.email,
            org_name: updatedOrganization.org_name
        };

        // Respond with a success message and uploaded file details
        res.status(200).json({
            success: true,
            message: 'Files uploaded and saved successfully!',
            files: req.files,
            organization: {
                id: updatedOrganization._id,
                email: updatedOrganization.email,
                org_name: updatedOrganization.org_name
            }
        });
    } catch (err) {
        console.error('Error uploading files:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Route to display all received files (in-memory files are not stored)
router.get('/upload', (req, res) => {
    res.json({
        success: true,
        message: 'No files stored on disk (in-memory uploads only)',
        files: []
    });
});

// Export the router
module.exports = router;