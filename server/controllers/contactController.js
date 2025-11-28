const { sendContactNotification } = require('../services/emailService');

/**
 * Send contact form
 * POST /api/contact
 */
const sendContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Send notification email
    const result = await sendContactNotification({ name, email, message });

    if (result.success) {
      res.json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon!'
      });
    } else {
      // Log error but return success to user (don't expose email errors)
      console.error('Contact email error:', result.error);
      res.json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon!'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendContactForm
};
