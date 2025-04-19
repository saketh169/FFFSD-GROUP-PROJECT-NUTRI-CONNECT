const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Client', 'Dietitian', 'Organization', 'Others'],
    default: 'Others'
  },
  query: {
    type: String,
    required: [true, 'Query message is required'],
    trim: true,
    minlength: [5, 'Query must be at least 10 characters long']
  },
  admin_reply: {
    type: String,
    trim: true
  },
  replied_at: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'replied'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at',
    updatedAt: 'updated_at' 
  }
});


const Query = mongoose.model('Query', querySchema);

module.exports = Query;