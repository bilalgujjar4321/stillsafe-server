const twilio = require('twilio');

const client    = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM
  || 'whatsapp:+14155238886';

// ── Build Message ──────────────────────────
function buildMessage(type, data) {
  const time = data.timestamp || new Date().toLocaleString();

  if (type === 'sos') {
    let msg = `🚨 *EMERGENCY SOS ALERT*\n\n`
            + `*${data.userEmail}* has triggered an SOS!\n\n`
            + `🕐 Time: ${time}\n\n`
            + `⚠️ Please contact them IMMEDIATELY!`;

    if (data.location) {
      msg += `\n\n📍 Location:\n${data.location}`;
    }

    msg += `\n\n_StillSafe — Daily Safety App_`;
    return msg;
  }

  let msg = `✅ *StillSafe Check-In*\n\n`
          + `*${data.userEmail}* is still safe!\n\n`
          + `🕐 Time: ${time}`;

  if (data.customMessage) {
    msg += `\n\n💬 Message:\n${data.customMessage}`;
  }

  msg += `\n\n_Still Safe. Still Here._`;
  return msg;
}

// ── Send WhatsApp ──────────────────────────
async function sendWhatsApp({ phone, type, data }) {
  try {
    // Clean phone number
    let cleanPhone = phone.replace(/[^\d]/g, '');
    if (!cleanPhone.startsWith('92') &&
        !cleanPhone.startsWith('1')  &&
        cleanPhone.length === 10) {
      cleanPhone = `92${cleanPhone}`;
    }

    const message = buildMessage(type, data);

    await client.messages.create({
      from: FROM_NUMBER,
      to:   `whatsapp:+${cleanPhone}`,
      body: message,
    });

    console.log(`WhatsApp sent to +${cleanPhone}`);
    return { success: true };
  } catch (error) {
    console.error('Twilio error:', error.message);
    return { success: false, error: error.message };
  }
}

// ── Send to Multiple Contacts ──────────────
async function sendWhatsAppToContacts({ contacts, type, data }) {
  const results = [];

  for (const contact of contacts) {
    if (contact.whatsapp) {
      const result = await sendWhatsApp({
        phone: contact.whatsapp,
        type,
        data,
      });
      results.push({ contact: contact.whatsapp, ...result });
    }
  }

  return results;
}

module.exports = { sendWhatsApp, sendWhatsAppToContacts };