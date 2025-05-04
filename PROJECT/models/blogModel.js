const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  theme: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the author
  authorType: { type: String, required: true, enum: ['user', 'dietitian'] }, // Type of author
  authorName: { type: String, required: true }, // Author's name for display
  authorEmail: { type: String, required: true }, // Author's email
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);