// Health Q&A - Improved Dynamic Version

const questionPool = [
    {
        question: "Do you experience frequent headaches?",
        tag: "headache",
        answers: ["Yes", "No", "Sometimes"]
    },
    {
        question: "Do you feel tired even after rest?",
        tag: "fatigue",
        answers: ["Yes", "No", "Occasionally"]
    },
    {
        question: "Do you have trouble sleeping at night?",
        tag: "sleep",
        answers: ["Yes", "No", "Sometimes"]
    },
    {
        question: "Do you feel dizziness or weakness often?",
        tag: "dizziness",
        answers: ["Yes", "No", "Rarely"]
    },
    {
        question: "Do you experience stomach discomfort or acidity?",
        tag: "digestion",
        answers: ["Yes", "No", "Sometimes"]
    },
    {
        question: "Do you stay hydrated (drink enough water daily)?",
        tag: "hydration",
        answers: ["Yes", "No", "Not sure"]
    }
];

// Strong medical-style insights (safe general guidance)
const insights = {
    headache: "Frequent headaches may be linked to stress, dehydration, or screen fatigue. Maintain hydration and rest.",
    fatigue: "Fatigue can indicate low sleep quality, iron deficiency, or stress. Improve sleep routine and diet.",
    sleep: "Irregular sleep affects mental and physical health. Try consistent sleep timing.",
    dizziness: "Dizziness may occur due to low BP, dehydration, or skipping meals.",
    digestion: "Digestive discomfort may be related to diet. Avoid oily/spicy food.",
    hydration: "Proper hydration is essential for body function and energy levels."
};

let currentQuestion = 0;
let answers = [];
let selectedQuestions = [];

// initialize dynamic questions
document.addEventListener("DOMContentLoaded", () => {
    generateQuestions();
    updateProgress();
});

// randomly pick 3–4 questions each session
function generateQuestions() {
    selectedQuestions = questionPool
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
}

function updateProgress() {
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    const questionText = document.getElementById("questionText");
    const buttonGroup = document.getElementById("buttonGroup");

    const q = selectedQuestions[currentQuestion];

    progressText.textContent = `Step ${currentQuestion + 1} of ${selectedQuestions.length}`;
    progressFill.style.width = `${((currentQuestion + 1) / selectedQuestions.length) * 100}%`;

    questionText.textContent = q.question;

    buttonGroup.innerHTML = "";
    q.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = ans;
        btn.onclick = () => handleAnswer(ans.toLowerCase(), q.tag);
        buttonGroup.appendChild(btn);
    });
}

function handleAnswer(answer, tag) {
    answers.push({ tag, answer });

    currentQuestion++;

    const card = document.getElementById("questionCard");

    if (currentQuestion < selectedQuestions.length) {
        card.style.opacity = "0";

        setTimeout(() => {
            updateProgress();
            card.style.opacity = "1";
        }, 250);
    } else {
        showResult();
    }
}

function generateFinalInsight() {
    let result = [];

    answers.forEach(a => {
        if (a.answer === "yes" || a.answer === "sometimes" || a.answer === "occasionally") {
            result.push(insights[a.tag]);
        }
    });

    if (result.length === 0) {
        return "Your responses look balanced. Maintain healthy lifestyle habits like sleep, hydration, and nutrition.";
    }

    return result.join(" ");
}

function showResult() {
    const questionCard = document.getElementById("questionCard");
    const resultCard = document.getElementById("resultCard");
    const resultText = document.getElementById("resultText");

    const finalText = generateFinalInsight();

    questionCard.style.display = "none";
    resultCard.style.display = "block";

    resultText.textContent = finalText;
}

function restartQuiz() {
    currentQuestion = 0;
    answers = [];
    generateQuestions();

    const questionCard = document.getElementById("questionCard");
    const resultCard = document.getElementById("resultCard");

    resultCard.style.display = "none";
    questionCard.style.display = "block";

    updateProgress();
}
