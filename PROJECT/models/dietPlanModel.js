const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    dietitianName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    dietType: { 
        type: String, 
        required: true, 
        enum: ['Keto', 'Vegan', 'Vegetarian', 'Anything', 'Mediterranean', 'Paleo', 'Low-Carb', 'Gluten-Free']
    },
    calories: { 
        type: Number, 
        required: true, 
        min: 500, 
        max: 5000 
    },
    mealCount: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    meals: [{
        name: { 
            type: String, 
            required: true, 
            trim: true 
        },
        image: { 
            type: Buffer, 
            default: null 
        },
       
    }],
    dietitianId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        default: () => new mongoose.Types.ObjectId(), // Auto-generate if not provided
        ref: 'Dietitian' 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
});

dietPlanSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

module.exports = DietPlan;