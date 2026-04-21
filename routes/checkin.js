console.log("✅ checkin route loaded");
const express = require('express');
const router  = express.Router();

const { sendEmailToContacts }    = require('../services/emailService');
const { sendWhatsAppToContacts } = require('../services/whatsappService');
const { validateCheckIn }        = require('../middleware/validate');

router.post('/', validateCheckIn, async (req, res) => {
  const {
    userEmail,
    contacts,
    customMessage = '',
    timestamp     = new Date().toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
    }),
  } = req.body;

  const data = { userEmail, customMessage, timestamp };

  try {
    // Send emails to all contacts
    const emailResults = await sendEmailToContacts({
      contacts,
      subject: `StillSafe ✅ — ${userEmail} is Still Safe!`,
      type:    'checkin',
      data,
    });

    // Send WhatsApp to contacts who have number
    const waResults = await sendWhatsAppToContacts({
      contacts,
      type: 'checkin',
      data,
    });

    const emailsSent = emailResults.filter(r => r.success).length;
    const waSent     = waResults.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Check-in sent! ${emailsSent} email(s), ${waSent} WhatsApp(s)`,
      emailResults,
      waResults,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send check-in alerts',
      error:   error.message,
    });
  }
});

module.exports = router;