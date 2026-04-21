const express = require('express');
const router  = express.Router();
const { sendWhatsApp } = require('../services/whatsappService');

router.post('/', async (req, res) => {
  const { phone, type, data } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'phone is required',
    });
  }

  const result = await sendWhatsApp({
    phone,
    type: type || 'checkin',
    data: data || {},
  });

  res.json(result);
});

module.exports = router;