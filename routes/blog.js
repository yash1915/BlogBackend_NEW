const express = require("express");
const router = express.Router();

const { 
  createPost, getAllPosts, getPostById, deletePost, updatePost,getPostsByUserId
} = require("../controllers/postController");

const { 
  togglePostLike, toggleCommentLike 
} = require("../controllers/likeController");

const { 
  createComment, getCommentsByPost, deleteComment,updateComment
} = require("../controllers/commentController");

const { auth } = require("../middleware/authMiddleware");

// Yahan multer ki zaroorat nahi hai kyunki hum 'express-fileupload' use kar rahe hain.

// --- POST ROUTES ---
router.post("/posts/create", auth, createPost); // File upload 'express-fileupload' handle karega
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.put("/posts/:id", auth, updatePost);
router.delete("/posts/:id", auth, deletePost);
router.get("/posts/user/:userId", auth, getPostsByUserId);

// --- LIKE ROUTES ---
router.post("/posts/:postId/toggle-like", auth, togglePostLike);
router.post("/comments/:commentId/toggle-like", auth, toggleCommentLike);

// --- COMMENT ROUTES ---
router.post("/comments/create", auth, createComment);
router.get("/posts/:postId/comments", getCommentsByPost);
router.put("/comments/:commentId", auth, updateComment);
router.delete("/comments/:id", auth, deleteComment);

module.exports = router;

