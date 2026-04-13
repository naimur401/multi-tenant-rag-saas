const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Types.ObjectId, ref: 'Workspace', required: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sources: [{ 
      fileName: String, 
      page: Number 
    }],
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);