const User = require("../models/User");

// Get current user's profile
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};
// Update profile
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


