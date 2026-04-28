const messagesArea = document.getElementById("messagesArea");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");

// 🔑 TEMP: Put your Gemini API key here
const CHAT_API_URL = "https://your-backend-url.onrender.com/chat";
const API_KEY = "AIzaSyBNeJqMUfw6vAaCx0k9rFBKEw9Thb5jByo";

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message " + sender;
    msgDiv.innerText = text;
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

async function sendMessage() {
    const userText = input.value.trim();
    if (!userText) return;

    addMessage(userText, "user");
    input.value = "";

    typingIndicator.style.display = "flex";

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are a friendly health assistant. Help the user in simple words.\nUser: ${userText}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await res.json();

        typingIndicator.style.display = "none";

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't understand.";

        addMessage(reply, "bot");

    } catch (error) {
        typingIndicator.style.display = "none";
        addMessage("⚠️ Connection error. Try again.", "bot");
        console.error(error);
    }
}