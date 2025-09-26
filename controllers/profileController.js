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


