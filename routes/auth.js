const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");

const { 
    sendOTP, 
    signup, 
    login, 
    forgotPassword, // Added
    resetPassword,  // Added
    deleteAccount   // Added
} = require("../controllers/authController");

const { 
    getMyProfile, 
    updateProfile 
} = require("../controllers/profileController");


// --- AUTH ROUTES ---
router.post("/sendotp", sendOTP);
router.post("/signup", signup);
router.post("/login", login);

// --- PASSWORD RESET ROUTES ---
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// --- PROFILE & ACCOUNT ROUTES (Protected) ---
router.get("/me", auth, getMyProfile);
router.put("/profile", auth, updateProfile);
router.delete("/account", auth, deleteAccount);

module.exports = router;
