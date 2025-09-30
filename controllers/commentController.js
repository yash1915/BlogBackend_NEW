const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

// Create Comment (Updated for Replies)
exports.createComment = async (req, res) => {
    try {
        const { postId, body, parentCommentId } = req.body;
        const userId = req.user.id;

        if (!postId || !body) {
            return res.status(400).json({ success: false, error: "Post ID and body are required" });
        }

        const comment = new Comment({ 
            post: postId, 
            user: userId, 
            body, 
            parentComment: parentCommentId || null 
        });
        const savedComment = await comment.save();

        if (parentCommentId) {
            // It's a reply, add it to the parent comment's replies array
            await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: savedComment._id } });
        } else {
            // It's a top-level comment, add it to the post's comments array
            await Post.findByIdAndUpdate(postId, { $push: { comments: savedComment._id } });
        }

        const populatedComment = await Comment.findById(savedComment._id).populate("user", "firstName lastName");
        res.status(201).json({ success: true, comment: populatedComment });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Error while creating comment" });
    }
};

// Update Comment
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { body } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to edit this comment" });
        }

        comment.body = body;
        await comment.save();
        res.status(200).json({ success: true, message: "Comment updated successfully", comment });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update comment" });
    }
};

// Delete Comment (Updated)
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const comment = await Comment.findById(id);
        if(!comment) {
            return res.status(404).json({ success: false, error: "Comment not found" });
        }

        const post = await Post.findById(comment.post);

        // Sirf comment ka author ya post ka author hi delete kar sakta hai
        if(comment.user.toString() !== userId && post.author.toString() !== userId) {
            return res.status(403).json({ success: false, error: "Not authorized to delete this comment" });
        }
        
        // Post/Parent Comment se comment id remove karo
        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, { $pull: { replies: id } });
        } else {
            await Post.findByIdAndUpdate(comment.post, { $pull: { comments: id } });
        }
        
        // Saare replies bhi delete karo
        await Comment.deleteMany({ parentComment: id });
        await Comment.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Error while deleting comment" });
    }
};

// Get Comments for a Post
exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId).populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'firstName lastName' // Sirf zaroori details lein
            }
        });

        if (!post) {
            return res.status(404).json({ success: false, error: "Post not found" });
        }

        res.status(200).json({ success: true, comments: post.comments });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Error fetching comments" });
    }
};
