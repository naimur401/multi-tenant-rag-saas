const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ Rate Limiting Middlewares
const { generalLimiter, authLimiter, chatLimiter } = require('./middlewares/rateLimit');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ Apply Rate Limiters
app.use('/api', generalLimiter);      // সব API তে জেনারেল লিমিট (100/15min)
app.use('/api/auth', authLimiter);    // লগইন/রেজিস্টার এ কঠোর লিমিট (5/15min)
app.use('/api/chat', chatLimiter);    // চ্যাট এ আলাদা লিমিট (10/min)

// Home Route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 RAG SaaS API is running!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      workspace: 'GET /api/workspace',
      docs: 'GET /api/docs',
      chat: 'GET /api/chat'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workspace', require('./routes/workspace'));
app.use('/api/docs', require('./routes/docs'));
app.use('/api/chat', require('./routes/chat'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    message: 'Please check the endpoint URL'
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});