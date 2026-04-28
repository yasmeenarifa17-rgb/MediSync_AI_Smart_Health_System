
let selectedFile = null;
let cameraStream = null;

// ---------------- CAMERA ----------------
async function startCamera() {
    const cameraContainer = document.getElementById('cameraContainer');
    const video = document.getElementById('cameraVideo');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        video.srcObject = cameraStream;
        cameraContainer.style.display = "block";

    } catch (err) {
        alert("Camera not available or permission denied.");
        console.error(err);
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(blob => {
        selectedFile = new File([blob], "report.jpg", { type: "image/jpeg" });
        showPreview(URL.createObjectURL(blob));
    }, "image/jpeg");

    closeCamera();
}

function closeCamera() {
    const cameraContainer = document.getElementById('cameraContainer');

    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
    }

    cameraContainer.style.display = "none";
}

// ---------------- FILE ----------------
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file;
    showPreview(URL.createObjectURL(file));
}

function showPreview(src) {
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');

    imagePreview.src = src;
    previewContainer.style.display = "block";
    analyzeBtn.disabled = false;
}

function removeImage() {
    selectedFile = null;
    document.getElementById('fileInput').value = "";
    document.getElementById('previewContainer').style.display = "none";
    document.getElementById('resultContainer').style.display = "none";
    document.getElementById('analyzeBtn').disabled = true;
}

// ---------------- OCR ----------------
async function extractText(file) {
    try {
        const res = await Tesseract.recognize(file, "eng");
        return res.data.text || "";
    } catch (err) {
        console.error("OCR error:", err);
        return "";
    }
}

// ---------------- MEDICAL PARSER ----------------
function parseMedicalReport(text) {
    text = text.toLowerCase();

    const data = {
        name: extract(text, ["name", "patient"]),
        age: parseInt(extract(text, ["age"])) || 0,
        hospital: extract(text, ["hospital", "clinic"]),
        id: extract(text, ["id", "patient id", "application"]),
        disease: detectDisease(text),
        severity: detectSeverity(text)
    };

    return data;
}

function extract(text, keys) {
    for (let k of keys) {
        const match = text.match(new RegExp(`${k}[:\\s-]*([a-zA-Z0-9 ]{2,30})`, "i"));
        if (match) return match[1].trim();
    }
    return "Not Found";
}

function detectDisease(text) {
    if (text.includes("diabetes")) return "Diabetes";
    if (text.includes("bp") || text.includes("blood pressure")) return "Hypertension";
    if (text.includes("asthma")) return "Asthma";
    if (text.includes("fever")) return "Fever";
    if (text.includes("infection")) return "Infection";
    return "General";
}

function detectSeverity(text) {
    if (text.includes("severe") || text.includes("critical")) return "High";
    if (text.includes("moderate")) return "Medium";
    return "Low";
}

// ---------------- RISK ENGINE ----------------
function calculateRisk(data) {
    let score = 0;

    if (data.age > 60) score += 2;
    if (data.age > 40) score += 1;

    if (data.disease === "Diabetes" || data.disease === "Hypertension") score += 2;
    if (data.severity === "High") score += 2;
    if (data.severity === "Medium") score += 1;

    if (score >= 5) return "High Risk";
    if (score >= 3) return "Medium Risk";
    return "Low Risk";
}

// ---------------- INSURANCE ENGINE ----------------
function getInsurance(data, risk) {
    let options = [];

    // Government schemes
    if (data.age <= 70) {
        options.push({
            name: "Ayushman Bharat (Govt)",
            link: "https://pmjay.gov.in/"
        });
    }

    if (data.disease === "Diabetes" || data.disease === "Hypertension") {
        options.push({
            name: "ESIC Health Scheme",
            link: "https://www.esic.gov.in/"
        });
    }

    // Private insurance
    options.push(
        {
            name: "HDFC ERGO Health Insurance",
            link: "https://www.hdfcergo.com/health-insurance"
        },
        {
            name: "Star Health Insurance",
            link: "https://www.starhealth.in/"
        }
    );

    // prioritize based on risk
    if (risk === "High Risk") {
        options.unshift({
            name: "Priority Medical Coverage (Recommended First)",
            link: "https://pmjay.gov.in/"
        });
    }

    return options;
}

// ---------------- MAIN ANALYSIS ----------------
async function analyzeImage() {
    const loading = document.getElementById("loading");
    const resultContainer = document.getElementById("resultContainer");
    const resultText = document.getElementById("resultText");

    loading.style.display = "block";

    if (!selectedFile) {
        loading.style.display = "none";
        alert("Please upload a file first");
        return;
    }

    const text = await extractText(selectedFile);

    if (!text || text.length < 10) {
        loading.style.display = "none";
        resultText.innerHTML = "❌ OCR failed. Please upload a clearer image.";
        resultContainer.style.display = "block";
        return;
    }

    const data = parseMedicalReport(text);
    const risk = calculateRisk(data);
    const insurance = getInsurance(data, risk);

    loading.style.display = "none";

    let html = `
        📄 <b>AI Medical Report Analysis</b><br><br>

        👤 Name: ${data.name}<br>
        🎂 Age: ${data.age}<br>
        🏥 Hospital: ${data.hospital}<br>
        🆔 ID: ${data.id}<br>
        💊 Disease: ${data.disease}<br>
        ⚠ Severity: ${data.severity}<br>
        📊 Risk Level: <b>${risk}</b><br><br>

        <b>🏥 Recommended Insurance Plans:</b><br>
    `;

    insurance.forEach(i => {
        html += `✔ <a href="${i.link}" target="_blank">${i.name}</a><br>`;
    });

    html += `<br><i>⚡ AI-based eligibility + risk scoring applied</i>`;

    resultText.innerHTML = html;
    resultContainer.style.display = "block";
}
