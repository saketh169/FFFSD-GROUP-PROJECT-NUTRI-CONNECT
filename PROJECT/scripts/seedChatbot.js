const mongoose = require('mongoose');
const Question = require('../models/chatModel');

// MongoDB connection string (replace with your own)
const mongoURI = 'mongodb://localhost:27017/NutriConnectDB'; // For local MongoDB
// For MongoDB Atlas: 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/nutritionDB?retryWrites=true&w=majority'

const nutritionQuestions = [
    { question: 'what is a balanced diet?', answer: 'A balanced diet includes a variety of foods in the right proportions, such as vegetables, fruits, whole grains, lean proteins, and healthy fats, to provide all the nutrients your body needs.' },
    { question: 'how many calories should I eat daily?', answer: 'It depends on your age, gender, activity level, and goals. On average, adults need 2000-2500 calories per day. Consult a dietitian for personalized advice!' },
    { question: 'what are good sources of protein?', answer: 'Good protein sources include lean meats, fish, eggs, beans, lentils, tofu, nuts, and seeds.' },
    { question: 'how much water should I drink?', answer: 'Aim for about 8 cups (2 liters) of water per day, but this can vary based on your activity level, climate, and individual needs.' },
    { question: 'what are the benefits of fiber?', answer: 'Fiber aids digestion, helps control blood sugar, lowers cholesterol levels, and promotes a healthy gut. Good sources include whole grains, fruits, vegetables, and legumes.' },
    { question: 'how can I boost my metabolism?', answer: 'To boost your metabolism, eat protein-rich foods, stay hydrated, exercise regularly (especially strength training), get enough sleep, and avoid skipping meals.' },
    { question: 'what foods are high in iron?', answer: 'Iron-rich foods include red meat, poultry, fish, spinach, lentils, chickpeas, and fortified cereals.' },
    { question: 'how can I reduce sugar intake?', answer: 'To reduce sugar intake, avoid sugary drinks, check food labels for added sugars, choose whole fruits over juices, and use natural sweeteners like honey sparingly.' },
    { question: 'what are the benefits of omega-3 fatty acids?', answer: 'Omega-3 fatty acids support heart health, reduce inflammation, and improve brain function. They’re found in fatty fish like salmon, walnuts, and flaxseeds.' },
    { question: 'what is the glycemic index?', answer: 'The glycemic index (GI) measures how quickly a carbohydrate-containing food raises blood sugar levels. Low-GI foods (e.g., whole grains) are better for sustained energy.' },
    { question: 'how can I increase my vitamin D intake?', answer: 'To increase vitamin D, eat foods like fatty fish, egg yolks, and fortified dairy, get sunlight exposure, or consider a supplement if needed.' },
    { question: 'what are the best foods for weight loss?', answer: 'Foods for weight loss include lean proteins, vegetables, fruits, whole grains, and healthy fats. Focus on portion control and avoid processed foods.' },
    { question: 'what is a superfood?', answer: 'Superfoods are nutrient-dense foods like berries, kale, quinoa, and salmon that offer significant health benefits, such as antioxidants and vitamins.' },
    { question: 'how can I improve my gut health?', answer: 'Improve gut health by eating probiotic-rich foods (yogurt, kefir), prebiotic foods (garlic, onions), and a variety of fiber-rich fruits and vegetables.' },
    { question: 'what are the benefits of eating whole grains?', answer: 'Whole grains provide fiber, vitamins, and minerals, helping with digestion, heart health, and maintaining stable blood sugar levels.' },
    { question: 'how much protein do I need daily?', answer: 'The average adult needs about 0.8 grams of protein per kilogram of body weight daily, but this can increase with activity level or specific goals.' },
    { question: 'what foods should I eat for better skin health?', answer: 'For better skin health, eat foods rich in antioxidants (berries, nuts), omega-3s (fish), and vitamins A, C, and E (carrots, oranges, avocados).' },
    { question: 'how can I lower my cholesterol?', answer: 'Lower cholesterol by eating more fiber (oats, beans), healthy fats (avocados, nuts), and reducing saturated fats and trans fats.' },
    { question: 'what are the benefits of drinking green tea?', answer: 'Green tea is rich in antioxidants, boosts metabolism, supports heart health, and may improve brain function.' },
    { question: 'what foods are good for heart health?', answer: 'Heart-healthy foods include fatty fish, nuts, seeds, whole grains, fruits, vegetables, and foods high in fiber and healthy fats.' },
    { question: 'how can I get more calcium in my diet?', answer: 'Increase calcium intake with dairy products (milk, yogurt), leafy greens (kale, broccoli), almonds, and fortified plant-based milks.' },
    { question: 'what are the signs of dehydration?', answer: 'Signs of dehydration include thirst, dry mouth, fatigue, dizziness, dark urine, and headache. Drink water immediately if you notice these.' },
    { question: 'what is the difference between saturated and unsaturated fats?', answer: 'Saturated fats (e.g., butter, red meat) are solid at room temperature and can raise cholesterol, while unsaturated fats (e.g., olive oil, avocados) are liquid and heart-healthy.' },
    { question: 'how can I eat more plant-based meals?', answer: 'Incorporate more plant-based meals by using beans, lentils, tofu, or tempeh as protein sources, and focus on vegetables, grains, and fruits.' },
    { question: 'what are the benefits of eating nuts?', answer: 'Nuts are rich in healthy fats, protein, fiber, and antioxidants, supporting heart health, weight management, and reducing inflammation.' },
    { question: 'how can I manage food cravings?', answer: 'Manage cravings by eating balanced meals, staying hydrated, keeping healthy snacks like fruits or nuts on hand, and addressing stress or boredom.' },
    { question: 'what foods help with muscle recovery?', answer: 'For muscle recovery, eat protein-rich foods (chicken, eggs, Greek yogurt) and carbs (sweet potatoes, quinoa) to replenish energy stores.' },
    { question: 'how much sodium should I consume daily?', answer: 'The recommended sodium intake is less than 2,300 mg per day, ideally around 1,500 mg for most adults to support heart health.' },
    { question: 'what are the benefits of eating berries?', answer: 'Berries are high in antioxidants, fiber, and vitamins, supporting heart health, brain function, and reducing inflammation.' },
    { question: 'how can I reduce bloating?', answer: 'Reduce bloating by avoiding carbonated drinks, eating slowly, limiting salt, and consuming fiber-rich foods like vegetables and whole grains.' },
    { question: 'what foods are good for brain health?', answer: 'Brain-healthy foods include fatty fish, blueberries, nuts, eggs, and leafy greens, which provide omega-3s, antioxidants, and vitamins.' },
    { question: 'how can I increase my energy levels?', answer: 'Boost energy by eating balanced meals with protein, carbs, and fats, staying hydrated, and including iron-rich foods like spinach or lean meats.' },
    { question: 'what is the role of vitamin C in the body?', answer: 'Vitamin C boosts immunity, supports skin health, aids in collagen production, and acts as an antioxidant. Find it in citrus fruits, bell peppers, and strawberries.' },
    { question: 'how can I eat healthily on a budget?', answer: 'Eat healthily on a budget by buying in-season produce, choosing frozen fruits and veggies, opting for bulk grains and legumes, and planning meals.' },
    { question: 'what are the benefits of eating eggs?', answer: 'Eggs are rich in protein, healthy fats, and nutrients like choline, supporting muscle growth, brain health, and eye health.' },
    { question: 'how can I improve my immune system?', answer: 'Boost your immune system by eating foods rich in vitamins C and D, zinc (nuts, seeds), and probiotics (yogurt), and getting enough sleep.' },
    { question: 'what foods should I avoid for better digestion?', answer: 'Avoid foods high in fat, processed foods, artificial sweeteners, and carbonated drinks to improve digestion.' },
    { question: 'how can I get more antioxidants in my diet?', answer: 'Increase antioxidants by eating colorful fruits and vegetables like berries, spinach, carrots, and dark chocolate.' },
    { question: 'what are the benefits of hydration?', answer: 'Hydration supports digestion, regulates body temperature, improves skin health, and enhances focus and energy levels.' },
    { question: 'how can I reduce inflammation through diet?', answer: 'Reduce inflammation by eating anti-inflammatory foods like fatty fish, leafy greens, berries, turmeric, and olive oil.' },
    { question: 'what are the best snacks for weight management?', answer: 'Healthy snacks for weight management include Greek yogurt, nuts, fruits, veggies with hummus, and hard-boiled eggs.' },
    { question: 'how can I increase my fiber intake?', answer: 'Increase fiber by eating more whole grains, fruits, vegetables, legumes, and seeds like chia or flaxseeds.' },
    { question: 'what foods are good for eye health?', answer: 'Foods for eye health include carrots, spinach, salmon, and eggs, which are rich in vitamins A, C, E, and omega-3s.' },
    { question: 'how can I maintain healthy blood sugar levels?', answer: 'Maintain blood sugar by eating low-GI foods (whole grains, legumes), pairing carbs with protein or fats, and avoiding sugary drinks.' },
    { question: 'what are the benefits of eating avocados?', answer: 'Avocados are rich in healthy fats, fiber, and potassium, supporting heart health, digestion, and skin health.' },
    { question: 'how can I get more probiotics in my diet?', answer: 'Increase probiotics by eating fermented foods like yogurt, kefir, sauerkraut, kimchi, and kombucha.' },
    { question: 'what foods help with stress management?', answer: 'Foods that help with stress include dark chocolate, bananas, fatty fish, and nuts, which provide magnesium, omega-3s, and antioxidants.' },
    { question: 'how can I improve my bone health?', answer: 'Improve bone health by consuming calcium-rich foods (dairy, leafy greens) and vitamin D (fish, fortified foods), and doing weight-bearing exercises.' },
    { question: 'what are the benefits of eating spinach?', answer: 'Spinach is rich in iron, vitamins A, C, and K, supporting blood health, immunity, and bone health.' },
    { question: 'how can I eat more sustainably?', answer: 'Eat sustainably by choosing local, seasonal produce, reducing meat consumption, and minimizing food waste.' },
    { question: 'what are the best foods for hydration?', answer: 'Hydrating foods include watermelon, cucumber, oranges, celery, and coconut water.' }
];

// Function to connect to MongoDB and seed the database
const seedChatbotQuestions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
        });
        console.log('Connected to MongoDB');

        // Check if the database has already been seeded
        const questionCount = await Question.countDocuments();
        if (questionCount > 0) {
            console.log('Chatbot questions already seeded. Skipping seeding process.');
            return;
        }

        // Seed the database with the questions
        await Question.insertMany(nutritionQuestions);
        console.log('Chatbot seed data inserted successfully');
    } catch (err) {
        console.error('Error seeding chatbot data:', err);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

// Execute the seeding function
seedChatbotQuestions();