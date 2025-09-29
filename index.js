const express = require('express');
const cors = require('cors');
require("dotenv").config();
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');
const { cloudinaryConnect } = require('./config/cloudinary');
const dbConnect = require('./config/database');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: "https://blog-frontend-new-plum.vercel.app", // Aap production me ise apne frontend URL se replace kar sakte hain
    credentials: true,
}));
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(cors());

// Database & Cloudinary Connection
dbConnect();
cloudinaryConnect();

// Routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
app.use("/api/v1", blogRoutes);
app.use("/api/v1/auth", authRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send(`<h1>🚀 Blog API is Running...</h1>`);
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server started at http://localhost:${PORT}`);
});

