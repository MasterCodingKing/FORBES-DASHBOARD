const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  auth: mailConfig.auth
});

/**
 * Send email
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: mailConfig.from,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send contact form notification
 */
const sendContactNotification = async ({ name, email, message }) => {
  const subject = `New Contact Form Submission from ${name}`;
  const text = `
Name: ${name}
Email: ${email}
Message: ${message}
  `;
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  return sendEmail({
    to: mailConfig.from,
    subject,
    text,
    html
  });
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async ({ to, firstName, username }) => {
  const subject = 'Welcome to Dashboard';
  const text = `
Hello ${firstName},

Welcome to Dashboard! Your account has been created successfully.

Username: ${username}

You can now login to access the dashboard.

Best regards,
Dashboard Team
  `;
  const html = `
    <h2>Welcome to Dashboard!</h2>
    <p>Hello ${firstName},</p>
    <p>Welcome to Dashboard! Your account has been created successfully.</p>
    <p><strong>Username:</strong> ${username}</p>
    <p>You can now login to access the dashboard.</p>
    <br>
    <p>Best regards,<br>Dashboard Team</p>
  `;

  return sendEmail({ to, subject, text, html });
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendContactNotification,
  sendWelcomeEmail,
  verifyEmailConfig
};
