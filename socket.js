const Message = require("./models/Message");

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins a room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // User sends a message
    socket.on("sendMessage", async (data) => {
      try {
        console.log("Message received:", data);
        
        // Save to Database
        const savedMessage = await Message.create({
          roomId: data.roomId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          time: data.time || new Date()
        });

        // Broadcast to all clients in the room (including sender)
        io.to(data.roomId).emit("receiveMessage", savedMessage);
      } catch (err) {
        console.error("Error handling sendMessage:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
