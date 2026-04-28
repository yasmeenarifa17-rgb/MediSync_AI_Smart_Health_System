// Backend API URL (for local testing first; later change to deployed URL)
const CHAT_API_URL = "http://localhost:3000/chat";

// DOM Elements
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// Firebase references (from window, set in chat.html)
const auth = window.firebaseAuth;
const db = window.firebaseDb;

// Get logged-in user info from localStorage (set during login/signup)
const currentUid = localStorage.getItem('medisync_uid');
const currentUsername = localStorage.getItem('medisync_username') || 'You';

// If no user found, redirect to login
if (!currentUid) {
    alert('Please log in first.');
    window.location.href = 'index.html';
}

// Remove welcome message on first interaction
let isFirstMessage = true;

/**
 * Add a message to the chat UI only
 * @param {string} sender - 'user' or 'ai'
 * @param {string} text - The message text
 */
function addMessageToUI(sender, text) {
    // Remove welcome message if it's the first real message
    if (isFirstMessage) {
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        isFirstMessage = false;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const senderLabel = document.createElement('div');
    senderLabel.className = 'sender';
    senderLabel.textContent = sender === 'user' ? currentUsername : 'AI Assistant';
    messageDiv.appendChild(senderLabel);

    const textNode = document.createTextNode(text);
    messageDiv.appendChild(textNode);

    messagesArea.insertBefore(messageDiv, typingIndicator);
    scrollToLatest();
}

/**
 * Scroll messages area to the bottom
 */
function scrollToLatest() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

/**
 * Show typing indicator
 */
function showTyping() {
    typingIndicator.classList.add('show');
    scrollToLatest();
}

/**
 * Hide typing indicator
 */
function hideTyping() {
    typingIndicator.classList.remove('show');
}

/**
 * Save a message to Firebase Realtime Database
 * @param {string} sender - 'user' or 'ai'
 * @param {string} text
 */
function saveMessageToDb(sender, text) {
    const ref = db.ref('chatHistory/' + currentUid).push();
    ref.set({
        sender: sender,
        text: text,
        timestamp: Date.now()
    });
}

/**
 * Load existing chat history from Firebase
 */
function loadChatHistory() {
    const ref = db.ref('chatHistory/' + currentUid).orderByChild('timestamp');

    ref.on('value', (snapshot) => {
        const data = snapshot.val();

        // Clear current UI messages
        messagesArea.innerHTML = '';

        // If no messages, show welcome message again
        if (!data) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
                <h2>Welcome! 👋</h2>
                <p>I'm your AI Health Assistant. Ask me anything about health, fitness, nutrition, or wellness!</p>
            `;
            messagesArea.appendChild(welcomeDiv);
            isFirstMessage = true;
            return;
        }

        // Render each message in order
        const messages = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        messages.forEach(msg => {
            addMessageToUI(msg.sender, msg.text);
        });

        isFirstMessage = false;
    });
}

/**
 * Handle AI response: call backend, show, save
 * @param {string} userMessage
 */
async function handleAIResponse(userMessage) {
    showTyping();

    try {
        const res = await fetch(CHAT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userMessage,
                uid: currentUid || null
            })
        });

        const data = await res.json();
        const response = data.reply || "Sorry, I could not generate a response right now.";

        hideTyping();

        addMessageToUI('ai', response);
        saveMessageToDb('ai', response);
    } catch (err) {
        console.error(err);
        hideTyping();
        const fallback = "Sorry, something went wrong connecting to the health assistant. Please try again.";
        addMessageToUI('ai', fallback);
        saveMessageToDb('ai', fallback);
    }
}
/**
 * Send a message (user)
 */
function sendMessage() {
    const message = messageInput.value.trim();

    if (message) {
        // Add user message to UI
        addMessageToUI('user', message);

        // Save user message to DB
        saveMessageToDb('user', message);

        // Clear input
        messageInput.value = '';

        // Handle AI response via backend
        handleAIResponse(message);
    }
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Focus input on load
messageInput.focus();

// Load history when page opens
loadChatHistory();