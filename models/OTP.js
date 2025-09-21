const mongoose = require("mongoose");
const mailSender = require("../Utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 5 * 60 },
});

// Function to send verification email
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email from BlogApp",
            `<h1>Please confirm your OTP</h1> <p>Here is your OTP code: ${otp}</p>`
        );
        console.log("Email sent successfully: ", mailResponse);
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);
