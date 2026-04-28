document.addEventListener("DOMContentLoaded", function () {

    const inputBox = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const messagesArea = document.getElementById("messagesArea");
    const typingIndicator = document.getElementById("typingIndicator");

    // ======================
    // 💬 BOT LOGIC (NO API)
    // ======================
    function getBotReply(message) {
        message = message.toLowerCase();

        // Greetings
        if (message.includes("hello") || message.includes("hi")) {
            return "Hello 👋 I am MediSync AI. How can I help you today?";
        }

        // Fever
        if (message.includes("fever")) {
            return "🤒 Fever detected. Drink plenty of water, take rest, and you may use paracetamol if needed. If it continues more than 2 days, consult a doctor.";
        }

        // Headache
        if (message.includes("headache")) {
            return "🧠 Headache may be due to stress or dehydration. Drink water, rest, and avoid screen time.";
        }

        // Cold
        if (message.includes("cold")) {
            return "🤧 For cold, drink warm fluids, use steam inhalation, and rest well.";
        }

        // Stomach pain / spam
        if (message.includes("pain") || message.includes("spam")) {
            return "⚠️ Please describe your symptoms clearly so I can help you better.";
        }

        // Default
        return "I'm your AI Health Assistant 🩺 Please tell me your symptoms or health question.";
    }

    // ======================
    // 💬 ADD MESSAGE TO UI
    // ======================
    function addMessage(text, sender) {
        const msg = document.createElement("div");
        msg.classList.add("message", sender);
        msg.innerText = text;
        messagesArea.appendChild(msg);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // ======================
    // ⏳ SHOW TYPING
    // ======================
    function showTyping() {
        typingIndicator.style.display = "flex";
    }

    function hideTyping() {
        typingIndicator.style.display = "none";
    }

    // ======================
    // 🚀 SEND MESSAGE
    // ======================
    function sendMessage() {
        const message = inputBox.value.trim();
        if (!message) return;

        // user message
        addMessage(message, "user");
        inputBox.value = "";

        // typing effect
        showTyping();

        setTimeout(() => {
            hideTyping();

            const reply = getBotReply(message);
            addMessage(reply, "bot");

        }, 800); // fake AI delay
    }

    // ======================
    // EVENTS
    // ======================
    sendButton.addEventListener("click", sendMessage);

    inputBox.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

});
