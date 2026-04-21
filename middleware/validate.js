// ── Validate Check-In Request ──────────────
function validateCheckIn(req, res, next) {
  const { userEmail, contacts } = req.body;

  if (!userEmail) {
    return res.status(400).json({
      success: false,
      message: 'userEmail is required',
    });
  }

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'contacts array is required',
    });
  }

  for (const contact of contacts) {
    if (!contact.email || !contact.name) {
      return res.status(400).json({
        success: false,
        message: 'Each contact must have name and email',
      });
    }
  }

  next();
}

// ── Validate SOS Request ───────────────────
function validateSOS(req, res, next) {
  const { userEmail, contacts } = req.body;

  if (!userEmail || !contacts || contacts.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'userEmail and contacts are required',
    });
  }

  next();
}

module.exports = { validateCheckIn, validateSOS };