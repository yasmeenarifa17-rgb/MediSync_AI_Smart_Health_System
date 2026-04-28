const quotes = [
 "Your health is your greatest asset.",
 "Stay strong, recovery takes time.",
 "Small steps lead to big healing.",
 "Consistency beats intensity.",
 "Take care of your body, it’s the only place you live.",
 "Healing begins with discipline.",
 "Every day is a step towards better health."
];

function getDailyQuote() {
    const day = new Date().getDate();
    return quotes[day % quotes.length];
}