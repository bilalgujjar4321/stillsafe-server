const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Twilio credentials (abhi blank rahne do)
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

// Test route
app.get("/", (req, res) => {
  res.send("StillSafe server running ✅");
});

// WhatsApp API
app.post("/send-whatsapp", async (req, res) => {
  const { phone, message } = req.body;

  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+${phone}`,
      body: message,
    });

    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false });
  }
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});