const router = require("express").Router();
const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

// Get all unique chat conversations for a specific user
router.get("/rooms/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all messages where this user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ time: -1 });

    const roomsMap = new Map();
    for (const msg of messages) {
      if (!roomsMap.has(msg.roomId)) {
        roomsMap.set(msg.roomId, msg);
      }
    }

    const activeChats = [];
    for (const [roomId, lastMsg] of roomsMap.entries()) {
      const otherUserId = lastMsg.senderId === userId ? lastMsg.receiverId : lastMsg.senderId;

      let otherUser = null;
      if (mongoose.Types.ObjectId.isValid(otherUserId)) {
        const userObj = await User.findById(otherUserId).select("name email");
        if (userObj) {
          otherUser = { _id: userObj._id, name: userObj.name, email: userObj.email };
        }
      }

      if (!otherUser) {
        otherUser = { _id: otherUserId, name: otherUserId, email: "" };
      }

      activeChats.push({
        roomId,
        lastMessage: lastMsg.message,
        time: lastMsg.time,
        otherUser
      });
    }

    // Sort by most recent message
    activeChats.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(activeChats);
  } catch (err) {
    console.error("Get rooms error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch chat rooms" });
  }
});

// Get messages for a specific room ID
router.get("/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ time: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch messages" });
  }
});

module.exports = router;
