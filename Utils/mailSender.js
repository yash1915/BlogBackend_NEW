const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    // Transporter create karein (naya, behtar version)
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587, // Standard secure SMTP port
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Yeh line connection problems ko theek karne me madad karti hai
      tls: {
          ciphers:'SSLv3'
      }
    });

    // Email send karein
    let info = await transporter.sendMail({
      from: `"Blog Application" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("✅ Mail Sent:", info.response);
    return info;

  } catch (error) {
    console.log("❌ Mail Error:", error.message);
    // Error aane par bhi, aage badhein taaki server crash na ho
    return error;
  }
};

module.exports = mailSender;
