// Import necessary modules
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO with optimized settings
const io = new Server(server, {
  path: "/socket.io/",
  cors: {
    origin: "https://athistaraja-chatbot.netlify.app", // Your frontend URL
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // Force WebSocket for faster communication
  pingInterval: 25000,      // Keep connection alive
  pingTimeout: 60000,
});

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Manual bot responses
const manualResponses = {
  hello: "Hello! How can I assist you today?",
  help: "I’m here to help! You can ask me anything.",
  bye: "Goodbye! Have a great day!",
  default: "I'm not sure how to respond to that. Try saying 'hello' or 'help'!",
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    const userMessage = data.message?.toLowerCase().trim();
    console.log(`User: ${userMessage}`);

    // Emit bot typing indicator (debounced)
    socket.emit("bot_typing");

    // Simulate bot response delay (reduce if needed)
    setTimeout(() => {
      const botResponse = manualResponses[userMessage] || manualResponses.default;
      
      // Send the bot's response
      socket.emit("receive_message", { message: botResponse, sender: "bot" });
    }, 500); // Reduced delay for faster response
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Simple test route
app.get("/", (req, res) => {
  res.send("Chatbot backend is live!");
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

