// models/Chat.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // 'user' or 'agent'
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  messages: [messageSchema],
  // Add other relevant fields for the chat here
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
