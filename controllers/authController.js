const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/profile");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../Utils/mailSender");
const crypto = require("crypto");

require("dotenv").config();

// SEND OTP
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({ success: false, message: "User is already registered" });
        }
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };
        await OTP.create(otpPayload);
        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SIGNUP (Updated to generate and return a token)
exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, otp } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({ success: false, message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Password and Confirm Password do not match" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (recentOtp.length === 0 || otp !== recentOtp[0].otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileDetails = await Profile.create({ gender: null, dateOfBirth: null, about: null });
        
        let user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // === YEH CODE ADD KIYA GAYA HAI ===
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        user.token = token;
        user.password = undefined;
        // ===================================

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            token, // Token ko response me bhejein
            user
        });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ success: false, message: "User cannot be registered. Please try again." });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({ success: false, message: "User is not registered" });
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
            user.token = token;
            user.password = undefined;
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie("token", token, options).status(200).json({ success: true, token, user, message: "User login successful" });
        } else {
            return res.status(401).json({ success: false, message: "Password is incorrect" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Login failure" });
    }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Your email is not registered." });
        }
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        const resetUrl = `https://blog-frontend-new-plum.vercel.app/reset.html?token=${token}`;
                // EMAIL MESSAGE ME ALERT ADD KIYA GAYA HAI
        const emailBody = `
            <p>Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
            <hr>
        `;

        await mailSender(email, "Password Reset Link", emailBody);

    } catch (error) {
        res.status(500).json({ success: false, message: "Error sending reset password mail." });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match." });
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Token is invalid or has expired." });
        }
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ success: true, message: "Password has been reset successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error resetting password." });
    }
};

// DELETE ACCOUNT
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required." });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password." });
        }
        await Post.deleteMany({ author: userId });
        await Comment.deleteMany({ user: userId });
        await Profile.findByIdAndDelete(user.additionalDetails);
        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: "Account deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error while deleting account." });
    }
};
