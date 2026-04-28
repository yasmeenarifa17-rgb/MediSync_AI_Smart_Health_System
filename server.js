const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Your Gemini API Key
const GEMINI_API_KEY = "AIzaSyBNeJqMUfw6vAaCx0k9rFBKEw9Thb5jByo";

// 🔥 Smart fallback (acts like mini dataset)
function fallbackResponse(message) {
    message = message.toLowerCase();

    if (message.includes("fever")) {
        return "It sounds like you have a fever 🤒. Please drink plenty of water, take rest, and you may take paracetamol if needed. If it continues for more than 2 days, consult a doctor.";
    }
    if (message.includes("headache")) {
        return "Headaches can happen due to stress or dehydration. Try resting, drinking water, and avoiding screens. If it’s severe, consult a doctor.";
    }
    if (message.includes("cold")) {
        return "For cold, stay warm, drink hot fluids, and try steam inhalation. If symptoms worsen, please see a doctor.";
    }
    if (message.includes("thank")) {
        return "You're always welcome 😊 I'm here to help you stay healthy!";
    }

    return "I'm here for you 😊 Could you explain your problem a little more?";
}

app.get("/", (req, res) => {
    res.send("✅ MediSync AI Backend is Running!");
});

app.post("/chat", async (req, res) => {
    const userMessage = req.body.userMessage;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                                    text: `
You are MediSync AI, a friendly healthcare assistant.

Your behavior:
- Talk like a caring human
- Give practical health advice
- Be simple, clear, and supportive
- Suggest doctor visit if serious
- Never say "I am AI model"
- Be warm and motivating

User message: ${userMessage}
`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log("Gemini response:", JSON.stringify(data, null, 2));

        // ✅ Extract reply safely
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (reply) {
            return res.json({ reply });
        } else {
            console.log("⚠️ Gemini failed → using fallback");
            return res.json({ reply: fallbackResponse(userMessage) });
        }

    } catch (error) {
        console.log("❌ Error → fallback:", error.message);
        return res.json({ reply: fallbackResponse(userMessage) });
    }
});

// 🚀 Start server
app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});