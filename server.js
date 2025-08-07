// Import necessary packages
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000; // You can use any port

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());
// Enable Express to parse JSON request bodies
app.use(express.json());

// --- Google AI Setup ---
// Get the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set in the .env file.");
  process.exit(1);
}

// Create an instance of the Google Generative AI client
const googleAI = new GoogleGenerativeAI(apiKey);
// NEW
const model = googleAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// --- API Route ---
// Define a POST route to handle chat requests
app.post('/api/chat', async (req, res) => {
  try {
    // Get the user's message from the request body
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // --- NEW, MORE SUBTLE PROMPT ---
    const currentDate = new Date().toDateString();

    // This format gives the AI background knowledge without forcing it to repeat the date.
    const fullPrompt = `(System knowledge: Today is ${currentDate})\n\nUser: ${message}\nAssistant:`;
    // --- END OF NEW PROMPT ---

    // Define generation configuration
    const geminiConfig = {
      temperature: 0.7,
      maxOutputTokens: 150,
    };

    // Generate content using the AI model
    const result = await model.generateContent(fullPrompt, geminiConfig);
    const botReply = await result.response.text();

    // Send the AI's reply back to the frontend
    res.json({ reply: botReply.trim() });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});


// --- Start Server ---
// Start listening for requests on the specified port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


