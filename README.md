MoodLens adalah aplikasi web berbasis Artificial Intelligence (AI) yang dirancang untuk mendeteksi dan mengenali ekspresi wajah serta emosi manusia secara otomatis. Aplikasi ini menggabungkan kekuatan Computer Vision dan Web Development untuk memberikan pengalaman interaktif kepada pengguna.

Teknologi yang Digunakan
1. Backend: Python, Flask
2. Machine Learning: Keras / TensorFlow (Deep Learning Model)
3. Frontend: HTML, CSS
4. Lainnya: NumPy, Pickle (Label Encoder)

Struktur Proyek
1. app.py: File utama untuk menjalankan server aplikasi web (Flask).
2. FacialExpressionModel.h5: Model Machine Learning (pre-trained) yang bertugas memprediksi emosi dari gambar wajah.
3. LabelEncoder.pck: File untuk menerjemahkan angka hasil prediksi model AI menjadi label teks yang bisa dibaca (misal: Senang, Sedih, Terkejut).
4. cek_label.py: Skrip utilitas untuk memeriksa dan memverifikasi label emosi yang ada di dalam LabelEncoder.
5. requirements.txt: Daftar pustaka (library) Python yang dibutuhkan untuk menjalankan aplikasi.
6. templates/: Folder yang berisi file antarmuka web (HTML).
7. static/: Folder yang berisi file desain antarmuka (CSS).

Cara Menjalankan Aplikasi di Komputer Lokal
1. Clone repositori ini ke komputermu:
git clone https://github.com/motmots/moodlens-app.git
cd moodlens-app

2. Install semua library yang dibutuhkan:
pip install -r requirements.txt

3. Jalankan aplikasi:
python app.py

4. Buka aplikasi di browser:
Buka browser dan akses alamat http://localhost:5000 (atau sesuai dengan port yang muncul di terminalmu).
