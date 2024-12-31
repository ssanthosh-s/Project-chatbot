// Get references to the input field, send button, and content area
const userInput = document.getElementById('userinput');
const sendButton = document.querySelector('.sender');
const contentArea = document.querySelector('.content');

// Function to handle sending messages
async function sendMessage() {
  const message = userInput.value.trim(); // Get the user's input and trim whitespace

  // Ensure the input is not empty
  if (message !== "") {
    // Add the user's message to the chat
    addMessageToChat(message, 'user-message');

    // Clear the input field
    userInput.value = "";

    // Show typing indicator
    const typingIndicator = addMessageToChat("Typing...", 'bot-message');

    try {
      // Fetch the AI response
      const botReply = await getAIResponse(message);

      // Update the typing indicator with the actual response
      typingIndicator.textContent = botReply;
    } catch (error) {
      // Handle errors (e.g., API issues)
      typingIndicator.textContent = "Sorry, something went wrong. Please try again.";
      console.error("Error fetching AI response:", error);
    }
  }
}

// Function to add a message to the chat area
function addMessageToChat(message, messageType) {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message', messageType);
  messageBox.textContent = message;

  // Append the message box to the content area
  contentArea.appendChild(messageBox);

  // Scroll to the latest message
  contentArea.scrollTop = contentArea.scrollHeight;

  return messageBox; // Return the message box for updating if needed
}

// Function to fetch a response from the Gemini AI model
async function getAIResponse(userMessage) {
  const apiKey = "AIzaSyAVRTL5Ln7BdnMyfVNOPdLF_ZvTej8-9Gg"; 

  // Import the Google Generative AI library 
    const { GoogleGenerativeAI } = require('@google/generative-ai');

  // Create an instance of GoogleGenerativeAI
  const googleAI = new GoogleGenerativeAI(apiKey);

  // Define the Gemini model configuration
  const geminiConfig = {
    temperature: 0.7, // Adjust temperature for response creativity
    topP: 1, // Adjust for favoring more probable completions
    maxOutputTokens: 150, // Maximum number of tokens for the response
  };

  // Get the generative model instance
  const model = googleAI.getGenerativeModel({
    model: "gemini-pro", // Specify the Gemini Pro model
    geminiConfig,
  });

  // Send the user message as a prompt to the model
  const result = await model.generateContent(userMessage);

  // Return the generated text response
  return result.response.text().trim();
}

// Event listener for the "Send" button
sendButton.addEventListener('click', sendMessage);

// Allow pressing Enter to send the message
userInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
