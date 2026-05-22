const router = require("express").Router();
const Post = require("../models/Post");

// Create a new post
router.post("/", async (req, res) => {
  try {
    const { name, content, city, area, pincode, userId } = req.body;
    if (!name || !content || !city || !area || !pincode) {
      return res.status(400).json({ error: "Missing required post fields" });
    }
    const post = await Post.create({
      name,
      content,
      city,
      area,
      pincode,
      userId: userId || null
    });
    res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: err.message || "Failed to create post" });
  }
});

// Get posts by pincode
router.get("/:pincode", async (req, res) => {
  try {
    const posts = await Post.find({ pincode: req.params.pincode }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch posts" });
  }
});

// Update a post
router.put("/:id", async (req, res) => {
  try {
    const { content, userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.userId && post.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized: You do not own this post" });
    }
    post.content = content || post.content;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ error: err.message || "Failed to update post" });
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.query.userId;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.userId && post.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized: You do not own this post" });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: err.message || "Failed to delete post" });
  }
});

module.exports = router;
