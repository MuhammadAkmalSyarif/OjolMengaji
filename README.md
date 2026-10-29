# 🕌 Website Ojol Mengaji

> **Platform Digital Pembinaan Al-Qur'an & Presensi Berbasis Shelter bagi Pengemudi Ojek Online**
> Sesuai dokumen *Software Requirements Specification (SRS) / Product Requirements Document (PRD)* Ojol Mengaji.

---

## 🌟 Fitur Utama Berdasarkan Peran Pengguna

### 1. 🛵 Portal Driver Ojol (Mobile-First / PWA Experience)
* **Presensi Mandiri Berbasis Shelter**:
  * Menggunakan sensor Geolokasi GPS ponsel dengan validasi jarak meter ke pusat shelter.
  * Fitur alternatif: Scan **QR Code Shelter** jika sinyal GPS mengalami kendala di lapangan.
  * Mencegah presensi ganda untuk sesi harian yang sama (*anti-fraud*).
* **Perhitungan Persentase Kehadiran Otomatis**:
  $$\text{Persentase Kehadiran} = \left(\frac{\text{Jumlah Sesi Hadir}}{\text{Jumlah Sesi Wajib Berlangsung}}\right) \times 100\%$$
* **Progres Membaca Al-Qur'an (Rubrik 6 Aspek)**:
  * Pengenalan Huruf Hijaiyah (Skala 1–4)
  * Harakat & Rangkaian Huruf Sambung (Skala 1–4)
  * Kelancaran Membaca (Skala 1–4)
  * Tajwid Dasar (Skala 1–4)
  * Makhraj & Pelafalan Huruf (Skala 1–4)
  * Kemandirian Membaca (Skala 1–4)
  * Catatan kelebihan & rekomendasi latihan mandiri dari Ustadz.
* **Tugas Mengaji & Setoran Bacaan**:
  * Notifikasi tugas dengan batas tenggat (*due date*).
  * Pengiriman catatan setoran dan simulasi **Voice Note Audio** bacaan.
  * Umpan balik serta penilaian langsung dari Ustadz pembimbing.

---

### 2. 👳‍♂️ Portal Guru Mengaji (Ustadz Pembimbing)
* **Dashboard Kelas Binaan**:
  * Informasi jadwal mengajar dan shelter tanggung jawab.
  * Alert otomatis tugas yang menunggu penilaian & evaluasi yang belum diisi.
* **Manajemen Presensi Sesi Kelas**:
  * Verifikasi kehadiran driver secara *real-time*.
  * Fitur presensi manual oleh guru jika terjadi kendala teknis pada HP driver.
  * Koreksi presensi resmi dengan catatan alasan.
* **Pengisian Rubrik Evaluasi Al-Qur'an**:
  * Form terstruktur untuk mencatat capaian 6 aspek rubrik.
  * Kemampuan mempublikasikan hasil agar dapat langsung dipantau oleh driver.
* **Pemberian & Koreksi Tugas Mengaji**:
  * Membuat instruksi tugas (surah target, ayat, materi).
  * Memeriksa setoran suara, memberikan skor 1-100, dan menuliskan catatan motivasi.

---

### 3. 👑 Portal Administrator Pusat
* **Dashboard Eksekutif & KPI**:
  * Statistik Driver Ojol Aktif, Guru Aktif, Shelter Aktif, dan sesi mingguan.
  * Deteksi otomatis **Peserta Berisiko Kurang Aktif** (kehadiran < 75%).
  * Grafik distribusi kemampuan membaca (Iqro 1-3, Iqro 4-6, Al-Qur'an Dasar, Mahir).
* **Master Data Shelter GPS**:
  * Menambah/mengubah shelter dengan titik koordinat *latitude*, *longitude*, dan *radius presensi* (meter).
* **Master Data Guru & Peserta**:
  * Pendaftaran akun, penugasan guru ke shelter, dan alokasi driver ke shelter binaan.
* **Monitoring Presensi & Koreksi Berizin**:
  * Log lengkap kehadiran dengan rincian metode (GPS, QR, Manual) dan jarak radius.
  * Tombol koreksi presensi resmi yang secara otomatis mewajibkan input alasan audit.
* **Pengumuman Terarah**:
  * Kirim informasi ke seluruh pengguna, khusus driver ojol, atau khusus guru mengaji.
* **Laporan & Ekspor Data**:
  * Unduh rekap kehadiran bulanan dalam format Spreadsheet (CSV).
* **Audit Log Compliance**:
  * Mencatat setiap aksi penting (Waktu, Pengguna, Peran, Entitas, Aksi, Keterangan).

---

## 🛠️ Tech Stack
* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet Islamic Emerald Green & Warm Gold
* **Icons**: [Lucide React](https://lucide.dev/)
* **State Management & Persistence**: React Context API + LocalStorage persistence
* **Mobile Ready**: Desain responsif ramah layar ponsel (*PWA ready*)

---

## 🚀 Cara Menjalankan Project

### 1. Masuk ke direktori project:
```bash
cd "c:\Project Ojol Mengaji"
```

### 2. Jalankan server development:
```bash
npm run dev
```

Buka browser dan akses: `http://localhost:3000`

### 3. Mode Simulasi Interaktif:
Di bagian atas halaman aplikasi, tersedia **Role Switcher** instan:
* Klik **Admin** untuk masuk sebagai Administrator Pusat.
* Klik **Guru Mengaji** untuk masuk sebagai Ust. Ahmad Fauzi.
* Klik **Peserta Ojol** untuk masuk sebagai Rian Hidayat (Driver Gojek).
* Terdapat juga dropdown untuk memilih akun driver / ustadz lainnya.

