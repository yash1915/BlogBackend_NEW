const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: { type: String },
    dateOfBirth: { type: String },
    about: { type: String, trim: true },
});
/ Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { about } = req.body;
        const userId = req.user.id;

        // Seedhe User model ko update karein
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { about },
            { new: true } // Taaki updated user return ho
        ).select("-password");

        res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully", 
            user: updatedUser 
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

module.exports = mongoose.model("Profile", profileSchema);
