const mongoose = require('mongoose');
const Blog = require('../models/blogModel');

// Complete seed data with all required fields
const seedBlogs = [
  {
    title: "10 Weight Loss Tips",
    theme: "Weight Loss Tips",
    content: "Here are 10 effective weight loss tips...",
    images: [
      "https://media.licdn.com/dms/image/v2/D4E12AQEx5l2fZykY1g/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1670062385901?e=2147483647&v=beta&t=LtKVEzpyNrAGpQ5DFhVtHPyk9J-Rw5MiId6tu18bVj8",
      "https://img.freepik.com/free-photo/young-woman-training-outdoors-autumn-sunshine-concept-sport_155003-42585.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Sarah Johnson",
    authorEmail: "sarah.johnson@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "Healthy Eating Habits",
    theme: "Healthy Eating",
    content: "Learn about balanced diets and portion control...",
    images: [
      "https://i0.wp.com/images-prod.healthline.com/hlcmsresource/images/AN_images/healthy-eating-ingredients-1296x728-header.jpg?w=1155&h=1528",
      "https://img.freepik.com/free-photo/buddha-bowl-dish-with-vegetables-legumes-top-view_1150-42589.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Michael Chen",
    authorEmail: "michael.chen@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "The Benefits of Yoga",
    theme: "Fitness And Exercise",
    content: "Yoga is a great way to improve flexibility...",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqp_TAuXW1yv0S0Ubp7_kUznTEO_2uTLCQeQ&s",
      "https://img.freepik.com/free-photo/full-shot-man-doing-yoga-mat_23-2149249455.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Priya Sharma",
    authorEmail: "priya.sharma@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "5 Morning Routines for a Productive Day",
    theme: "Mindset and Motivation",
    content: "Start your day right with these 5 morning routines...",
    images: [
      "https://img.freepik.com/free-photo/young-woman-training-outdoors-autumn-sunshine-concept-sport_155003-42585.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. David Wilson",
    authorEmail: "david.wilson@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "How to Stay Motivated to Exercise",
    theme: "Fitness And Exercise",
    content: "Staying motivated to exercise can be challenging...",
    images: [
      "https://img.freepik.com/premium-photo/focused-man-checking-his-sports-watch-while-jogging-by-city-waterfront_283470-11070.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid",
      "https://img.freepik.com/free-photo/people-doing-zumba-class-gym_23-2149091112.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Emily Parker",
    authorEmail: "emily.parker@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "The Importance of Mental Health",
    theme: "Mindset and Motivation",
    content: "Mental health is just as important as physical health...",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZGM9d9EW-EMZfFUtMfK1bbF21PfLQmJal_Q&s",
      "https://img.freepik.com/free-photo/young-woman-meditating-outdoors_23-2148890783.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Robert Johnson",
    authorEmail: "robert.johnson@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "Top 5 Superfoods for Energy",
    theme: "Healthy Eating",
    content: "Boost your energy levels with these superfoods...",
    images: [
      "https://img.freepik.com/free-photo/buddha-bowl-dish-with-vegetables-legumes-top-view_1150-42589.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid",
      "https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Lisa Wong",
    authorEmail: "lisa.wong@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "How to Build a Home Workout Routine",
    theme: "Fitness And Exercise",
    content: "You don't need a gym to stay fit...",
    images: [
      "https://img.freepik.com/free-photo/full-shot-man-doing-yoga-mat_23-2149249455.jpg?t=st=1742235099~exp=1742238699~hmac=d12f6abecdbdc0a78fc46f0720e70ea56b14e2128d390aee87cfdec722d8ed73&w=1380",
      "https://img.freepik.com/free-photo/young-healthy-man-athlete-doing-exercise-with-ropes-gym-single-male-model-practicing-hard-training-his-upper-body-concept-healthy-lifestyle-sport-people-bodybuilding-wellbeing_155003-34601.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Mark Taylor",
    authorEmail: "mark.taylor@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "The Science of Sleep",
    theme: "Mindset and Motivation",
    content: "Sleep is essential for physical and mental health...",
    images: [
      "https://img.freepik.com/premium-photo/asleep-young-arab-man-sleeping-resting-peacefully-comfortable-bed-lying-with-closed-eyes-free_922936-69017.jpg?ga=GA1.1 metoda=1.1284045158.1715777278&semt=ais_hybrid",
      "https://img.freepik.com/free-photo/young-woman-sleeping-comfortably-bed_23-2148883769.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. Anna Lee",
    authorEmail: "anna.lee@nutriconnect.com",
    createdAt: new Date()
  },
  {
    title: "Hydration and Its Benefits",
    theme: "Healthy Eating",
    content: "Staying hydrated is crucial for overall health...",
    images: [
      "https://img.freepik.com/free-photo/fresh-cold-water-drinking-glass_144627-27215.jpg",
      "https://img.freepik.com/free-photo/close-up-woman-drinking-water_23-2148867297.jpg"
    ],
    authorId: new mongoose.Types.ObjectId(),
    authorType: "dietitian",
    authorName: "Dr. James Wilson",
    authorEmail: "james.wilson@nutriconnect.com",
    createdAt: new Date()
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/NutriConnectDB');
    
    console.log('Connected to MongoDB');
    
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');
    
    await Blog.insertMany(seedBlogs);
    console.log(`Inserted ${seedBlogs.length} blog posts`);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();