# 🛵 Ojol Mengaji - Berkah Dunia Akhirat
**Aplikasi Mobile Halaqah Al-Qur'an, Presensi GPS Geofencing & Pembinaan Spiritual Pengemudi Ojek Online**
*Inisiasi Dakwah DPW Hidayatullah DKI Jakarta bersama Komunitas Driver Ojek Online*

---

## 🌟 Fitur Utama & Arsitektur Sistem

### 1. 📱 Aplikasi Santri Driver & Guru (`index.html`)
- **Tema Desain Premium**: Islamic Emerald (`#064e3b`, `#047857`) dipadu sentuhan Royal Gold (`#d97706`), Glassmorphism, dan Tipografi modern *Plus Jakarta Sans* & *Amiri Arabic*.
- **Tampilan Presisi**: Tampil sebagai simulator smartphone berkelas di desktop dan otomatis 100% full-screen responsif di layar ponsel pengemudi.
- **Header Bersih**: Tidak ada tombol peran/ganti peran pada antarmuka santri pengguna. Pengguna fokus pada halaqah dan presensi mereka.
- **🛵 Fitur Peserta (Driver Ojol - Gojek, Grab, ShopeeFood, Maxim, inDrive)**:
  - **Profil Driver**: Menampilkan nama, kontak WhatsApp, shelter binaan, status akun (Aktif / Menunggu Verifikasi), dan Kategori Kemampuan (A, B, C, D).
  - **Presensi GPS Geofencing**: Deteksi koordinat GPS satelit dengan rumus Haversine presisi dalam radius shelter binaan. Dilengkapi **Mode Simulasi GPS** untuk kemudahan uji coba langsung.
  - **Rapor & Evaluasi Ustadz**: Riwayat penilaian skor Makhraj & Tajwid (1-5), skor Kelancaran (1-5), serta catatan bimbingan dari Ustadz.
  - **Mushaf Saku Digital**: Bacaan surah-surah pendek (Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas) lengkap dengan teks Arab, transliterasi Latin, dan terjemahan Bahasa Indonesia.
- **👳 Fitur Guru (Ustadz Pembina)**:
  - **Daftar Santri Binaan**: Menampilkan seluruh driver di bawah shelter yang ditugaskan kepada ustadz.
  - **Akses Cepat WhatsApp**: 1-klik untuk menghubungi santri langsung melalui WhatsApp (`wa.me`).
  - **Form Penilaian Santri**: Slider evaluasi Makhraj/Tajwid, Kelancaran bacaan, penentuan jenjang Kategori (A, B, C, D), dan catatan perkembangan santri.

### 2. 🛡️ Portal Admin DPW Halaman Terpisah (`admin.html`)
- **Halaman Khusus Pengurus**: Memiliki halaman tersendiri dengan antarmuka portal yang elegan, aman, dan responsif untuk desktop maupun mobile.
- **Ringkasan Metrik**: Statistik jumlah shelter, guru mengaji, driver santri, dan antrean verifikasi realtime.
- **Manajemen Titik Shelter**: Tambah titik kumpul baru dengan fitur **"Ambil GPS Saya Sekarang"**, pengaturan radius geofencing, alamat, jadwal halaqah, dan hapus shelter.
- **Manajemen Guru (Asatidz)**: Pendaftaran akun ustadz baru serta penugasan multi-shelter binaan dan direct chat WhatsApp.
- **Verifikasi Peserta Driver**: Persetujuan pendaftar driver baru (1-klik Setujui / Batalkan verifikasi), filter status (Semua / Pending / Terverifikasi), hubungi driver via WhatsApp, dan hapus akun.

---

## 🔑 Kredensial Akun (Akun Siap Pakai)

Gunakan akun berikut untuk masuk ke aplikasi santri atau portal admin:

| Halaman | Peran | Nama Akun | Identitas (Email / No. HP) | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **🛡️ [admin.html](file:///c:/Project%20Ojol%20Mengaji/admin.html)** | **Admin DPW** | Ustadz Haris Wijaya | `admin@ojolmengaji.id` | `admin123` | Portal khusus pengurus DPW (Shelter, Guru, Verifikasi) |
| **🛵 [index.html](file:///c:/Project%20Ojol%20Mengaji/index.html)** | **Santri Aktif** | Bambang Pamungkas | `081234567890` | `ojol123` | Driver Gojek - Kategori B (Shelter Gambir) |
| **🛵 [index.html](file:///c:/Project%20Ojol%20Mengaji/index.html)** | **Santri Pending**| Rudi Hartono | `081234567891` | `ojol123` | Driver Grab - Menunggu verifikasi admin |
| **👳 [index.html](file:///c:/Project%20Ojol%20Mengaji/index.html)** | **Guru / Ustadz** | Ustadz Ahmad Fauzi, Lc | `081299990001` *(atau `guru@ojolmengaji.id`)* | `guru123` | Pembina Shelter Gambir & Tebet |
| **📝 [index.html](file:///c:/Project%20Ojol%20Mengaji/index.html)** | **Santri Baru** | Pendaftaran Mandiri | *(Formulir Daftar Santri)* | Bebas | Otomatis masuk antrean verifikasi admin |

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi ini bersifat **Zero-Dependency** dan mandiri:

### Cara 1: Buka Berkas Langsung di Browser
- Aplikasi Santri Driver: Buka berkas [index.html](file:///c:/Project%20Ojol%20Mengaji/index.html).
- Portal Admin DPW: Buka berkas [admin.html](file:///c:/Project%20Ojol%20Mengaji/admin.html).

### Cara 2: Menjalankan Server Localhost
1. **Klik ganda berkas `start-server.bat`** (Windows).
2. Atau jalankan di terminal:
   ```bash
   node server.js
   ```
3. Buka di browser:
   - Aplikasi Santri: **`http://localhost:8080/`**
   - Portal Admin DPW: **`http://localhost:8080/admin.html`**

---

## 📁 Struktur Berkas Proyek

```text
Project Ojol Mengaji/
├── index.html                                  # Antarmuka Pengguna Santri Driver & Guru Mengaji
├── admin.html                                  # Portal Khusus Admin Dewan Pengurus DPW
├── css/
│   └── style.css                               # Desain Sistem Emerald-Gold, Radar Animasi & Glassmorphism
├── js/
│   ├── data.js                                 # Data Store, Seed Akun, Kurikulum A-D, & Rumus Haversine
│   ├── app.js                                  # Logika Aplikasi Santri (GPS Presensi, Rapor, Mushaf)
│   └── admin.js                                # Logika Portal Admin (Shelter GPS, Guru, Verifikasi)
├── Logo Ojol Mengaji Berkah Dunia Akhirat.png  # Logo Utama
├── Logo DPW DKI Jakarta.jpg                    # Logo Kemitraan DPW Hidayatullah DKI
├── server.js                                   # Localhost Server (Node.js)
├── start-server.bat                            # Script 1-Klik Jalankan di Windows
└── README.md                                   # Dokumentasi Lengkap Sistem
```
