const nodemailer = require("nodemailer");


const mailSender = async (email, title, body) => {
  try {
    // Gmail ke liye yeh sabse behtar configuration hai
    let transporter = nodemailer.createTransport({
       host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,// 'host' ki jagah 'service' ka istemal karein
      auth: {
        user: process.env.MAIL_USER, // Aapka poora Gmail address
        pass: process.env.MAIL_PASS, // Aapka 16-digit ka Google App Password
      },
    });

    // Email send karein
    let info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: title,
      html: body,
    });

    console.log("✅ Mail Sent Successfully:", info.response);
    return info;

  } catch (error) {
    console.log("❌ Mail Sending Error:", error.message);
    // YEH SABSE ZAROORI BADLAV HAI: Error ko throw karein
    // Isse aapke controller ko pata chalega ki email fail ho gaya hai
    throw error;
  }
};

module.exports = mailSender;
