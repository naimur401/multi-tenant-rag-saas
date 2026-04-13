const rateLimit = require('express-rate-limit');

// সাধারণ API রেট লিমিট (প্রতি IP 100 রিকোয়েস্ট / 15 মিনিট)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 মিনিট
  max: 100, // প্রতি 15 মিনিটে সর্বোচ্চ 100 রিকোয়েস্ট
  message: { 
    success: false,
    error: 'Too many requests, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// কঠোর রেট লিমিট (লগইন/রেজিস্টারের জন্য)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15 মিনিটে মাত্র 5 বার চেষ্টা করতে পারবেন
  skipSuccessfulRequests: true, // সফল রিকোয়েস্ট কাউন্ট করবে না
  message: { 
    success: false,
    error: 'Too many login attempts, please try again later.' 
  },
});

// চ্যাট API রেট লিমিট (প্রতি মিনিটে 10 বার)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 মিনিট
  max: 10,
  message: { 
    success: false,
    error: 'Too many questions. Please slow down.' 
  },
});

module.exports = { generalLimiter, authLimiter, chatLimiter };