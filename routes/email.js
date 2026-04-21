const express = require('express');
const router  = express.Router();
const { sendEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
  const { toEmail, toName, subject, type, data } = req.body;

  if (!toEmail || !subject) {
    return res.status(400).json({
      success: false,
      message: 'toEmail and subject required',
    });
  }

  const result = await sendEmail({
    toEmail,
    toName: toName || 'Contact',
    subject,
    type:   type || 'checkin',
    data:   data || {},
  });

  res.json(result);
});

module.exports = router;