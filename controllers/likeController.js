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

    const alreadyLikedIndex = post.likes.indexOf(userId);

    if (alreadyLikedIndex > -1) {
      // Unlike
      post.likes.splice(alreadyLikedIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    const populatedPost = await Post.findById(postId).populate("likes", "firstName lastName");

    return res.status(200).json({
      success: true,
      message: alreadyLikedIndex > -1 ? "Post unliked" : "Post liked",
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

        const alreadyLikedIndex = comment.likes.indexOf(userId);

        if (alreadyLikedIndex > -1) {
            // Unlike
            comment.likes.splice(alreadyLikedIndex, 1);
        } else {
            // Like
            comment.likes.push(userId);
        }
        
        await comment.save();

        return res.status(200).json({
            success: true,
            message: alreadyLikedIndex > -1 ? "Comment unliked" : "Comment liked",
            comment
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Error while toggling like on comment" });
    }
};
