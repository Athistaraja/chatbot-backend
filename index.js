const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Manual responses
const predefinedResponses = {
  "hello": "Hi there! How can I assist you?",
  "how are you": "I'm just a bot, but I'm doing great! How about you?",
  "your name": "I'm Lucky yours friendly chatbot!",
  "help": "Sure! How can I assist you today?"
};

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", async (data) => {
    if (!data || !data.message) return;
    console.log("User message:", data.message);

    // Show "bot is typing..." animation
    socket.emit("bot_typing");

    // Get response (Manual or AI)
    const botResponse = await getBotResponse(data.message);

    // Send response
    socket.emit("receive_message", { message: botResponse, sender: "bot" });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Get bot response (Manual first, then AI)
async function getBotResponse(userMessage) {
  const lowerCaseMessage = userMessage.toLowerCase();

  if (predefinedResponses[lowerCaseMessage]) {
    return predefinedResponses[lowerCaseMessage];
  }

  return await getAIResponse(userMessage);
}

// OpenAI API Call
async function getAIResponse(userMessage) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI Response Error:", error);
    return "Sorry, I am having trouble responding right now.";
  }
}

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
