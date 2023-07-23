// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add other fields for user profile (e.g., name, phone number, etc.)
});

const User = mongoose.model('User', userSchema);

module.exports = User;
