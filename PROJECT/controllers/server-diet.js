
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { Dietitian, Organization } = require('../models/userModel');

// Create a router
const router = express.Router();

// Middleware to ensure the user is an authenticated organization (for verification)
function ensureOrgAuthenticated(req, res, next) {
    if (req.session.organization) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized: Organization not authenticated' });
}

// Middleware to validate MongoDB ObjectId
function validateObjectId(req, res, next) {
    const { dietitianId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
        return res.status(400).json({ success: false, message: 'Invalid dietitian ID' });
    }
    next();
}

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.dietitian) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
}

// Multer configuration for final report upload
const reportUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF is allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');

// Middleware to handle Multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: `Unexpected field: ${err.field}. Expected fields: resume, degreeCertificate, licenseDocument, idProof, experienceCertificates, specializationCertifications, internshipCertificate, researchPapers, finalReport`,
            });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size allowed is 5MB.',
            });
        }
        return res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
    } else if (err.message === 'Invalid file type. Only PDF is allowed.') {
        console.error('File type error:', err.message);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
};

// Multer configuration for dietitian file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF is allowed.'));
    }
};

const dietitianUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 8 // Maximum 8 files
    }
}).fields([
    { name: 'resume', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'experienceCertificates', maxCount: 1 },
    { name: 'specializationCertifications', maxCount: 1 },
    { name: 'internshipCertificate', maxCount: 1 },
    { name: 'researchPapers', maxCount: 1 }
]);

// Handle dietitian file uploads and mark as Pending
router.post('/upload', ensureAuthenticated, dietitianUpload, handleMulterError, async (req, res) => {
    try {
        const dietitian = req.session.dietitian;
        if (!dietitian || dietitian.role !== 'dietitian') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Only dietitians can upload files' });
        }

        let fileDetails = 'Uploaded Files:\n';
        const filesUpdate = {};
        const verificationStatusUpdate = {};

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

        for (const field in req.files) {
            req.files[field].forEach(file => {
                fileDetails += `Field: ${field}\n`;
                fileDetails += `Original Name: ${file.originalname}\n`;
                fileDetails += `MIME Type: ${file.mimetype}\n`;
                fileDetails += `Size: ${file.size} bytes\n`;
                fileDetails += '---------------------------\n';

                const schemaField = fieldMap[field];
                if (schemaField) {
                    filesUpdate[`files.${schemaField}`] = file.buffer;
                    verificationStatusUpdate[`verificationStatus.${schemaField}`] = 'Pending';
                }
            });
        }

        console.log(fileDetails);

        // Check if final report exists and remove it
        const unsetFields = {};
        const existingDietitian = await Dietitian.findById(dietitian.id);
        if (existingDietitian.files && existingDietitian.files.finalReport) {
            unsetFields['files.finalReport'] = '';
            console.log(`Removing existing final report for dietitian: ${dietitian.name}`);
        }

        const updatedDietitian = await Dietitian.findByIdAndUpdate(
            dietitian.id,
            {
                $set: {
                    ...filesUpdate,
                    ...verificationStatusUpdate,
                    'verificationStatus.finalReport': 'Not Received' // Explicitly set to "Not Received"
                },
                $unset: unsetFields
            },
            { new: true }
        );

        if (!updatedDietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        req.session.dietitian = {
            id: updatedDietitian._id,
            role: 'dietitian',
            email: updatedDietitian.email,
            name: updatedDietitian.name
        };

        res.status(200).json({
            success: true,
            message: 'Files uploaded and marked as Pending successfully!',
            files: req.files,
            dietitian: {
                id: updatedDietitian._id,
                email: updatedDietitian.email,
                name: updatedDietitian.name,
                verificationStatus: updatedDietitian.verificationStatus
            }
        });
    } catch (err) {
        console.error('Error uploading files:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});


// Route to fetch all dietitians and log names of files with Verified and Rejected status
router.get('/dietitians', ensureOrgAuthenticated, async (req, res) => {
    try {
        const dietitians = await Dietitian.find().select(
            'name email files verificationStatus'
        );

        console.log('Dietitians with Verified Files:');
        dietitians.forEach((dietitian) => {
            const verifiedFiles = Object.keys(dietitian.verificationStatus || {})
                .filter((key) => dietitian.verificationStatus[key] === 'Verified')
                .map((key) => {
                    const fieldMap = {
                        resume: 'Resume',
                        degree_certificate: 'Degree Certificate',
                        license_document: 'License Document',
                        id_proof: 'ID Proof',
                        experience_certificates: 'Experience Certificates',
                        specialization_certifications: 'Specialization Certifications',
                        internship_certificate: 'Internship Certificate',
                        research_papers: 'Research Papers',
                        finalReport: 'Final Report'
                    };
                    return fieldMap[key] || key;
                });
            if (verifiedFiles.length > 0) {
                console.log(`- ${dietitian.name}: ${verifiedFiles.join(', ')}`);
            }
        });

        console.log('\nDietitians with Rejected Files:');
        dietitians.forEach((dietitian) => {
            const rejectedFiles = Object.keys(dietitian.verificationStatus || {})
                .filter((key) => dietitian.verificationStatus[key] === 'Rejected')
                .map((key) => {
                    const fieldMap = {
                        resume: 'Degree Certificate',
                        degree_certificate: 'Degree Certificate',
                        license_document: 'License Document',
                        id_proof: 'ID Proof',
                        experience_certificates: 'Experience Certificates',
                        specialization_certifications: 'Specialization Certifications',
                        internship_certificate: 'Internship Certificate',
                        research_papers: 'Research Papers',
                        finalReport: 'Final Report'
                    };
                    return fieldMap[key] || key;
                });
            if (rejectedFiles.length > 0) {
                console.log(`- ${dietitian.name}: ${rejectedFiles.join(', ')}`);
            }
        });

        res.status(200).json(dietitians);
    } catch (error) {
        console.error('Error fetching dietitians:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dietitians' });
    }
});

// Route to fetch a file as base64
router.get('/files/:dietitianId/:field', ensureOrgAuthenticated, validateObjectId, async (req, res) => {
    try {
        const { dietitianId, field } = req.params;
        const validFields = [
            'resume',
            'degree_certificate',
            'license_document',
            'id_proof',
            'experience_certificates',
            'specialization_certifications',
            'internship_certificate',
            'research_papers',
            'finalReport'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        const files = dietitian.files || {};
        const fileBuffer = files[field];
        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Convert Buffer to base64
        const base64Data = fileBuffer.toString('base64');

        const fieldMap = {
            resume: { name: 'Resume', ext: 'pdf', mime: 'application/pdf' },
            degree_certificate: { name: 'Degree Certificate', ext: 'pdf', mime: 'application/pdf' },
            license_document: { name: 'License Document', ext: 'pdf', mime: 'application/pdf' },
            id_proof: { name: 'ID Proof', ext: 'pdf', mime: 'application/pdf' },
            experience_certificates: { name: 'Experience Certificates', ext: 'pdf', mime: 'application/pdf' },
            specialization_certifications: { name: 'Specialization Certifications', ext: 'pdf', mime: 'application/pdf' },
            internship_certificate: { name: 'Internship Certificate', ext: 'pdf', mime: 'application/pdf' },
            research_papers: { name: 'Research Papers', ext: 'pdf', mime: 'application/pdf' },
            finalReport: { name: 'Final Report', ext: 'pdf', mime: 'application/pdf' }
        };

        // Send base64 data in JSON response
        res.status(200).json({
            success: true,
            file: {
                name: fieldMap[field].name,
                ext: fieldMap[field].ext,
                mime: fieldMap[field].mime,
                base64: base64Data
            }
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch file' });
    }
});

// Route to approve a document
router.post('/:dietitianId/approve', ensureOrgAuthenticated, validateObjectId, async (req, res) => {
    try {
        const { dietitianId } = req.params;
        const { field } = req.body;
        const validFields = [
            'resume',
            'degree_certificate',
            'license_document',
            'id_proof',
            'experience_certificates',
            'specialization_certifications',
            'internship_certificate',
            'research_papers'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || dietitian.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        dietitian.verificationStatus[field] = 'Verified';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error approving document:', error);
        res.status(500).json({ success: false, message: 'Failed to approve document' });
    }
});

// Route to disapprove a document
router.post('/:dietitianId/disapprove', ensureOrgAuthenticated, validateObjectId, async (req, res) => {
    try {
        const { dietitianId } = req.params;
        const { field } = req.body;
        const validFields = [
            'resume',
            'degree_certificate',
            'license_document',
            'id_proof',
            'experience_certificates',
            'specialization_certifications',
            'internship_certificate',
            'research_papers'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || dietitian.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        dietitian.verificationStatus[field] = 'Rejected';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error disapproving document:', error);
        res.status(500).json({ success: false, message: 'Failed to disapprove document' });
    }
});

// Route for final approval
router.post('/:dietitianId/final-approve', ensureOrgAuthenticated, validateObjectId, async (req, res) => {
    try {
        const { dietitianId } = req.params;
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || !dietitian.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        dietitian.verificationStatus.finalReport = 'Verified';
        await dietitian.save();

        console.log(`Final Approval Submitted: ${dietitian.name} - Final Report: Verified`);

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error submitting final approval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final approval' });
    }
});

// Route for final disapproval
router.post('/:dietitianId/final-disapprove', ensureOrgAuthenticated, validateObjectId, async (req, res) => {
    try {
        const { dietitianId } = req.params;

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || !dietitian.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        dietitian.verificationStatus.finalReport = 'Rejected';
        await dietitian.save();

        console.log(`Final Disapproval Submitted: ${dietitian.name} - Final Report: Rejected`);

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error submitting final disapproval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final disapproval' });
    }
});

// Route to upload final verification report
router.post(
    '/:dietitianId/upload-report',
    ensureOrgAuthenticated,
    validateObjectId,
    reportUpload,
    handleMulterError,
    async (req, res) => {
        try {
            const { dietitianId } = req.params;
            const dietitian = await Dietitian.findById(dietitianId);
            if (!dietitian) {
                return res.status(404).json({ success: false, message: 'Dietitian not found' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            dietitian.files = dietitian.files || {};
            dietitian.files.finalReport = req.file.buffer;
            dietitian.verificationStatus = dietitian.verificationStatus || {};
            dietitian.verificationStatus.finalReport = 'Received';
            await dietitian.save();

            res.status(200).json(dietitian);
        } catch (error) {
            console.error('Error uploading report:', error);
            res.status(500).json({ success: false, message: 'Failed to upload verification report' });
        }
    }
);


// Route to fetch current dietitian's details based on session
router.get('/me', ensureAuthenticated, async (req, res) => {
    try {
        const dietitianId = req.session.dietitian.id;
        if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
            return res.status(400).json({ success: false, message: 'Invalid dietitian ID in session' });
        }

        const dietitian = await Dietitian.findById(dietitianId).select('name email verificationStatus files');
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        // Prepare base64 for final report if it exists
        let finalReportBase64 = null;
        if (dietitian.files && dietitian.files.finalReport) {
            finalReportBase64 = dietitian.files.finalReport.toString('base64');
        }

        // Log details to match frontend display
        console.log(`Dietitian: ${dietitian.name}`);
        const fieldMap = {
            resume: 'Resume',
            degree_certificate: 'Degree Certificate',
            license_document: 'License Document',
            id_proof: 'ID Proof',
            experience_certificates: 'Experience Certificates',
            specialization_certifications: 'Specialization Certifications',
            internship_certificate: 'Internship Certificate',
            research_papers: 'Research Papers',
            finalReport: 'Final Report'
        };

        const documentFields = [
            'resume',
            'degree_certificate',
            'license_document',
            'id_proof',
            'experience_certificates',
            'specialization_certifications',
            'internship_certificate',
            'research_papers',
            'finalReport'
        ];

        documentFields.forEach(field => {
            const status = dietitian.verificationStatus[field] || (field === 'finalReport' ? 'Not Received' : 'Not Uploaded');
            console.log(`${fieldMap[field]}: ${status}`);
        });

        res.status(200).json({
            success: true,
            dietitian: {
                id: dietitian._id,
                name: dietitian.name,
                email: dietitian.email,
                verificationStatus: dietitian.verificationStatus,
                finalReport: finalReportBase64 ? {
                    name: 'Final Verification Report',
                    ext: 'pdf',
                    mime: 'application/pdf',
                    base64: finalReportBase64
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching current dietitian:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dietitian details' });
    }
});


// Export the router
module.exports = router;