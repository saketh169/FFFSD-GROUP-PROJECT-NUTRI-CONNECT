const express = require('express');
const router = express.Router();
const DietPlan = require('../models/dietPlanModel');
const { Subscription } = require('../models/paymentModel');
const mongoose = require('mongoose');
const multers = require('multer');
const axios = require('axios');

// Middleware to ensure the user is authenticated
const ensureUserAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }
    next();
};

// Model for tracking plan fetches
const PlanFetchLog = mongoose.model('PlanFetchLog', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    timestamp: { type: Date, default: Date.now }
}));

// Middleware to check plan fetch restrictions based on subscription plan
const checkPlanFetchRestrictions = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const userId = req.session.user.id;
        const date = req.query.date || new Date().toISOString().split('T')[0]; // Use query date or current date

        // Determine the user's daily plan fetch limit based on their subscription
        let dailyFetchLimit = 3; // Default for users without a plan
        let errorMessage = 'Maximum 3 plan fetches per day reached. Subscribe to a membership plan to fetch more.';
        const activeSubscription = await Subscription.findOne({
            userId,
            active: true,
            status: 'success',
            expiresAt: { $gt: new Date() } // Ensure subscription is not expired
        });

        if (activeSubscription) {
            const planName = activeSubscription.name;
            if (planName === 'Basic Plan') {
                dailyFetchLimit = 8;
                errorMessage = 'Maximum 8 plan fetches per day reached for your Basic plan. Try another day.';
            } else if (planName === 'Premium Plan') {
                dailyFetchLimit = 20;
                errorMessage = 'Maximum 20 plan fetches per day reached for your Premium plan. Try another day.';
            } else if (planName === 'Ultimate Plan') {
                dailyFetchLimit = Infinity; // Unlimited fetches
                errorMessage = ''; // No error message needed
            }
        }

        // Skip fetch count check for Ultimate Plan (unlimited)
        if (dailyFetchLimit !== Infinity) {
            // Check the user's daily plan fetch count against their limit
            const userFetchCount = await PlanFetchLog.countDocuments({
                userId,
                date
            });

            if (userFetchCount >= dailyFetchLimit) {
                return res.status(400).json({
                    success: false,
                    message: errorMessage
                });
            }

            // Log the plan fetch
            await new PlanFetchLog({ userId, date }).save();
        }

        next();
    } catch (error) {
        console.error('Error checking plan fetch restrictions:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking plan fetch availability',
            error: error.message
        });
    }
};

// Multer configuration for meal image uploads
const storage = multers.memoryStorage();
const upload = multers({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
}).fields([
    { name: 'mealImage0', maxCount: 1 },
    { name: 'mealImage1', maxCount: 1 },
    { name: 'mealImage2', maxCount: 1 },
    { name: 'mealImage3', maxCount: 1 },
    { name: 'mealImage4', maxCount: 1 },
    { name: 'mealImage5', maxCount: 1 },
    { name: 'mealImage6', maxCount: 1 },
    { name: 'mealImage7', maxCount: 1 },
    { name: 'mealImage8', maxCount: 1 },
    { name: 'mealImage9', maxCount: 1 }
]);

// Enhanced image download function with data URI support
async function downloadImageToBuffer(url) {
    try {
        if (!url) return null;

        // Check if the URL is a data URI
        if (url.startsWith('data:image/')) {
            const base64Data = url.split(';base64,')[1];
            if (!base64Data) {
                console.log(`⚠️ Invalid data URI: ${url}`);
                return null;
            }
            return Buffer.from(base64Data, 'base64');
        }

        // Handle regular HTTP/HTTPS URLs
        if (!url.startsWith('http')) {
            url = url.startsWith('//') ? `https:${url}` : `https://${url}`;
        }

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            },
            maxRedirects: 5,
            timeout: 10000
        });

        if (!response.data || response.status !== 200) {
            console.log(`⚠️ Image download failed for ${url} - status ${response.status}`);
            return null;
        }

        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
            console.log(`⚠️ Invalid content type (${contentType}) for ${url}`);
            return null;
        }

        return Buffer.from(response.data, 'binary');
    } catch (err) {
        console.log(`⚠️ Image download failed for ${url}: ${err.message}`);
        return null;
    }
}

// Create new diet plan
router.post('/add-plans', upload, async (req, res) => {
    try {
        if (!req.body.plans) {
            return res.status(400).json({
                success: false,
                message: 'Plans data is required'
            });
        }

        const plansData = JSON.parse(req.body.plans);
        if (!Array.isArray(plansData)) {
            return res.status(400).json({
                success: false,
                message: 'Plans data must be an array'
            });
        }

        const savedPlans = [];

        for (const planData of plansData) {
            // Validate required fields
            if (!planData.dietitianName || !planData.dietType ||
                !planData.calories || !planData.mealCount || !planData.meals) {
                continue;
            }

            // Validate meals array
            if (!Array.isArray(planData.meals) ||
                !planData.meals.every(meal => meal && typeof meal === 'object' && meal.name && typeof meal.name === 'string')) {
                console.warn(`Invalid meals array in plan for ${planData.dietitianName}`);
                continue;
            }

            // Process meals with images
            const processedMeals = await Promise.all(planData.meals.map(async (meal, index) => {
                // Get the file from req.files object
                const fileKey = `mealImage${index}`;
                const file = req.files && req.files[fileKey] ? req.files[fileKey][0] : null;

                let imageBuffer = null;

                // If file is uploaded, use that
                if (file) {
                    imageBuffer = file.buffer;
                }
                // If URL is provided, download or process it
                else if (meal.image) {
                    imageBuffer = await downloadImageToBuffer(meal.image);
                }

                return {
                    name: meal.name,
                    image: imageBuffer,
                    imageUrl: !imageBuffer && meal.image ? meal.image : null
                };
            }));

            // Create new plan
            const newPlan = new DietPlan({
                dietitianName: planData.dietitianName,
                dietType: planData.dietType,
                calories: parseInt(planData.calories),
                mealCount: parseInt(planData.mealCount),
                meals: processedMeals
            });

            const savedPlan = await newPlan.save();
            savedPlans.push(savedPlan);
        }

        res.status(201).json({
            success: true,
            message: 'Plans created successfully',
            plans: savedPlans.map(p => ({
                _id: p._id,
                dietitianName: p.dietitianName,
                dietType: p.dietType,
                calories: p.calories,
                mealCount: p.mealCount,
                meals: p.meals.map(m => ({
                    name: m.name,
                    image: m.image ? `data:image/jpeg;base64,${m.image.toString('base64')}` : m.imageUrl
                })),
                createdAt: p.createdAt
            }))
        });

    } catch (error) {
        console.error('Error creating diet plans:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating plans',
            error: error.message
        });
    }
});

// Get all diet plans
router.get('/get-plans', async (req, res) => {
    try {
        const { dietitianId, dietType, minCalories, maxCalories } = req.query;

        // Build query
        const query = {};
        if (dietitianId) query.dietitianId = new mongoose.Types.ObjectId(dietitianId);
        if (dietType) query.dietType = dietType;
        if (minCalories || maxCalories) {
            query.calories = {};
            if (minCalories) query.calories.$gte = parseInt(minCalories);
            if (maxCalories) query.calories.$lte = parseInt(maxCalories);
        }

        const plans = await DietPlan.find(query)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            count: plans.length,
            plans: plans.map(p => ({
                _id: p._id,
                dietitianName: p.dietitianName,
                dietType: p.dietType,
                calories: p.calories,
                mealCount: p.mealCount,
                meals: p.meals.map(m => ({
                    name: m.name,
                    image: m.image ? `data:image/jpeg;base64,${m.image.toString('base64')}` : null
                })),
                dietitianId: p.dietitianId,
                createdAt: p.createdAt
            }))
        });

    } catch (error) {
        console.error('Error fetching diet plans:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching plans',
            error: error.message
        });
    }
});

// Fetch diet plans with restrictions
router.get('/fetch-plans', ensureUserAuthenticated, checkPlanFetchRestrictions, async (req, res) => {
    try {
        const { dietitianId, dietType, minCalories, maxCalories, mealCount } = req.query;

        // Build query
        const query = {};
        if (dietitianId) query.dietitianId = new mongoose.Types.ObjectId(dietitianId);
        if (dietType) query.dietType = dietType;
        if (minCalories || maxCalories) {
            query.calories = {};
            if (minCalories) query.calories.$gte = parseInt(minCalories);
            if (maxCalories) query.calories.$lte = parseInt(maxCalories);
        }
        if (mealCount) query.mealCount = parseInt(mealCount);

        const plans = await DietPlan.find(query)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            count: plans.length,
            plans: plans.map(p => ({
                _id: p._id,
                dietitianName: p.dietitianName,
                dietType: p.dietType,
                calories: p.calories,
                mealCount: p.mealCount,
                meals: p.meals.map(m => ({
                    name: m.name,
                    image: m.image ? `data:image/jpeg;base64,${m.image.toString('base64')}` : m.imageUrl || 'https://via.placeholder.com/110?text=No+Image'
                })),
                dietitianId: p.dietitianId,
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching diet plans:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching plans',
            error: error.message
        });
    }
});

module.exports = router;