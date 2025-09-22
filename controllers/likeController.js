const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

// Like/Unlike a POST
exports.togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Sahi tareeka: Check karein ki user ne pehle se like kiya hai ya nahin
    const isLiked = post.likes.some(likeId => likeId.equals(userId));

    if (isLiked) {
      // Agar pehle se liked hai, to unlike karein
      post.likes.pull(userId);
    } else {
      // Agar liked nahin hai, to like karein
      post.likes.push(userId);
    }

    await post.save();
    // `.populate()` ko yahan use karein taaki response mein updated names aayein
    const populatedPost = await Post.findById(postId).populate("likes", "firstName lastName");

    return res.status(200).json({
      success: true,
      message: isLiked ? "Post unliked" : "Post liked",
      post: populatedPost
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Error while toggling like on post" });
  }
};

// Like/Unlike a COMMENT
exports.toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if(!comment) {
            return res.status(404).json({ success: false, error: "Comment not found" });
        }

        // Sahi tareeka: Check karein ki user ne pehle se like kiya hai ya nahin
        const isLiked = comment.likes.some(likeId => likeId.equals(userId));

        if (isLiked) {
            // Agar pehle se liked hai, to unlike karein
            comment.likes.pull(userId);
        } else {
            // Agar liked nahin hai, to like karein
            comment.likes.push(userId);
        }
        
        await comment.save();
        const populatedComment = await Comment.findById(commentId).populate("likes", "firstName lastName");


        return res.status(200).json({
            success: true,
            message: isLiked ? "Comment unliked" : "Comment liked",
            comment: populatedComment
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Error while toggling like on comment" });
    }
};
