# Proyek Sistem Presensi Karyawan - Project Memory

## 🚀 Status Terakhir (21 Mei 2026)
Proyek telah mencapai tahap integrasi penuh antara Backend (Node.js), Web HRD (Next.js), dan Mobile Karyawan (Flutter).

## ✅ Yang Sudah Selesai

### 1. Backend (Node.js + Express + PostgreSQL + Firestore)
- **Attendance Controller**: Diupdate agar HRD bisa melihat riwayat seluruh karyawan (`getHistory`).
- **Endpoint Lengkap**: Auth, Users, Departments, Locations, Schedules, Attendance, Leaves, Salaries, dan Rules.
- **Single HRD Admin**: Logika role dipastikan hanya ada 1 admin HRD sebagai pengelola.

### 2. Web HRD (Next.js)
- **Dashboard Dinamis**: Statistik real-time (Total Karyawan, Hadir, Cuti, Terlambat).
- **Manajemen Karyawan**: CRUD Karyawan (HRD difilter/disembunyikan dari daftar).
- **Geofencing & Maps**: Pengaturan lokasi kantor menggunakan Leaflet Map Picker.
- **Manajemen Cuti**: HRD bisa Approve/Reject pengajuan.
- **Input Gaji**: Fitur input gaji manual per bulan.
- **Aturan Presensi**: Pengaturan toleransi keterlambatan dan batas Alpha.
- **Navigation**: Sidebar lengkap terintegrasi.

### 3. Mobile Karyawan (Flutter)
- **Authentication**: Login & Token storage.
- **Dashboard**: Menampilkan jadwal shift dan tombol dinamis Check-in/Out.
- **Core Attendance**: 
  - **Geofencing**: Validasi jarak HP ke koordinat kantor.
  - **Liveness Detection**: Menggunakan Google ML Kit untuk deteksi wajah asli.
- **Leave Management**: Form pengajuan cuti dan list status pengajuan.
- **History**: Rekap riwayat presensi pribadi.
- **Arsitektur MVC**: Struktur folder mobile disesuaikan menggunakan pola Model-View-Controller.
- 📖 **Panduan Standar Mobile**: Rujukan arsitektur, UI, & Database untuk agen AI disimpan di `FLUTTER_GUIDELINES.md`.

## 🛠 Tech Stack & Dependencies
- **Web**: Next.js, TailwindCSS, Lucide-React, `date-fns`.
- **Mobile**: Flutter, `provider`, `google_mlkit_face_detection`, `camera`, `geolocator`, `cloud_firestore`.
- **Database**: 
  - **Google Cloud SQL (PostgreSQL)**: Untuk menyimpan data karyawan, jadwal kerja, lokasi, absensi, target, gaji, dan rekap HRD (Relasional > 5 Tabel).
  - **Firestore (NoSQL)**: Memiliki 5 Collections (Memenuhi syarat minimal 5 tabel):
    1. `gps_logs`: Log tracking lokasi mentah.
    2. `selfie_logs`: Metadata validasi wajah (liveness score, dll).
    3. `notifications`: Pengumuman real-time dari HRD ke HP Karyawan.
    4. `device_bindings`: Pencatatan Device ID untuk mencegah Fake GPS/Multi-login.
    5. `mobile_error_logs`: Pencatatan jika aplikasi mobile mengalami crash/error.

## 📝 Catatan untuk Sesi Berikutnya (Next Steps)
1. **Testing Mobile**: Melakukan run aplikasi Flutter dan testing real-time GPS & Kamera.
2. **Refinement Gaji**: Mengubah logika gaji agar otomatis berdasarkan jumlah kehadiran (sesuai rencana user).
3. **Firestore Logs**: Memastikan metadata selfie dan GPS terkirim sempurna dari Flutter ke Firestore.
4. **Deployment (GCP Target)**: 
   - **Service 1 (Frontend)**: Deploy Web HRD (Next.js) ke **App Engine**.
   - **Service 2 (Core API)**: Deploy Core Backend (Express) ke **Cloud Run**.
   - **Service 3 (Auth/Validation API)**: Deploy terpisah untuk modul Liveness/Auth API ke **Cloud Run** (agar memenuhi syarat 3 service cloud).
   - Setup koneksi ke **Cloud SQL** dan **Cloud Storage** (untuk simpan foto selfie).

---
*Dibuat oleh Gemini CLI sebagai pengingat konteks sesi.*
