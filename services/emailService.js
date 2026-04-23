const sgMail = require('@sendgrid/mail');

const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME  = 'StillSafe';

// ── Get SendGrid Instance Safely ───────────
function getSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey || !apiKey.startsWith("SG.")) {
    console.error("❌ Invalid or missing SendGrid API Key");
    return null;
  }

  sgMail.setApiKey(apiKey);
  return sgMail;
}

// ── Email Template ─────────────────────────
function buildTemplate(type, data) {
  const isSOS = type === 'sos';

  const headerColor = isSOS ? '#E63946' : '#0B7A75';
  const headerText  = isSOS
    ? '🚨 EMERGENCY SOS ALERT'
    : '✅ StillSafe Check-In';

  const bodyContent = isSOS
    ? `
      <p style="font-size:18px;font-weight:bold;color:#E63946;">
        ⚠️ EMERGENCY — Immediate Action Required!
      </p>
      <p><strong>${data.userEmail}</strong> has triggered an SOS alert.</p>
      <p>🕐 Time: <strong>${data.timestamp}</strong></p>
      ${data.location
        ? `<p>📍 Location:
           <a href="${data.location}" style="color:#0B7A75;">
             View on Google Maps
           </a></p>`
        : ''}
      <p style="color:red;font-weight:bold;">
        Please contact them IMMEDIATELY!
      </p>
    `
    : `
      <p><strong>${data.userEmail}</strong> is safe and checked in.</p>
      <p>🕐 Time: <strong>${data.timestamp}</strong></p>
      ${data.customMessage
        ? `<div style="background:#E6FAF9;border-left:4px solid #0B7A75;
             padding:12px;border-radius:6px;margin:16px 0;">
             <p style="margin:0;">${data.customMessage}</p>
           </div>`
        : ''}
      <p style="color:#666;">
        No action required — automated check-in.
      </p>
    `;

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; background:#f4f4f4;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;">
        
        <div style="background:${headerColor};padding:20px;text-align:center;color:white;">
          <h2>${headerText}</h2>
          <p>StillSafe System</p>
        </div>

        <div style="padding:20px;">
          ${bodyContent}
        </div>

        <div style="text-align:center;padding:15px;color:#888;font-size:12px;">
          StillSafe — Still Safe. Still Here.
        </div>

      </div>
    </body>
    </html>
  `;
}

// ── Send Email ─────────────────────────────
async function sendEmail({ toEmail, toName, subject, type, data }) {
  try {
    const mailer = getSendGrid();

    if (!mailer) {
      return { success: false, error: "SendGrid not configured" };
    }

    if (!FROM_EMAIL) {
      console.error("❌ FROM_EMAIL missing in environment");
      return { success: false, error: "Sender email not configured" };
    }

    await mailer.send({
      to:   { email: toEmail, name: toName },
      from: { email: FROM_EMAIL, name: FROM_NAME },

      // ✅ FIX: Reply-To added
      replyTo: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },

      subject,
      html: buildTemplate(type, data),
    });

    console.log(`✅ Email sent to ${toEmail}`);
    return { success: true };

  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error);
    return {
      success: false,
      error: error.response?.body?.errors?.[0]?.message || error.message
    };
  }
}

// ── Send to Multiple Contacts ──────────────
async function sendEmailToContacts({ contacts, subject, type, data }) {
  const results = [];

  for (const contact of contacts) {
    if (!contact.email) {
      results.push({
        contact: contact.name || 'unknown',
        success: false,
        error: 'Missing email'
      });
      continue;
    }

    const result = await sendEmail({
      toEmail: contact.email,
      toName:  contact.name || 'User',
      subject,
      type,
      data,
    });

    results.push({ contact: contact.email, ...result });
  }

  return results;
}

module.exports = { sendEmail, sendEmailToContacts };