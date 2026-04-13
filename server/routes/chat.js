const router = require('express').Router();
const auth = require('../middlewares/auth');
const Chat = require('../models/Chat');
const { getEmbedding } = require('../services/embedding');
const { searchSimilar } = require('../services/vectorStore');

// Ask question
router.post('/query', auth, async (req, res) => {
  try {
    const { workspaceId, question } = req.body;
    
    if (!workspaceId || !question) {
      return res.status(400).json({ error: 'workspaceId and question are required' });
    }
    
    console.log(`📝 Question: ${question}`);
    console.log(`📁 Workspace: ${workspaceId}`);
    console.log(`👤 User: ${req.userId}`);
    
    // প্রশ্নের এম্বেডিং তৈরি করুন
    const qVector = await getEmbedding(question);
    
    // সিমিলার চাঙ্ক খুঁজুন
    const relevant = await searchSimilar(qVector, 5, workspaceId);
    console.log(`🔍 Found ${relevant.length} relevant chunks`);
    
    let answer;
    if (relevant.length > 0) {
      const context = relevant.map(r => r.chunk).join('\n\n');
      const sources = [...new Set(relevant.map(r => r.fileName))];
      answer = context.substring(0, 800) + `\n\n📚 Sources: ${sources.join(', ')}`;
    } else {
      answer = "📄 No relevant information found. Please upload some documents first.";
    }
    
    // Chat সংরক্ষণ করুন
    const chat = new Chat({
      workspaceId,
      userId: req.userId,
      messages: [
        { role: 'user', content: question, timestamp: new Date() },
        { role: 'assistant', content: answer, sources: relevant.map(r => ({ fileName: r.fileName })), timestamp: new Date() }
      ]
    });
    
    const savedChat = await chat.save();
    console.log(`💾 Chat saved with ID: ${savedChat._id}`);
    
    res.json({ 
      success: true, 
      answer, 
      chatId: savedChat._id,
      sourcesCount: relevant.length 
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for a workspace
router.get('/history/:workspaceId', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ 
      workspaceId: req.params.workspaceId,
      userId: req.userId 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, chats });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single chat by ID
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Check access
    if (chat.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;