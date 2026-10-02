const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false, // User is unverified until they confirm via JWT
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  phoneNumber: {
      type: String,
      trim: true,
      default: '',
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'],
    },
});

module.exports = mongoose.model('User', userSchema);