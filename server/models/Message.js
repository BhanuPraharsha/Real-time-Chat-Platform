const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true },
  author: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true, maxlength: 2000 },
  messageType: { type: String, enum: ['public', 'private'], default: 'public' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);