require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Routers
const checkinRouter   = require('./routes/checkin');
const sosRouter       = require('./routes/sos');
const emailRouter     = require('./routes/email');
const whatsappRouter  = require('./routes/whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

// ───────────────────────────────────────────
// ✅ Middleware
// ───────────────────────────────────────────
app.use(cors());

// Built-in JSON parser (body-parser ki zaroorat nahi)
app.use(express.json());

// ───────────────────────────────────────────
// ✅ Health Check Route
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
// 🔐 API KEY Middleware (Security Layer)
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
// ✅ Routes
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
// 🚀 Start Server
// ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 StillSafe server running on port ${PORT}`);
});