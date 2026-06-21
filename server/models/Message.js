const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true },
  author: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, maxlength: 2000, default: '' },
  fileUrl: { type: String, default: null },
  fileType: { type: String, default: null },
  fileName: { type: String, default: null },
  messageType: { type: String, enum: ['public', 'private'], default: 'public' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);