// Prescription Analyzer JavaScript

let selectedFile = null;
let cameraStream = null;

// Mock result for prescription
const mockResult = "Your prescription has been analyzed. Key findings: The medication is a common treatment for the indicated condition. Please consult with your pharmacist for detailed information about dosage and interactions.";

// Camera Functions
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
        alert("Unable to access camera. Please check permissions.");
        console.error("Camera error:", err);
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    imagePreview.src = dataUrl;
    previewContainer.style.display = 'block';
    analyzeBtn.disabled = false;
    
    // Convert to file
    canvas.toBlob((blob) => {
        selectedFile = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
    }, 'image/jpeg');
    
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
    reader.onload = function(e) {
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

function openCamera() {
    // Camera is now functional - triggers the hidden file input
    document.getElementById('cameraInput').click();
}

function handleCameraCapture(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        showPreview(file);
    }
}

function analyzeImage() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const resultText = document.getElementById('resultText');

    // Show loading
    analyzeBtn.style.display = 'none';
    loading.style.display = 'block';

    // Simulate analysis delay
    setTimeout(() => {
        // Hide loading
        loading.style.display = 'none';

        // Show result
        resultText.textContent = mockResult;
        resultContainer.style.display = 'block';

        // Add animation
        resultContainer.style.opacity = '0';
        resultContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
        }, 50);
    }, 2000);
}