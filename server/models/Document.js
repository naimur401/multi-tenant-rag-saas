const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Types.ObjectId, ref: 'Workspace', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ['processing', 'done', 'failed'], default: 'processing' },
  chunks: [{ type: String }],
  chunkCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);