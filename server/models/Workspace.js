const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  plan: { type: String, enum: ['free', 'pro'], default: 'free' }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);