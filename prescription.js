let selectedFile = null;
let cameraStream = null;

// ===============================
// 🧠 SMART OCR + DECODER ENGINE
// ===============================
function fakeOCRSimulation() {
    // Simulated "handwriting recognition output"
    const detectedText = `
    Rx: Paracetamol 500mg
    Amoxicillin 250mg
    Vitamin D3
    Cough syrup
    `;

    return detectedText;
}

// ===============================
// 💊 MEDICAL INTERPRETER ENGINE
// ===============================
function interpretPrescription(text) {
    text = text.toLowerCase();

    let result = "💊 Prescription Decoded:\n\n";

    if (text.includes("paracetamol")) {
        result += "✔ Paracetamol → Used for fever & pain relief\n";
    }
    if (text.includes("amoxicillin")) {
        result += "✔ Amoxicillin → Antibiotic for infection\n";
    }
    if (text.includes("vitamin")) {
        result += "✔ Vitamins → Improve immunity & health\n";
    }
    if (text.includes("cough")) {
        result += "✔ Cough Syrup → Relief from cough & throat irritation\n";
    }

    result += `
    
⚠ Medical Advice:
• Take medicines only after doctor consultation  
• Do not overdose  
• Drink plenty of water  
• Complete full antibiotic course  

❗ If symptoms persist, consult a doctor immediately.
    `;

    return result;
}

// ===============================
// 📸 CAMERA FUNCTIONS (UNCHANGED)
// ===============================
async function startCamera() {
    const cameraContainer = document.getElementById('cameraContainer');
    const video = document.getElementById('cameraVideo');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        video.srcObject = cameraStream;
        cameraContainer.style.display = 'block';

    } catch (err) {
        alert("Camera not accessible");
        console.error(err);
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg');
    imagePreview.src = dataUrl;

    previewContainer.style.display = 'block';
    analyzeBtn.disabled = false;

    closeCamera();
}

function closeCamera() {
    const cameraContainer = document.getElementById('cameraContainer');

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    cameraContainer.style.display = 'none';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        showPreview(file);
    }
}

function showPreview(file) {
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');

    const reader = new FileReader();
    reader.onload = function (e) {
        imagePreview.src = e.target.result;
        previewContainer.style.display = 'block';
        analyzeBtn.disabled = false;
    };

    reader.readAsDataURL(file);
}

function removeImage() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('resultContainer').style.display = 'none';
}

// ===============================
// 🚀 MAIN ANALYSIS FUNCTION
// ===============================
function analyzeImage() {
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const resultText = document.getElementById('resultText');

    loading.style.display = 'block';

    setTimeout(() => {
        loading.style.display = 'none';

        // Step 1: fake OCR
        const extractedText = fakeOCRSimulation();

        // Step 2: interpret
        const finalResult = interpretPrescription(extractedText);

        resultText.innerText = finalResult;

        resultContainer.style.display = 'block';

    }, 2000);
}
