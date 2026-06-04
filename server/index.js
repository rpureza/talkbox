const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const db = require("./db");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const messageRoutes = require("./routes/messages");
const subscriptionRoutes = require("./routes/subscriptions");
const billingRoutes = require("./routes/billing");

app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/messages", messageRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/billing", billingRoutes);cls

app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/messages", messageRoutes);

// SOCKET.IO
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins
  socket.on("user_join", (userData) => {
    onlineUsers[socket.id] = userData;
    db.query("UPDATE users SET is_online = TRUE WHERE id = ?", [userData.id]);
    io.emit("online_users", Object.values(onlineUsers));
    console.log(`${userData.username} joined`);
  });

  // Join room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Leave room
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  // Room message
  socket.on("room_message", (data) => {
    db.query(
      "INSERT INTO messages (user_id, room_id, content) VALUES (?, ?, ?)",
      [data.userId, data.roomId, data.content]
    );
    io.to(data.roomId).emit("room_message", data);
  });

  // Private message
  socket.on("private_message", (data) => {
    db.query(
      "INSERT INTO messages (user_id, receiver_id, content) VALUES (?, ?, ?)",
      [data.senderId, data.receiverId, data.content]
    );
    // Send to receiver
    Object.keys(onlineUsers).forEach((socketId) => {
      if (onlineUsers[socketId].id === data.receiverId) {
        io.to(socketId).emit("private_message", data);
      }
    });
    // Send back to sender
    socket.emit("private_message", data);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit("typing", data);
    } else {
      Object.keys(onlineUsers).forEach((socketId) => {
        if (onlineUsers[socketId].id === data.receiverId) {
          io.to(socketId).emit("typing", data);
        }
      });
    }
  });

  // Stop typing
  socket.on("stop_typing", (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit("stop_typing", data);
    } else {
      Object.keys(onlineUsers).forEach((socketId) => {
        if (onlineUsers[socketId].id === data.receiverId) {
          io.to(socketId).emit("stop_typing", data);
        }
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = onlineUsers[socket.id];
    if (user) {
      db.query("UPDATE users SET is_online = FALSE WHERE id = ?", [user.id]);
      delete onlineUsers[socket.id];
      io.emit("online_users", Object.values(onlineUsers));
      console.log(`${user.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`🚀 TalkBox server running on http://localhost:${PORT}`);
});