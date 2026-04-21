const express = require('express');
const router  = express.Router();

const { sendEmailToContacts }    = require('../services/emailService');
const { sendWhatsAppToContacts } = require('../services/whatsappService');
const { validateSOS }            = require('../middleware/validate');

router.post('/', validateSOS, async (req, res) => {
  const {
    userEmail,
    contacts,
    latitude,
    longitude,
    timestamp = new Date().toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
    }),
  } = req.body;

  // Build Google Maps link if location provided
  const location = (latitude && longitude)
    ? `https://maps.google.com/?q=${latitude},${longitude}`
    : null;

  const data = { userEmail, timestamp, location };

  try {
    // Send SOS emails
    const emailResults = await sendEmailToContacts({
      contacts,
      subject: `🚨 URGENT: StillSafe SOS Alert from ${userEmail}`,
      type:    'sos',
      data,
    });

    // Send SOS WhatsApp
    const waResults = await sendWhatsAppToContacts({
      contacts,
      type: 'sos',
      data,
    });

    const emailsSent = emailResults.filter(r => r.success).length;
    const waSent     = waResults.filter(r => r.success).length;

    res.json({
      success: true,
      message: `SOS sent! ${emailsSent} email(s), ${waSent} WhatsApp(s)`,
      emailResults,
      waResults,
    });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SOS alerts',
      error:   error.message,
    });
  }
});

module.exports = router;