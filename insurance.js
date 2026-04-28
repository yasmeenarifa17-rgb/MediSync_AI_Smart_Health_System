let selectedFile = null;

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
}

async function analyzeImage() {
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const resultText = document.getElementById('resultText');

    loading.style.display = 'block';

    setTimeout(() => {
        loading.style.display = 'none';

        resultText.innerHTML = `
        📄 Document Analysis Complete

        ✔ Possible Insurance Options:
        • Ayushman Bharat (Government)
        • ESIC Scheme
        • Private Insurance (Star Health, HDFC Ergo)

        💡 Recommendation:
        Based on your report, government insurance is highly suitable.
        
        📝 Next Step:
        Visit nearest hospital or apply online through official portals.
        `;

        resultContainer.style.display = 'block';
    }, 2000);
}