// Health Q&A JavaScript

// Questions data
const questions = [
    {
        question: "Do you experience frequent headaches?",
        answers: ["Yes", "No", "Maybe"]
    },
    {
        question: "Do you have trouble sleeping at night?",
        answers: ["Yes", "No", "Sometimes"]
    },
    {
        question: "Do you feel fatigued during the day?",
        answers: ["Yes", "No", "Occasionally"]
    }
];

// Mock results based on answers
const mockResults = [
    "Based on your answers, we recommend staying hydrated and maintaining regular sleep patterns. If symptoms persist, please consult a healthcare professional.",
    "Your responses suggest you may benefit from stress management techniques and regular exercise. Consider speaking with a doctor if symptoms continue.",
    "We recommend reviewing your daily routine and ensuring you're getting adequate nutrition and rest. A check-up with your physician might be helpful.",
    "Your answers indicate a balanced lifestyle, but maintaining regular health check-ups is always recommended for optimal well-being."
];

let currentQuestion = 0;
let answers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
});

function updateProgress() {
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const questionText = document.getElementById('questionText');
    const buttonGroup = document.getElementById('buttonGroup');

    // Update progress text and bar
    progressText.textContent = `Step ${currentQuestion + 1} of ${questions.length}`;
    progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

    // Update question
    questionText.textContent = questions[currentQuestion].question;

    // Update buttons
    buttonGroup.innerHTML = '';
    questions[currentQuestion].answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => handleAnswer(answer.toLowerCase());
        buttonGroup.appendChild(btn);
    });
}

function handleAnswer(answer) {
    answers.push(answer);
    currentQuestion++;

    if (currentQuestion < questions.length) {
        // Animate transition
        const card = document.getElementById('questionCard');
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            updateProgress();
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300);
    } else {
        // Show result
        showResult();
    }
}

function showResult() {
    const questionCard = document.getElementById('questionCard');
    const resultCard = document.getElementById('resultCard');
    const resultText = document.getElementById('resultText');

    // Generate mock result based on answers
    const resultIndex = Math.floor(Math.random() * mockResults.length);
    resultText.textContent = mockResults[resultIndex];

    // Animate transition
    questionCard.style.opacity = '0';
    questionCard.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        questionCard.style.display = 'none';
        resultCard.style.display = 'block';
        resultCard.style.opacity = '0';
        resultCard.style.transform = 'translateY(20px)';

        setTimeout(() => {
            resultCard.style.opacity = '1';
            resultCard.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
}

function restartQuiz() {
    currentQuestion = 0;
    answers = [];

    const questionCard = document.getElementById('questionCard');
    const resultCard = document.getElementById('resultCard');

    resultCard.style.opacity = '0';
    resultCard.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        resultCard.style.display = 'none';
        questionCard.style.display = 'block';
        questionCard.style.opacity = '0';
        questionCard.style.transform = 'translateY(20px)';

        setTimeout(() => {
            updateProgress();
            questionCard.style.opacity = '1';
            questionCard.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
}