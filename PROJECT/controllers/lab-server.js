const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LabReport = require('../models/labReportModel'); // Adjust the path to your model file
const multer = require('multer');
const bodyParser = require('body-parser');

// Middleware for parsing JSON and URL-encoded data
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Multer configuration for file uploads (storing files in memory)
const storage = multer.memoryStorage();
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

// Allowed file fields (aligned with LabReport schema)
const allowedFileFields = [
    { name: 'generalHealthReport', maxCount: 1 },
    { name: 'bloodTestReport', maxCount: 1 },
    { name: 'diabetesReport', maxCount: 1 },
    { name: 'thyroidReport', maxCount: 1 },
    { name: 'bloodSugarReport', maxCount: 1 },
    { name: 'bloodPressureReport', maxCount: 1 },
    { name: 'cardiovascularReport', maxCount: 1 },
    { name: 'cardiacHealthReport', maxCount: 1 },
    { name: 'ecgReport', maxCount: 1 },
    { name: 'hormonalProfileReport', maxCount: 1 },
    { name: 'endocrineReport', maxCount: 1 }
];

// Submit medical reports
router.post('/submit-medical-reports', ensureAuthorized("user"), (req, res, next) => {
    upload.fields(allowedFileFields)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({
                error: 'Unexpected field in file upload',
                details: `Field '${err.field}' is not allowed. Allowed fields: ${allowedFileFields.map(f => f.name).join(', ')}`
            });
        } else if (err) {
            console.error('Unknown Error:', err);
            return res.status(500).json({ error: 'Failed to process file upload', details: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const {
            dietitianId,
            name,
            email,
            phone,
            address,
            age,
            gender,
            healthConcerns,
            additionalInfo
        } = req.body;

        // Validate required fields
        if (!mongoose.isValidObjectId(dietitianId) || !req.session.user?.id) {
            return res.status(400).json({ error: 'Invalid user or dietitian ID' });
        }

        // Prepare lab report data
        const labReportData = {
            userId: req.session.user.id,
            dietitianId,
            name: name || undefined,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            age: age ? parseInt(age) : undefined,
            gender: gender || undefined,
            healthConcerns: Array.isArray(healthConcerns) ? healthConcerns : healthConcerns ? [healthConcerns] : [],
            additionalInfo: additionalInfo || undefined,
            createdAt: new Date()
        };

        // Handle file uploads
        if (req.files) {
            console.log('Received files:', Object.keys(req.files));
            for (const field in req.files) {
                if (req.files[field][0] && allowedFileFields.some(f => f.name === field)) {
                    labReportData[field] = {
                        data: req.files[field][0].buffer,
                        contentType: req.files[field][0].mimetype,
                        filename: req.files[field][0].originalname
                    };
                }
            }
        } else {
            console.log('No files received in request');
        }

        // Log metadata only, excluding binary data
        const logData = {
            ...labReportData,
            ...Object.fromEntries(
                Object.entries(labReportData).map(([key, value]) => {
                    if (value && value.data instanceof Buffer) {
                        return [key, { filename: value.filename, contentType: value.contentType, size: value.data.length }];
                    }
                    return [key, value];
                })
            )
        };
        console.log('Saving Lab Report Data:', JSON.stringify(logData, null, 2));

        // Save to database
        const labReport = new LabReport(labReportData);
        await labReport.save();

        res.status(200).json({
            message: 'Lab report submitted successfully',
            labReportId: labReport._id
        });
    } catch (error) {
        console.error('Error submitting lab report:', error);
        res.status(500).json({ error: 'Failed to submit lab report', details: error.message });
    }
});

// Fetch lab reports for user (sorted by most recent)
router.get('/booking/lab-report/user', ensureAuthorized("user"), async (req, res) => {
    try {
        const { otherPartyId } = req.query;
        if (!mongoose.isValidObjectId(otherPartyId)) {
            return res.status(400).json({ error: 'Invalid dietitian ID' });
        }

        const reports = await LabReport.find({
            userId: req.session.user.id,
            dietitianId: otherPartyId
        })
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
            .lean();

        // Log all fields, excluding binary data
        const logReports = reports.map(report => {
            const logReport = { ...report };
            for (const field of allowedFileFields.map(f => f.name)) {
                if (logReport[field]?.data) {
                    logReport[field] = {
                        filename: logReport[field].filename,
                        contentType: logReport[field].contentType,
                        size: logReport[field].data.length
                    };
                }
            }
            return logReport;
        });
        console.log('Fetched User Lab Reports (Sorted by Most Recent):', JSON.stringify(logReports, null, 2));

        res.json(reports);
    } catch (error) {
        console.error('Error fetching user lab reports:', error);
        res.status(500).json({ error: 'Failed to fetch lab reports', details: error.message });
    }
});

// Fetch lab reports for dietitian (sorted by most recent)
router.get('/booking/lab-report/dietitian', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        const { otherPartyId } = req.query;
        if (!mongoose.isValidObjectId(otherPartyId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const reports = await LabReport.find({
            userId: otherPartyId,
            dietitianId: req.session.dietitian.id
        })
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
            .lean();

        // Log all fields, excluding binary data
        const logReports = reports.map(report => {
            const logReport = { ...report };
            for (const field of allowedFileFields.map(f => f.name)) {
                if (logReport[field]?.data) {
                    logReport[field] = {
                        filename: logReport[field].filename,
                        contentType: logReport[field].contentType,
                        size: logReport[field].data.length
                    };
                }
            }
            return logReport;
        });
        console.log('Fetched Dietitian Lab Reports (Sorted by Most Recent):', JSON.stringify(logReports, null, 2));

        res.json(reports);
    } catch (error) {
        console.error('Error fetching dietitian lab reports:', error);
        res.status(500).json({ error: 'Failed to fetch lab reports', details: error.message });
    }
});

// View report for user
router.get('/view-report/:reportId/:fieldName', ensureAuthorized('user'), async (req, res) => {
    const { reportId, fieldName } = req.params;
    try {
        const report = await LabReport.findById(reportId);
        if (!report || !report[fieldName]?.data) {
            return res.status(404).send('File not found');
        }
        if (report.userId.toString() !== req.session.user.id) {
            return res.status(403).send('Unauthorized access');
        }
        res.set('Content-Type', report[fieldName].contentType);
        res.send(report[fieldName].data);
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).send('Error retrieving file');
    }
});

// Download report for user
router.get('/download-report/:reportId/:fieldName', ensureAuthorized('user'), async (req, res) => {
    const { reportId, fieldName } = req.params;
    try {
        const report = await LabReport.findById(reportId);
        if (!report || !report[fieldName]?.data) {
            return res.status(404).send('File not found');
        }
        if (report.userId.toString() !== req.session.user.id) {
            return res.status(403).send('Unauthorized access');
        }
        res.set({
            'Content-Type': report[fieldName].contentType,
            'Content-Disposition': `attachment; filename="${report[fieldName].filename}"`
        });
        res.send(report[fieldName].data);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
});

// View report for dietitian
router.get('/view-report-dietitian/:reportId/:fieldName', ensureAuthorized('dietitian'), async (req, res) => {
    const { reportId, fieldName } = req.params;
    try {
        const report = await LabReport.findById(reportId);
        if (!report || !report[fieldName]?.data) {
            return res.status(404).send('File not found');
        }
        if (report.dietitianId.toString() !== req.session.dietitian.id) {
            return res.status(403).send('Unauthorized access');
        }
        res.set('Content-Type', report[fieldName].contentType);
        res.send(report[fieldName].data);
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).send('Error retrieving file');
    }
});

// Download report for dietitian
router.get('/download-report-dietitian/:reportId/:fieldName', ensureAuthorized('dietitian'), async (req, res) => {
    const { reportId, fieldName } = req.params;
    try {
        const report = await LabReport.findById(reportId);
        if (!report || !report[fieldName]?.data) {
            return res.status(404).send('File not found');
        }
        if (report.dietitianId.toString() !== req.session.dietitian.id) {
            return res.status(403).send('Unauthorized access');
        }
        res.set({
            'Content-Type': report[fieldName].contentType,
            'Content-Disposition': `attachment; filename="${report[fieldName].filename}"`
        });
        res.send(report[fieldName].data);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
});

// Debug route to list available file fields
router.get('/debug-report-fields/:reportId', ensureAuthorized('user'), async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await LabReport.findById(reportId).lean();
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        if (report.userId.toString() !== req.session.user.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        const fileFields = Object.keys(report).filter(key => report[key]?.data instanceof Buffer);
        res.json({
            reportId,
            availableFileFields: fileFields,
            details: fileFields.map(field => ({
                field,
                filename: report[field].filename,
                contentType: report[field].contentType,
                size: report[field].data.length
            }))
        });
    } catch (error) {
        console.error('Error debugging report fields:', error);
        res.status(500).json({ error: 'Failed to debug report fields', details: error.message });
    }
});

module.exports = router;