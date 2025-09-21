const User = require("../models/User");
const Profile = require("../models/profile");

// Get current user's profile
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate("additionalDetails").select("-password");
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
        const { gender, dateOfBirth, about } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const profileId = user.additionalDetails;

        await Profile.findByIdAndUpdate(profileId, { gender, dateOfBirth, about }, { new: true });
        
        const updatedUser = await User.findById(userId).populate("additionalDetails").select("-password");

        res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};
