// backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    additionalDetails: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Profile" },
    image: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }, 
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
