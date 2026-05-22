require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const socketHandler = require("./socket");

// Retrieve port from env or default to 5000
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log("Please check your MONGO_URI in back/.env or make sure local MongoDB is running.");
  });

const app = express();

// Middleware
app.use(cors({
  origin: "*", // Adjust in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/messages", require("./routes/messages"));

// Basic check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "LocalGram backend is running" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Sockets
socketHandler(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready on ws://localhost:${PORT}`);
});
