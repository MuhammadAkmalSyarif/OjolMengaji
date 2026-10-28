# 🕌 Ojol Mengaji - PWA & Localhost Server (Full-Stack)
> **Aplikasi Monitoring Pembinaan Tilawah Al-Qur'an untuk Mitra Ojek Online**  
> *Sinergi Pembinaan Hidayatullah*

---

## ⚡ Server Localhost Sedang Aktif!

Aplikasi backend Node.js & frontend PWA telah berjalan secara aktif di background:

| Akses | Alamat URL | Keterangan |
|---|---|---|
| **Komputer / Laptop Ini** | [`http://localhost:3000`](http://localhost:3000) | Buka di browser Anda langsung |
| **HP / Smartphone (Satu Wi-Fi)** | `http://192.168.1.18:3000` | Uji coba multi-perangkat real-time |

> 💡 *Jika server dimatikan, Anda dapat menjalankannya kembali kapan saja dengan perintah `npm start` atau `node server.js`.*

---

## 🏗️ Arsitektur Sistem Localhost

Sistem ini telah mengimplementasikan arsitektur **Client-Server Real-Time** penuh:

1. **Backend REST API (Node.js & Express)**:
   - `/api/auth/login`: Autentikasi multi-peran dengan session token.
   - `/api/sessions/open` & `/api/sessions/close`: Pembuatan sesi mengaji & token QR dinamis di sisi server.
   - `/api/attendances`: **Validasi GPS Haversine sisi server** (bukan di frontend), memeriksa radius shelter (maks 75m) dan mencegah kecurangan presensi ganda.
   - `/api/assessments`: Pencatatan evaluasi rubrik tilawah (skala 1-4) dan pembaruan level santri (Level 0-4) secara persisten.
   - `/api/bootstrap`: Sinkronisasi otomatis data antar perangkat/tab setiap 2,5 detik.
2. **Database Persisten (`database.json`)**:
   - Seluruh data tersimpan langsung di berkas disk server, bukan hanya di memori browser lokal.
3. **Frontend PWA Responsif**:
   - Berjalan mulus di layar smartphone (maks 480px) maupun layar monitor desktop.
   - Terintegrasi dengan visual QR Generator (`qrcode.js`), Scanner Kamera (`html5-qrcode`), dan gambar identitas resmi (`assets/logo.jpg` & `assets/hero.jpg`).

---

## 🔑 Akun Demo (Tersedia Tombol 1-Click Login di Halaman Awal)

| Peran (Role) | Username | Password | Deskripsi |
|---|---|---|---|
| **Peserta (Ojol 1)** | `ojol1` | `123` | Joko Waluyo (Gojek) • Level 1 |
| **Peserta (Ojol 2)** | `ojol2` | `123` | Rudi Hartono (Grab) • Level 0 |
| **Peserta (Ojol 3)** | `ojol3` | `123` | Hendra Gunawan (Maxim) • Level 2 |
| **Guru / Ustadz** | `guru1` | `123` | Ust. Ahmad Fauzan (Pembina Shelter Sudirman) |
| **Admin Shelter** | `shelter1` | `123` | Budi Santoso (Admin Lapangan) |
| **Admin Program Pusat** | `admin` | `123` | Ust. H. Ridwan (Manager Pusat) |

---

## 📱 Skenario Uji Coba Multi-Device (Laptop & HP)

1. **Tab 1 / Laptop**: Buka `http://localhost:3000` dan masuk sebagai **Guru (`guru1`)**.
   - Klik **"+ Buka Sesi Mengaji (Generate QR)"**.
   - Server akan membuat QR Code dan token unik (contoh: `OM-XXXXXX`).
2. **Tab 2 / HP Smartphone**: Buka `http://192.168.1.18:3000` (atau tab browser baru) dan masuk sebagai **Peserta (`ojol1`)**.
   - Anda akan melihat status *"Sesi Mengaji Sedang Dibuka!"* secara otomatis.
   - Masuk ke menu **Presensi** $\rightarrow$ Scan QR menggunakan kamera HP atau klik *"Isi Cepat Kode Sesi"*.
   - Pilih opsi GPS:
     - **Simulasi Dalam Shelter (~18m)** $\rightarrow$ Presensi **Diterima oleh Server**.
     - **Simulasi Luar Jangkauan (~180m)** $\rightarrow$ Presensi **Ditolak oleh Server**.
3. **Pantau Tab Guru**: Jumlah peserta hadir di layar laptop Guru akan bertambah secara real-time!
4. **Guru Melakukan Asesmen**:
   - Guru membuka tab **Asesmen**, menilai santri Joko, dan menaikkan levelnya.
   - Di layar santri, level tilawah dan catatan evaluasi Ustadz langsung terbarui!
