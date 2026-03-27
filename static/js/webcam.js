// Mengambil elemen-elemen dari HTML
const video = document.getElementById('videoElement');
const canvas = document.getElementById('canvasElement');
const overlayCanvas = document.getElementById('overlayCanvas'); 
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnMeme = document.getElementById('btnMeme'); 
const resultBox = document.getElementById('resultBox');
const emotionResult = document.getElementById('emotionResult');
const probContainer = document.getElementById('probContainer');
const memeArea = document.getElementById('memeArea'); 
const memeCanvas = document.getElementById('memeCanvas'); 
const btnDownloadMeme = document.getElementById('btnDownloadMeme'); // Elemen tombol Download

let videoStream = null;
let detectionInterval = null;

// Flag untuk Konsep Meme
let captureNextFrameAsMeme = false; 

// Fungsi untuk MENYALAKAN kamera
async function startCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        
        btnStart.style.display = 'none';
        btnStop.style.display = 'block';
        btnMeme.style.display = 'block'; 
        resultBox.style.display = 'block';
        emotionResult.innerText = "ANALYZING...";

        // Mulai proses jepret dan deteksi
        detectionInterval = setInterval(captureAndSendFrame, 1500);

    } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Gagal mengakses kamera. Pastikan browser diizinkan menggunakan kamera.");
    }
}

// Fungsi untuk MEMATIKAN kamera
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    if (detectionInterval) {
        clearInterval(detectionInterval);
    }

    const ctxOverlay = overlayCanvas.getContext('2d');
    ctxOverlay.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    if(probContainer) probContainer.innerHTML = '';
    memeArea.style.display = 'none';

    btnStart.style.display = 'block';
    btnStop.style.display = 'none';
    btnMeme.style.display = 'none'; 
    emotionResult.innerText = "CAMERA OFF";
    emotionResult.style.color = "#1a1a2e";
}

// Fungsi Utama: Jepret foto dan kirim ke backend (app.py)
function captureAndSendFrame() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');

    fetch('/analyze_frame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        // A. TAMPILKAN TEKS EMOSI
        if(data.emotion) {
            emotionResult.innerText = data.emotion;
            if(data.emotion === "HAPPY") emotionResult.style.color = "#FFD700";
            else if(data.emotion === "SAD") emotionResult.style.color = "#4169E1";
            else if(data.emotion === "ANGRY") emotionResult.style.color = "#DC143C";
            else emotionResult.style.color = "#8A2BE2"; 
        }

        // B. GAMBAR KOTAK WAJAH
        const ctxOverlay = overlayCanvas.getContext('2d');
        overlayCanvas.width = video.videoWidth;
        overlayCanvas.height = video.videoHeight;
        ctxOverlay.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        if (data.box && data.box.w > 0) {
            ctxOverlay.strokeStyle = '#8b5cf6';
            ctxOverlay.lineWidth = 5;
            ctxOverlay.lineJoin = "round";
            ctxOverlay.strokeRect(data.box.x, data.box.y, data.box.w, data.box.h);
        }

        // C. TAMPILKAN PROGRESS BAR PERSENTASE
        if (data.probabilities) {
            const colorMap = {
                'HAPPY': '#f1c40f', 'SAD': '#3498db', 'ANGRY': '#e74c3c', 
                'NEUTRAL': '#9b59b6', 'FEAR': '#95a5a6', 'DISGUST': '#2ecc71', 'SURPRISE': '#1abc9c'
            };

            let probHTML = '';
            for (const [emotion, score] of Object.entries(data.probabilities)) {
                let percent = parseFloat(score).toFixed(1); 
                let barColor = colorMap[emotion] || '#8A2BE2';

                probHTML += `
                <div class="prob-item">
                    <div class="emotion-label">${emotion}</div>
                    <div class="bar-wrapper">
                        <div class="bar-fill" style="width: ${percent}%; background: ${barColor};"></div>
                    </div>
                    <div class="percent-box" style="border-left: 3px solid ${barColor};">
                        ${percent}%
                    </div>
                </div>`;
            }
            probContainer.innerHTML = probHTML;
        }

        // D. JIKA USER MINTA DIBUATKAN MEME
        if (captureNextFrameAsMeme && data.emotion && data.emotion !== 'NO FACE DETECTED') {
            generateMeme(data.emotion);
            captureNextFrameAsMeme = false; 
            btnMeme.innerText = "Make Me a Meme!"; 
        }
    })
    .catch(error => console.error("Error:", error));
}

// Database teks meme
const memeTexts = {
    'HAPPY': [
        { top: 'KETIKA LIHAT...', bottom: 'SALDO BERTAMBAH!' },
        { top: 'MUKA PAS TAU...', bottom: 'BESOK LIBUR PANJANG!' },
        { top: 'POV:', bottom: 'NEMU DUIT DI KANTONG LAMA!' },
        { top: 'DIKASIH INFO...', bottom: 'MAKANAN GRATIS!' },
        { top: 'PAS DOSEN BILANG...', bottom: 'KELAS HARI INI DIBATALKAN!' },
        { top: 'POV:', bottom: 'PROJECT IRIS BISA SELESAI' }
    ],
    'SAD': [
        { top: 'POV:', bottom: 'LAGI MERENUNGI NASIB' },
        { top: 'DOMPET TIPIS...', bottom: 'TANGGAL TUA MASIH LAMA' },
        { top: 'CHAT PANJANG...', bottom: 'CUMA DIBALAS "Y"' },
        { top: 'PAS MAU MAKAN...', bottom: 'LAUK TERAKHIR DIAMBIL TEMAN' },
        { top: 'KETIKA...', bottom: 'DI-GHOSTING PAS LAGI SAYANG-SAYANGNYA' }
    ],
    'ANGRY': [
        { top: 'SIAPA YANG...', bottom: 'KENTUT DI DEPAN MUKA AKU?!' },
        { top: 'PAS LAGI SERU MAIN...', bottom: 'TIBA-TIBA WIFI MATI!' },
        { top: 'JANGAN GANGGU!', bottom: 'LAGI SENGGOL BACOK!' },
        { top: 'UDAH NUNGGU LAMA...', bottom: 'TERNYATA GAK JADI PERGI!' },
        { top: 'PAS LAGI TIDUR ENAK...', bottom: 'ADA YANG BANGUNIN SURUH MANDI!' },
        { top: 'KETIKA...', bottom: 'LU NGODING TAPI ERROR MULU' }
    ],
    'NEUTRAL': [
        { top: 'TAMPANG AKU KALAU...', bottom: 'DITANYA KAPAN NIKAH' },
        { top: 'NO COMMENT...', bottom: 'LAGI MODE HEMAT ENERGI' },
        { top: 'KULIAH JAM 7 PAGI...', bottom: 'DOSENNYA GAK DATANG' },
        { top: 'LAGI MIKIR...', bottom: 'NANTI SIANG MAKAN APA YA?' },
        { top: 'POV:', bottom: 'PURA-PURA MERHATIKAN ORANG NGOMONG' },
        { top: 'KETIKA...', bottom: 'TEMEN BILANG "GAK APA-APA"' },
        { top: 'INI MUKA', bottom: 'ORANG JOMOK' }
    ],
    'FEAR': [
        { top: 'KETIKA LIHAT...', bottom: 'ADA KECOA TERBANG!' },
        { top: 'MUKA PAS TAU...', bottom: 'BESOK DEADLINE TUGAS!' },
        { top: 'PAS NGECEK M-BANKING...', bottom: 'SALDO TINGGAL BELASAN RIBU!' },
        { top: 'KETIKA NYOKAP TANYA...', bottom: '"TUPPERWARE DIMANA?"' },
        { top: 'PAS LAGI UJIAN...', bottom: 'PENGAWAS BERDIRI DI SAMPING MEJA' }
    ],
    'DISGUST': [
        { top: 'PAS NYIUM BAU...', bottom: 'KAOS KAKI TEMEN!' },
        { top: 'EKSPRESI KETIKA...', bottom: 'MAKANAN JATUH BELUM 5 MENIT' },
        { top: 'LIHAT ORANG...', bottom: 'MAKAN MIE INSTAN PAKAI NASI & ROTI' },
        { top: 'PAS PEGANG...', bottom: 'GAGANG PINTU WC UMUM YANG BASAH' },
        { top: 'EKSPRESI KETIKA...', bottom: 'NGINJAK BECEKAN PAKAI KAOS KAKI' }
    ],
    'SURPRISE': [
        { top: 'HAH?!', bottom: 'TERNYATA DIA UDAH PUNYA PACAR?!' },
        { top: 'PLOT TWIST:', bottom: 'HARI INI TANGGAL MERAH!' },
        { top: 'PAS BUKA DOMPET...', bottom: 'TERNYATA MASIH ADA UANG BIRU!' },
        { top: 'HAH?!', bottom: 'UDAH HARI SENIN LAGI?!' }
    ]
};

// Fungsi generate Meme
function generateMeme(emotion) {
    const ctxMeme = memeCanvas.getContext('2d');
    const emotionTexts = memeTexts[emotion] || [{ top: 'KETIKA...', bottom: '...' }];
    const randomIdx = Math.floor(Math.random() * emotionTexts.length);
    const text = emotionTexts[randomIdx];

    memeCanvas.width = video.videoWidth;
    memeCanvas.height = video.videoHeight;
    ctxMeme.clearRect(0, 0, memeCanvas.width, memeCanvas.height);

    ctxMeme.translate(memeCanvas.width, 0); 
    ctxMeme.scale(-1, 1); 
    ctxMeme.drawImage(video, 0, 0, memeCanvas.width, memeCanvas.height);
    ctxMeme.setTransform(1, 0, 0, 1, 0, 0); 

    ctxMeme.font = 'bold 36px Impact, sans-serif'; 
    ctxMeme.fillStyle = 'white';
    ctxMeme.strokeStyle = 'black';
    ctxMeme.lineWidth = 4;
    ctxMeme.textAlign = 'center';
    
    ctxMeme.textBaseline = 'top';
    ctxMeme.strokeText(text.top, memeCanvas.width / 2, 20); 
    ctxMeme.fillText(text.top, memeCanvas.width / 2, 20); 

    ctxMeme.textBaseline = 'bottom';
    ctxMeme.strokeText(text.bottom, memeCanvas.width / 2, memeCanvas.height - 20);
    ctxMeme.fillText(text.bottom, memeCanvas.width / 2, memeCanvas.height - 20);

    memeArea.style.display = 'block';
}

// Pasang event listener
btnStart.addEventListener('click', startCamera);
btnStop.addEventListener('click', stopCamera);
btnMeme.addEventListener('click', () => {
    captureNextFrameAsMeme = true; 
    btnMeme.innerText = "WAIT A SEC..."; 
    setTimeout(() => { btnMeme.innerText = "Make Me a Meme!"; }, 2500); 
});

// FITUR BARU: Download Meme ke Local Device
if (btnDownloadMeme) {
    btnDownloadMeme.addEventListener('click', () => {
        // Ubah isi canvas meme menjadi format URL gambar (PNG)
        const imageURL = memeCanvas.toDataURL('image/png');
        
        // Buat elemen <a> sementara secara gaib
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        
        // Setel nama file otomatis
        downloadLink.download = `MoodLens_Meme_${new Date().getTime()}.png`;
        
        // Pura-pura klik link tersebut untuk memicu download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Bersihkan link gaib tadi
        document.body.removeChild(downloadLink);
    });
}