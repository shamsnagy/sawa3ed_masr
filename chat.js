// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ API Key
if (!process.env.API_KEY) {
  console.error("❌ مفيش API_KEY في .env");
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "AIzaSyBWvaTqzzA73blKI5oU-CA-i6DLorbZCt8");

// 📌 Endpoint بالـ streaming
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const stream = await model.generateContentStream(message);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullResponse = "";

    for await (const chunk of stream.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(JSON.stringify({ partial: chunkText }) + "\n");
    }

    res.end(JSON.stringify({ reply: fullResponse }));
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Something went wrong with AI service" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
