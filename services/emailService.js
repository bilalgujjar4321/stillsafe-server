const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME  = 'StillSafe';

// ── Email Template ─────────────────────────
function buildTemplate(type, data) {
  const issos = type === 'sos';

  const headerColor = issos ? '#E63946' : '#0B7A75';
  const headerText  = issos
    ? '🚨 EMERGENCY SOS ALERT'
    : '✅ StillSafe Check-In';

  const bodyContent = issos
    ? `
      <p style="font-size:18px;font-weight:bold;color:#E63946;">
        ⚠️ EMERGENCY — Immediate Action Required!
      </p>
      <p><strong>${data.userEmail}</strong> has triggered an SOS alert
         and may need help.</p>
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
      <p><strong>${data.userEmail}</strong> is still safe
         and checking in.</p>
      <p>🕐 Time: <strong>${data.timestamp}</strong></p>
      ${data.customMessage
        ? `<div style="background:#E6FAF9;border-left:4px solid #0B7A75;
             padding:12px;border-radius:6px;margin:16px 0;">
             <p style="margin:0;">${data.customMessage}</p>
           </div>`
        : ''}
      <p style="color:#666;">
        No action required — this is an automated safety check-in.
      </p>
    `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f4f4f4;
          margin: 0; padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background: ${headerColor};
          padding: 28px;
          text-align: center;
        }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p  { color: rgba(255,255,255,0.85); margin: 6px 0 0; }
        .body      { padding: 28px; }
        .footer    {
          text-align: center;
          padding: 18px;
          color: #888;
          font-size: 12px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${headerText}</h1>
          <p>StillSafe — Daily Safety Check & Emergency Alert</p>
        </div>
        <div class="body">${bodyContent}</div>
        <div class="footer">
          <p>StillSafe — Still Safe. Still Here.</p>
          <p>You received this because you are an emergency contact.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Send Email ─────────────────────────────
async function sendEmail({ toEmail, toName, subject, type, data }) {
  try {
    await sgMail.send({
      to:   { email: toEmail, name: toName },
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      html: buildTemplate(type, data),
    });
    console.log(`Email sent to ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error);
    return { success: false, error: error.message };
  }
}

// ── Send to Multiple Contacts ──────────────
async function sendEmailToContacts({ contacts, subject, type, data }) {
  const results = [];

  for (const contact of contacts) {
    const result = await sendEmail({
      toEmail: contact.email,
      toName:  contact.name,
      subject,
      type,
      data,
    });
    results.push({ contact: contact.email, ...result });
  }

  return results;
}

module.exports = { sendEmail, sendEmailToContacts };