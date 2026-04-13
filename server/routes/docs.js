const router = require('express').Router();
const multer = require('multer');
const auth = require('../middlewares/auth');
const Document = require('../models/Document');
const { extractTextFromPDF, chunkText } = require('../services/pdfProcessor');
const { getEmbedding } = require('../services/embedding');
const { addVector } = require('../services/vectorStore');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs allowed'));
  }
});

// Upload PDF
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { workspaceId } = req.body;
    
    console.log('📄 Processing PDF:', req.file.path);
    
    const text = await extractTextFromPDF(req.file.path);
    console.log('📝 Extracted text length:', text.length);
    
    const chunks = chunkText(text);
    console.log('🔪 Number of chunks:', chunks.length);
    
    // ✅ এম্বেডিং তৈরি করুন এবং ভেক্টর স্টোরে সংরক্ষণ করুন
    const embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Creating embedding for chunk ${i + 1}/${chunks.length}...`);
      const embedding = await getEmbedding(chunks[i]);
      await addVector(embedding, {
        workspaceId,
        chunk: chunks[i],
        fileName: req.file.originalname,
        chunkIndex: i
      });
      embeddings.push(embedding);
    }
    
    const document = await Document.create({
      workspaceId,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      status: chunks.length > 0 ? 'done' : 'failed',
      chunks: chunks,
      chunkCount: chunks.length
    });
    
    res.json({ 
      success: true, 
      message: 'File uploaded and processed successfully', 
      document,
      chunks: chunks.length,
      textPreview: text.substring(0, 200)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ টেক্সট আপলোড (PDF ছাড়া - সহজ উপায়)
router.post('/upload-text', auth, async (req, res) => {
  try {
    const { workspaceId, text, fileName } = req.body;
    
    if (!text || text.length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }
    
    // টেক্সটকে ছোট ছোট অংশে ভাগ করুন
    const chunks = [];
    for (let i = 0; i < text.length; i += 500) {
      let chunk = text.substring(i, i + 500);
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
    }
    
    // ✅ এম্বেডিং তৈরি করুন এবং ভেক্টর স্টোরে সংরক্ষণ করুন
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Creating embedding for chunk ${i + 1}/${chunks.length}...`);
      const embedding = await getEmbedding(chunks[i]);
      await addVector(embedding, {
        workspaceId,
        chunk: chunks[i],
        fileName: fileName || 'document.txt',
        chunkIndex: i
      });
    }
    
    const document = await Document.create({
      workspaceId,
      fileName: fileName || 'document.txt',
      fileUrl: 'text-input',
      status: 'done',
      chunks: chunks,
      chunkCount: chunks.length
    });
    
    res.json({ 
      success: true, 
      message: 'Text uploaded and processed successfully', 
      document,
      chunks: chunks.length
    });
  } catch (error) {
    console.error('Text upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get documents for workspace
router.get('/workspace/:workspaceId', auth, async (req, res) => {
  try {
    const docs = await Document.find({ workspaceId: req.params.workspaceId });
    res.json({ success: true, documents: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;