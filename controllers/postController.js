const Post = require("../models/postModel");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const Comment = require("../models/commentModel");

// Helper function to upload file to Cloudinary
async function uploadFileToCloudinary(file, folder) {
    const options = { folder, resource_type: "auto" };
    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

// CREATE POST (Updated to handle FormData correctly)
exports.createPost = async (req, res) => {
    try {
        // Yahan par badlaav kiya gaya hai
        const title = req.body?.title;//?->Optional Chaining
        const body = req.body?.body;//?->Yeh code crash hone se bachata hai: agar req.body maujood hai to usse title nikalo, Agar nahi (woh undefined hai): To aage mat badho, bas undefined return kar do aur code ko crash hone se bacha lo.
        
        const authorId = req.user.id;
        const mediaFile = req.files ? req.files.postMedia : null;

        if (!title || !body) {
            return res.status(400).json({ success: false, error: "Title and body are required" });
        }
        
        let mediaUrl = "";
        let mediaType = null;

        if (mediaFile) {
            const cloudinaryResponse = await uploadFileToCloudinary(mediaFile, "BlogAppMedia");
            mediaUrl = cloudinaryResponse.secure_url;
            mediaType = cloudinaryResponse.resource_type === 'video' ? 'video' : 'image';
        }

        const post = new Post({ title, body, author: authorId, postMedia: mediaUrl, mediaType });
        const savedPost = await post.save();

        await User.findByIdAndUpdate(authorId, { $push: { posts: savedPost._id } });

        const populatedPost = await Post.findById(savedPost._id).populate("author", "firstName lastName");

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: populatedPost,
        });
    } catch (err) {
        console.error("Create Post Error:", err);
        return res.status(500).json({ success: false, error: "Error while creating post" });
    }
};

// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 })
      .exec();
    return res.status(200).json({ success: true, posts });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Error while fetching posts" });
  }
};

// GET POST BY ID (Updated to populate nested comments and likes)
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id)
            .populate("author", "firstName lastName")
            .populate("likes", "firstName lastName") 
            .populate({
                path: 'comments',
                populate: [
                    { path: 'user', select: 'firstName lastName' },
                    { path: 'likes', select: 'firstName lastName' },
                    { 
                        path: 'replies',
                        populate: [
                            { path: 'user', select: 'firstName lastName' },
                            { path: 'likes', select: 'firstName lastName' }
                        ]
                    }
                ]
            })
            .exec();
        
        if (!post) {
            return res.status(404).json({ success: false, error: "Post not found" });
        }
        
        return res.status(200).json({ success: true, post });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Error while fetching the post" });
    }
};

// UPDATE POST (Yeh function missing tha)
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body } = req.body;
        const userId = req.user.id;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, error: "Post not found" });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ success: false, error: "You are not authorized to update this post" });
        }

        post.title = title || post.title;
        post.body = body || post.body;
        
        const updatedPost = await post.save();
        
        return res.status(200).json({ success: true, message: "Post updated successfully", post: updatedPost });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Error while updating post" });
    }
};

// DELETE POST
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, error: "Post not found" });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ success: false, error: "You are not authorized to delete this post" });
        }

        if (post.postMedia) {
            const publicIdWithFolder = post.postMedia.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicIdWithFolder, { resource_type: post.mediaType });
        }
        
        await Comment.deleteMany({ post: id });
        await Post.findByIdAndDelete(id);
        await User.findByIdAndUpdate(userId, { $pull: { posts: id } });
        
        return res.status(200).json({ success: true, message: "Post and associated comments deleted successfully" });
    } catch (err) {
        console.error("Error deleting post:", err);
        return res.status(500).json({ success: false, error: "Error while deleting post" });
    }
};


//  FUNCTION user ke profile pe posts dikhane ke liye
exports.getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author: userId })
            .populate("author", "firstName lastName")
            .sort({ createdAt: -1 });
        
        return res.status(200).json({ success: true, posts });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Failed to fetch user posts" });
    }
};