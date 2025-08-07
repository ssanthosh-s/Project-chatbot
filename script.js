// ===================================
// === RICH UI INITIALIZATION CODE ===
// ===================================

// --- Theme Switcher Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;
    const hljsTheme = document.getElementById('hljs-theme');

    const lightThemeHljs = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
    const darkThemeHljs = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
    
    // Define particle colors for each theme
    const lightThemeParticleColor = "#555555";
    const darkThemeParticleColor = "#00ff00"; // Green color for dark mode

    // Function to set the theme for the page AND the particles
    const setTheme = (theme) => {
        // 1. Set the theme for the page (CSS)
        body.classList.toggle('dark-theme', theme === 'dark');
        hljsTheme.setAttribute('href', theme === 'dark' ? darkThemeHljs : lightThemeHljs);
        localStorage.setItem('theme', theme);

        // 2. --- NEW --- Update the particle animation colors
        const particleContainer = tsParticles.dom()[0]; // Get the active particle container
        if (particleContainer) {
            const newColor = theme === 'dark' ? darkThemeParticleColor : lightThemeParticleColor;
            
            // Set the options for particles and links
            particleContainer.options.particles.color.value = newColor;
            particleContainer.options.particles.links.color.value = newColor;
            
            // Refresh the container to apply the new options
            particleContainer.refresh();
        }
    };

    // Load saved theme from localStorage on page load
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    setTheme(savedTheme);

    // Event listener for the theme switch button
    themeSwitcher.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
    });

    // --- Particle Animation Initialization ---
    // The initial color is set here, but it will be immediately updated by setTheme
    tsParticles.load("particles-container", {
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: true, mode: "push" },
            },
            modes: {
                repulse: { distance: 100, duration: 0.4 },
                push: { particles_nb: 4 },
            },
        },
        particles: {
            color: { value: lightThemeParticleColor }, // Initial color
            links: { color: lightThemeParticleColor, distance: 150, enable: true, opacity: 0.2, width: 1 },
            move: {
                direction: "none",
                enable: true,
                outModes: "out",
                random: false,
                speed: 1,
                straight: false,
            },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.2 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
        },
        detectRetina: true,
    });
});


// ===================================
// === MAIN CHAT APPLICATION CODE ===
// ===================================

import { marked } from 'marked';
import hljs from 'highlight.js';

// --- Configuration for Marked and Highlight.js ---
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
});

// Get references to DOM elements
const userInput = document.getElementById('userinput');
const sendButton = document.querySelector('.sender');
const contentArea = document.querySelector('.content');

// Function to handle sending messages
async function sendMessage() {
  const message = userInput.value.trim();
  if (message !== "") {
    addMessageToChat(message, 'user-message');
    userInput.value = "";
    const typingIndicator = addMessageToChat("...", 'bot-message');

    try {
      const botReply = await getAIResponse(message);
      typingIndicator.innerHTML = marked.parse(botReply);
      addCopyButtons(typingIndicator);
    } catch (error) {
      typingIndicator.textContent = "Sorry, something went wrong. Please try again.";
      console.error("Error fetching AI response:", error);
    }
  }
}

// Function to add a message to the chat area
function addMessageToChat(message, messageType) {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message', messageType);

  if (messageType === 'user-message') {
    messageBox.textContent = message;
  } else {
    messageBox.innerHTML = marked.parse(message);
    addCopyButtons(messageBox);
  }

  contentArea.appendChild(messageBox);
  contentArea.scrollTop = contentArea.scrollHeight;
  return messageBox;
}

// Function to find code blocks and add a "Copy" button
function addCopyButtons(element) {
  const codeBlocks = element.querySelectorAll('pre code');
  codeBlocks.forEach((codeBlock) => {
    const preElement = codeBlock.parentElement;
    if (preElement.querySelector('.copy-btn')) return; // Don't add a button if one already exists
    preElement.style.position = 'relative';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.textContent = 'Copy';
    
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.textContent).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });

    preElement.appendChild(copyButton);
  });
}

// Function to fetch a response from your backend server

async function getAIResponse(userMessage) {
  try {

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Could not fetch from backend:", error);
    throw error;
  }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) { // Added !e.shiftKey to allow new lines with Shift+Enter
    e.preventDefault();
    sendMessage();
  }
});