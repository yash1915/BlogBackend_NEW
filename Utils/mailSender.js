const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    // Transporter create karein (Brevo ke liye sahi settings ke saath)
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false, 
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Email send karein
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
    throw error;
  }
};

module.exports = mailSender;
