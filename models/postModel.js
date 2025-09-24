const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Cloudinary URL ke liye
  postMedia: { 
    type: String, 
  },
  // Media type (image/video) store karne ke liye
  mediaType: {
    type: String,
    enum: ['image', 'video','audio']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);

