const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  path: "/socket.io/",
  cors: {
    origin: "https://athistaraja-chatbot.netlify.app/", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Manual responses
const manualResponses = {
  hello: "Hello! How can I assist you today?",
  help: "I’m here to help! You can ask me anything.",
  bye: "Goodbye! Have a great day!",
  default: "I'm not sure how to respond to that. Try saying 'hello' or 'help'!",
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    const userMessage = data.message.toLowerCase();
    console.log(`User: ${userMessage}`);

    // Simulate bot typing
    io.emit("bot_typing");

    setTimeout(() => {
      const botResponse = manualResponses[userMessage] || manualResponses.default;

      io.emit("receive_message", { message: botResponse, sender: "bot" });
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Simple test route
app.get("/", (req, res) => {
  res.send("Chatbot backend is live!");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
