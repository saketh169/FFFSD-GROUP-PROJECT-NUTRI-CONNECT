const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/NutriConnectDB');
    console.log('✅ MongoDB Connected Successfully!\n');
  } catch (err) {
    console.error('❌ Mongo DB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;