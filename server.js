// Import necessary packages
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Ensure path is imported

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- THIS IS THE CRUCIAL PART FOR SERVING THE FRONTEND ---
// It tells Express where to find your index.html, style.css, and bundle.js
app.use(express.static(path.join(__dirname)));
// --- END OF CRUCIAL PART ---


// --- Google AI Setup ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set in the environment variables.");
  process.exit(1);
}
const googleAI = new GoogleGenerativeAI(apiKey);
const model = googleAI.getGenerativeModel({ model: "gemini-1.5-pro" });


// --- API Route ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentDate = new Date().toDateString();
    const fullPrompt = `(System knowledge: Today is ${currentDate})\n\nUser: ${message}\nAssistant:`;

    const geminiConfig = {
      temperature: 0.7,
      maxOutputTokens: 150,
    };

    const result = await model.generateContent(fullPrompt, geminiConfig);
    const botReply = await result.response.text();
    res.json({ reply: botReply.trim() });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});