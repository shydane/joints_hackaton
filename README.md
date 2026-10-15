
# Lanjut Sekolah

> **Platform Deteksi Dini, Pendampingan Berjenjang, dan Gamifikasi Edukasi untuk Mencegah Siswa Putus Sekolah**
> 
> *Karya Hackathon JOINTS 2026 — Subtema Education*
> 

---

### Tentang Proyek

**Lanjut Sekolah** adalah aplikasi web responsif yang dirancang untuk membantu siswa yang berisiko putus sekolah akibat tekanan ekonomi, pekerjaan membantu keluarga, perundungan (*bullying*), atau penurunan motivasi belajar.

Banyak siswa enggan melapor karena rasa takut, malu, atau stigma ruang BK konvensional. Di saat yang sama, pihak sekolah kerap terlambat menyadari masalah karena hanya bersifat reaktif. Lanjut Sekolah menghadirkan solusi terintegrasi:

1. **Pintu Mandiri Siswa:** Ruang cerita percakapan bertahap yang aman, suportif, dan menyediakan opsi anonimitas.


2. **Pintu Proaktif Sistem:** Deteksi dini otomatis saat tren kehadiran turun di bawah 80% atau nilai rata-rata merosot tajam.


3. **Pemulihan Motivasi:** Zona game edukasi asah logika dan papan peringkat kelas untuk mengembalikan semangat belajar siswa secara menyenangkan.



Penanganan kasus dilakukan secara berjenjang oleh Wali Kelas melalui pendekatan personal dan Guru BK melalui asesmen mendalam, beasiswa atau bantuan desa, hingga batas terminasi 3 sesi konseling sebelum eskalasi eksternal.

---

### Fitur Utama

**1. Peran Siswa (Mobile-First)**

* **Emotional Landing Page:** Tampilan pembuka menenangkan berfilosofi *Sunrise on the School Path* dengan tajuk *"Kamu tidak sendirian. Ceritakan, kami dengarkan."*

* **Conversational Multi-Step Form:** Pelaporan bertahap satu pertanyaan per layar (kategori masalah, waktu terjadi, cerita masalah, urgensi, bukti opsional, jalur lapor, dan toggle anonim).


* **Dynamic Anonymity:** Identitas asli disamarkan di hadapan guru, dan hanya terbuka penuh untuk Guru BK apabila kasus berkategori mendesak.


* **Kode Unik Pelaporan:** Siswa dapat melacak progres laporan memakai kode unik acak berformat `LS-XXXX-X`.


* **Timeline Status & Notifikasi:** Linimasa status transparan (*Dikirim*, *Ditinjau*, *Pendampingan*, *Selesai*) disertai pusat notifikasi langsung.


* **Zona Game Edukasi:** Minigame asah logika harian mencakup Pola Deret Bilangan, Matriks Pola Bentuk, Sudoku Mini 4x4, dan Menara Hanoi.


* **Papan Peringkat (Leaderboard):** Skor kompetisi sehat per kelas dan seluruh sekolah guna membangkitkan kembali motivasi belajar.



**2. Peran Wali Kelas**

* **Papan Aduan Kelas:** Daftar laporan khusus siswa di rombongan belajar perwaliannya dilengkapi filter status kasus.
* **Deteksi Dini Otomatis:** Tombol analitik untuk memindai siswa dengan absensi di bawah 80% atau penurunan nilai lebih dari 15%.


* **Grafik Akademik 6 Bulan:** Visualisasi Recharts untuk tren nilai dan absensi lengkap dengan batas ambang bahaya 80%.
* **Aksi Teratasi atau Eskalasi:** Catatan konsultasi personal dengan opsi solusi mandiri atau eskalasi langsung ke meja Guru BK.



**3. Peran Guru BK (Counselor)**

* **Papan Kasus Kanban:** Pengelompokan status kasus interaktif (*Baru*, *Ditinjau*, *Pendampingan*, *Selesai*, *Eskalasi Eksternal*) dengan penandaan prioritas kasus mendesak.
* **Asesmen Berbasis Kategori:** Alur tindak lanjut spesifik untuk klaster Ekonomi (beasiswa & bantuan eksternal desa), Perundungan/Sosial (pendampingan mental & penindakan), serta Kurang Motivasi (program belajar & motivasi).


* **Evaluasi & Pembatas Sesi:** Evaluasi berkala dengan batas maksimal 3 sesi konseling sebelum tombol eskalasi rujukan eksternal aktif.



**4. Floating Demo Bar (Khusus Pengujian)**

* **Quick Switch Role:** Berpindah peran instan antara akun Siswa, Wali Kelas, dan Guru BK tanpa login berulang.


* **Reset Data:** Mengembalikan data simulasi kasus ke kondisi awal kapan saja saat demonstrasi berlangsung.

---

### Identitas Desain & UI/UX

* **Pendekatan:** *Soft-Neobrutalism* (border 2px navy, rounded-2xl, bayangan solid offset 4px, dan tombol beranimasi).
* **Palet Warna:**
* Background: Soft Blue-Tint `#F3F7FA`
* Teks & Border: Deep Ink Navy `#14213D`
* Aksen Utama: Sunrise Orange `#FF7A3D`
* Aksen Pendukung: Sky Blue `#7CC6FE` & Lemon `#FFD966`
* Aksen Sukses: Mint Pastel `#8EE3C2`


* **Tipografi:** Heading *Space Grotesk* / *Sora*, Body Text *Plus Jakarta Sans*.

---

### Tech Stack

* **Framework Frontend:** React.js dengan Vite


* **Styling:** Tailwind CSS v3
* **Routing:** React Router DOM v6
* **State Management:** Context API (`AppContext.jsx`) + `localStorage`
* **Visualisasi Data:** Recharts
* **Animasi & Ikon:** Framer Motion & Lucide React

---

### Struktur Direktori

```text
joints_hackaton/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── charts/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   │   ├── counselor/
│   │   ├── student/
│   │   ├── teacher/
│   │   ├── LandingPage.jsx
│   │   └── Login.jsx
│   ├── utils/
│   ├── AppRouter.jsx
│   └── main.tsx
├── index.html
├── package.json
└── tailwind.config.js

```

---

### Cara Menjalankan Proyek Secara Lokal

1. **Clone repositori proyek:**
```bash
git clone https://github.com/shydane/joints_hackaton.git
cd joints_hackaton

```


2. **Pasang dependensi:**
```bash
npm install

```


3. **Jalankan server pengembangan:**
```bash
npm run dev

```


Buka alamat lokal yang tertera pada terminal (contoh: `http://localhost:5173/` atau `http://localhost:5175/`).


4. **Uji build produksi:**
```bash
npm run build

```



---

### Tim Pengembang

Karya ini disusun oleh mahasiswa Politeknik Negeri Jember:

* **Yoga Dwi Putra Bagus** : 
Bertanggung jawab atas kepemimpinan tim, arsitektur Context API global, manajemen persistensi data, struktur mock data, dan logika deteksi dini otomatis.

* **M. Ihdhar Ihsanuddin Hasyidan** : 
Bertanggung jawab atas desain UI/UX soft-neobrutalism, pengembangan antarmuka reaktif (Siswa, Walas, BK), integrasi form bertahap, dan sinkronisasi alur interaksi pengguna.

* **Nency Elvaretta Ardelia** : 
Bertanggung jawab atas riset kebutuhan pengguna, pengujian skenario fungsionalitas, penyusunan dokumentasi teknis, dan perancangan materi.

* **Nasrizal Ardhani Hidayatullah** : 
Bertanggung jawab atas analisis sistem, pemodelan data akademik siswa, perancangan metrik analitik Recharts, dan pengujian alur data.   

---

*Dibuat untuk keikutsertaan dalam Kompetisi Nasional JOINTS 2026, FMIPA Universitas Gadjah Mada.*

