const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    // This is the recommended transporter configuration for Gmail
    let transporter = nodemailer.createTransport({
      service: 'gmail', // Use the 'gmail' service for simplicity and reliability
      auth: {
        user: process.env.MAIL_USER, // Your full Gmail address (e.g., example@gmail.com)
        pass: process.env.MAIL_PASS, // Your 16-digit Google App Password
      },
    });

    // Send the email
    let info = await transporter.sendMail({
      from: `"Blog Application" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("✅ Mail Sent Successfully:", info.response);
    return info;

  } catch (error) {
    console.log("❌ Mail Sending Error:", error.message);
    // This is crucial: it ensures that if the email fails, a proper error is sent back
    throw error;
  }
};

module.exports = mailSender;
