require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Routes
const checkinRouter  = require('./routes/checkin');
const sosRouter      = require('./routes/sos');
const emailRouter    = require('./routes/email');
const whatsappRouter = require('./routes/whatsapp');

const app = express();

/*
==================================================
🚨 IMPORTANT FIX (Railway requirement)
==================================================
Railway automatically assigns PORT
so fallback zaroori hai
*/
const PORT = process.env.PORT || 3000;

// ───────────────────────────────────────────
// ✅ Middleware
// ───────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ───────────────────────────────────────────
// ❤️ Health Check (Railway uses this)
// ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'running',
    app: 'StillSafe Server',
    version: '1.0.0',
    message: 'Still Safe. Still Here.'
  });
});

// ───────────────────────────────────────────
// 🔐 API KEY Middleware
// ───────────────────────────────────────────
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API Key'
    });
  }

  next();
};

// ───────────────────────────────────────────
// 🚀 Routes (Protected)
// ───────────────────────────────────────────
app.use('/send-checkin', verifyApiKey, checkinRouter);
app.use('/send-sos', verifyApiKey, sosRouter);
app.use('/send-email', verifyApiKey, emailRouter);
app.use('/send-whatsapp', verifyApiKey, whatsappRouter);

// ───────────────────────────────────────────
// ❌ 404 Handler
// ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ───────────────────────────────────────────
// ❌ Global Error Handler
// ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// ───────────────────────────────────────────
// 🚀 START SERVER (RAILWAY SAFE)
// ───────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 StillSafe running on port ${PORT}`);
});