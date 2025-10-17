const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with Mongoose
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Import Models (we'll create these)
const User = require("./models/user");
const Message = require("./models/message");

// REST API Routes
app.get("/", (req, res) => {
  res.json({ message: "✅ Chat API is running!" });
});

// Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io Connection Handling
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User joins the chat
  socket.on("join", async ({ username, userId }) => {
    try {
      socket.username = username;
      socket.userId = userId;
      socket.join("general");

      // Update user online status
      await User.findByIdAndUpdate(userId, { online: true });

      // Get recent messages (last 50)
      const messages = await Message.find({ room: "general" })
        .sort({ createdAt: -1 })
        .limit(50);

      // Send previous messages to the user
      socket.emit("previous-messages", messages.reverse());

      // Broadcast that user joined
      io.to("general").emit("user-joined", {
        username,
        message: `${username} joined the chat`,
      });

      // Send updated online users list
      const onlineUsers = await User.find({ online: true }).select(
        "username email _id"
      );
      io.to("general").emit("online-users", onlineUsers);

      console.log(`✅ ${username} joined the chat`);
    } catch (error) {
      console.error("Error in join:", error);
    }
  });

  // Handle new message
  socket.on("send-message", async (data) => {
    try {
      const { userId, username, text } = data;

      // Save message to database
      const message = new Message({
        user: userId,
        username: username,
        text: text,
        room: "general",
      });
      await message.save();

      // Broadcast message to all users in the room
      io.to("general").emit("receive-message", {
        _id: message._id,
        username: username,
        text: text,
        createdAt: message.createdAt,
        userId: userId,
      });

      console.log(`💬 Message from ${username}: ${text}`);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", async () => {
    console.log("❌ User disconnected:", socket.id);

    if (socket.userId) {
      try {
        // Update user online status
        await User.findByIdAndUpdate(socket.userId, { online: false });

        // Send updated online users list
        const onlineUsers = await User.find({ online: true }).select(
          "username email _id"
        );
        io.to("general").emit("online-users", onlineUsers);

        // Broadcast that user left
        if (socket.username) {
          io.to("general").emit("user-left", {
            username: socket.username,
            message: `${socket.username} left the chat`,
          });
        }
      } catch (error) {
        console.error("Error in disconnect:", error);
      }
    }
  });

  // Handle typing indicator (optional feature)
  socket.on("typing", ({ username }) => {
    socket.to("general").emit("user-typing", { username });
  });

  socket.on("stop-typing", ({ username }) => {
    socket.to("general").emit("user-stop-typing", { username });
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});


// Chat page mein:
// socket.connect();           // Connect karo
// socket.emit('send-message', data);  // Message bhejo
// socket.on('receive-message', callback); // Message suno