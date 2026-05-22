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

module.exports = router;
