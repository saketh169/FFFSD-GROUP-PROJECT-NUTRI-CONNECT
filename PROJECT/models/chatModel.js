const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true, unique: true },
    answer: { type: String, required: true }
});

module.exports = mongoose.model('Question', questionSchema);