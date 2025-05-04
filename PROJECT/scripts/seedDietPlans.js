
const axios = require('axios');
const mongoose = require('mongoose');
const DietPlan = require('../models/dietPlanModel');

// Enhanced image download function with better error handling
async function downloadImageToBuffer(url) {
    try {
        if (!url) return null;
        
        // Ensure URL has proper protocol
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

// Normalize dietType to match schema enum
function normalizeDietType(type) {
    const typeMap = {
        'anything': 'Anything',
        'keto': 'Keto',
        'vegan': 'Vegan',
        'vegetarian': 'Vegetarian',
        'low-carb': 'Low-Carb',
        'mediterranean': 'Mediterranean',
        'paleo': 'Paleo',
        'gluten-free': 'Gluten-Free'
    };
    
    if (!type) throw new Error('Diet type is required');
    
    const lowerType = type.toLowerCase();
    const normalized = typeMap[lowerType];
    
    if (!normalized) {
        throw new Error(`Invalid diet type: ${type}`);
    }
    return normalized;
}

// Main function to create and insert diet plans
async function createDietPlans() {
    const dietPlans = [
        // Anything Diet Plans
        {
            dietitianName: "Dr. Ava Taylor",
            dietType: "anything",
            calories: 1000,
            mealCount: 2,
            meals: [
                { 
                    name: "Lunch: Chicken Salad (600 cal)", 
                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" 
                },
                { 
                    name: "Snack: Mixed Nuts (400 cal)", 
                    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db" 
                }
            ]
        },
        {
            dietitianName: "Dr. Noah Wilson",
            dietType: "anything",
            calories: 1000,
            mealCount: 2,
            meals: [
                { 
                    name: "Lunch: Tuna Sandwich (600 cal)", 
                    image: "https://images.unsplash.com/photo-1559054663-e8d7a376d6b8" 
                },
                { 
                    name: "Snack: Granola Bar (400 cal)", 
                    image: "https://images.unsplash.com/photo-1519996529931-28324d48471d" 
                }
            ]
        },
        {
            dietitianName: "Dr. Liam Scott",
            dietType: "anything",
            calories: 1600,
            mealCount: 3,
            meals: [
                { 
                    name: "Lunch: Turkey Sandwich (600 cal)", 
                    image: "https://images.unsplash.com/photo-1559054663-e8d7a376d6b8" 
                },
                { 
                    name: "Snack: Yogurt (400 cal)", 
                    image: "https://images.unsplash.com/photo-1519736960589-15fd8c6455c8" 
                },
                { 
                    name: "Dinner: Beef Stir-Fry (600 cal)", 
                    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6" 
                }
            ]
        },
        // Keto Diet Plans
        {
            dietitianName: "Dr. Ava Taylor",
            dietType: "keto",
            calories: 1000,
            mealCount: 2,
            meals: [
                { 
                    name: "Lunch: Avocado Chicken Salad (600 cal)", 
                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" 
                },
                { 
                    name: "Snack: Cheese Cubes (400 cal)", 
                    image: "https://images.unsplash.com/photo-1558030006-450675393462" 
                }
            ]
        },
        {
            dietitianName: "Dr. Liam Scott",
            dietType: "keto",
            calories: 1600,
            mealCount: 3,
            meals: [
                { 
                    name: "Lunch: Bacon Lettuce Wrap (600 cal)", 
                    image: "https://images.unsplash.com/photo-1559054663-e8d7a376d6b8" 
                },
                { 
                    name: "Snack: Pork Rinds (400 cal)", 
                    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db" 
                },
                { 
                    name: "Dinner: Salmon with Butter (600 cal)", 
                    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6" 
                }
            ]
        },
        // Mediterranean Diet Plans
        {
            dietitianName: "Dr. Jacob Green",
            dietType: "mediterranean",
            calories: 2800,
            mealCount: 5,
            meals: [
                { 
                    name: "Breakfast: Feta Omelette (500 cal)", 
                    image: "https://images.unsplash.com/photo-1525351292932-4148f258df71" 
                },
                { 
                    name: "Lunch: Lentil Salad (600 cal)", 
                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" 
                },
                { 
                    name: "Snack: Fig Bars (400 cal)", 
                    image: "https://images.unsplash.com/photo-1519996529931-28324d48471d" 
                },
                { 
                    name: "Dinner: Chicken Souvlaki (800 cal)", 
                    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6" 
                },
                { 
                    name: "Supper: Fruit Plate (500 cal)", 
                    image: "https://images.unsplash.com/photo-1519996529931-28324d48471d" 
                }
            ]
        },
        // Paleo Diet Plans
        {
            dietitianName: "Dr. Emma White",
            dietType: "paleo",
            calories: 2200,
            mealCount: 4,
            meals: [
                { 
                    name: "Breakfast: Egg Muffins (500 cal)", 
                    image: "https://images.unsplash.com/photo-1525351292932-4148f258df71" 
                },
                { 
                    name: "Lunch: Turkey Lettuce Wrap (600 cal)", 
                    image: "https://images.unsplash.com/photo-1559054663-e8d7a376d6b8" 
                },
                { 
                    name: "Snack: Apple Slices (400 cal)", 
                    image: "https://images.unsplash.com/photo-1596462502278-27bf715332de" 
                },
                { 
                    name: "Dinner: Pork Roast (700 cal)", 
                    image: "https://images.unsplash.com/photo-1590779033106-08a2fb1aebf2" 
                }
            ]
        },
        // Vegan Diet Plans
        {
            dietitianName: "Dr. Jacob Green",
            dietType: "vegan",
            calories: 2800,
            mealCount: 5,
            meals: [
                { 
                    name: "Breakfast: Avocado Toast (500 cal)", 
                    image: "https://images.unsplash.com/photo-1525351292932-4148f258df71" 
                },
                { 
                    name: "Lunch: Black Bean Burger (600 cal)", 
                    image: "https://images.unsplash.com/photo-1559054663-e8d7a376d6b8" 
                },
                { 
                    name: "Snack: Kale Chips (400 cal)", 
                    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db" 
                },
                { 
                    name: "Dinner: Tempeh Stir-Fry (800 cal)", 
                    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6" 
                },
                { 
                    name: "Supper: Fruit Smoothie (500 cal)", 
                    image: "https://images.unsplash.com/photo-1519996529931-28324d48471d" 
                }
            ]
        },
        // Vegetarian Diet Plans
        {
            dietitianName: "Dr. Emma White",
            dietType: "vegetarian",
            calories: 2200,
            mealCount: 4,
            meals: [
                { 
                    name: "Breakfast: Oatmeal (500 cal)", 
                    image: "https://images.unsplash.com/photo-1525351292932-4148f258df71" 
                },
                { 
                    name: "Lunch: Chickpea Salad (600 cal)", 
                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" 
                },
                { 
                    name: "Snack: Cheese (400 cal)", 
                    image: "https://images.unsplash.com/photo-1558030006-450675393462" 
                },
                { 
                    name: "Dinner: Stuffed Peppers (700 cal)", 
                    image: "https://images.unsplash.com/photo-1590779033106-08a2fb1aebf2" 
                }
            ]
        },
        // Low-Carb Diet Plans
        {
            dietitianName: "Dr. Liam Scott",
            dietType: "low-carb",
            calories: 1600,
            mealCount: 3,
            meals: [
                { 
                    name: "Lunch: Turkey Roll-Ups (600 cal)", 
                    image: "https://images.unsplash.com/photo-1559054663-e8d7a376d6b8" 
                },
                { 
                    name: "Snack: Avocado Slices (400 cal)", 
                    image: "https://images.unsplash.com/photo-1596462502278-27bf715332de" 
                },
                { 
                    name: "Dinner: Grilled Shrimp (600 cal)", 
                    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6" 
                }
            ]
        },
        // Gluten-Free Diet Plans
        {
            dietitianName: "Dr. Emma White",
            dietType: "gluten-free",
            calories: 2200,
            mealCount: 4,
            meals: [
                { 
                    name: "Breakfast: Smoothie Bowl (500 cal)", 
                    image: "https://images.unsplash.com/photo-1525351292932-4148f258df71" 
                },
                { 
                    name: "Lunch: Turkey Salad (600 cal)", 
                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" 
                },
                { 
                    name: "Snack: Almonds (400 cal)", 
                    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db" 
                },
                { 
                    name: "Dinner: Baked Cod (700 cal)", 
                    image: "https://images.unsplash.com/photo-1590779033106-08a2fb1aebf2" 
                }
            ]
        }
    ];

    try {
        // Connect to MongoDB without deprecated options
        await mongoose.connect('mongodb://localhost:27017/NutriConnectDB');
        console.log('🔗 Connected to MongoDB');

        // Clear existing data
        await DietPlan.deleteMany({});
        console.log('🗑️ Cleared existing diet plans');

        // Process all plans in parallel with proper error handling
        const results = await Promise.allSettled(dietPlans.map(async (plan) => {
            try {
                // Process all meals (with failed images becoming null)
                const processedMeals = await Promise.all(
                    plan.meals.map(async (meal) => ({
                        name: meal.name,
                        image: await downloadImageToBuffer(meal.image),
                        
                    }))
                );

                // Create the plan document
                const newPlan = new DietPlan({
                    dietitianName: plan.dietitianName,
                    dietType: normalizeDietType(plan.dietType),
                    calories: plan.calories,
                    mealCount: plan.mealCount,
                    meals: processedMeals,
                    dietitianId: new mongoose.Types.ObjectId() // Auto-generated
                });

                // Save to database
                const savedPlan = await newPlan.save();
                return {
                    status: 'success',
                    plan: savedPlan,
                    message: `Created plan for ${plan.dietitianName}`
                };
            } catch (error) {
                return {
                    status: 'error',
                    planName: plan.dietitianName,
                    message: `Failed to create plan: ${error.message}`
                };
            }
        }));

        // Log results
        console.log('\n🍽️ Diet Plan Creation Results:');
        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                if (result.value.status === 'success') {
                    console.log(`✅ ${result.value.message} (ID: ${result.value.plan._id})`);
                    console.log(`   Meals: ${result.value.plan.meals.map(m => 
                        `${m.name} ${m.image ? '[with image]' : '[no image]'}`).join(', ')}`);
                } else {
                    console.log(`❌ ${result.value.message}`);
                }
            } else {
                console.log(`❌ Unhandled error: ${result.reason.message}`);
            }
        });

        console.log('\n✨ Diet plan creation process completed');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Critical error in diet plan creation:', error.message);
        process.exit(1);
    }
}

// Execute the function
createDietPlans();