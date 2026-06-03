# 📱 Mobile Karyawan - Sistem Presensi

Aplikasi mobile Flutter untuk karyawan melakukan presensi dengan **Selfie + Liveness Detection** dan **Geofencing**.

---

## ✨ Fitur Utama

### 🎯 Core Features
- ✅ **Login & Authentication** (JWT Token)
- ✅ **Check-in/Check-out** dengan validasi:
  - 📸 Selfie + Liveness Detection (Google ML Kit)
  - 📍 Geofencing (validasi lokasi dalam radius kantor)
- ✅ **Jadwal Shift** dinamis dari backend
- ✅ **Riwayat Presensi** pribadi
- ✅ **Pengajuan Cuti/Izin/Sakit**
- ✅ **Notifikasi Real-time** dari HRD (Firestore)
- ✅ **Profile Management**

### 🔥 Firebase Integration
- **5 Firestore Collections:**
  1. `gps_logs` - Log lokasi GPS
  2. `selfie_logs` - Metadata foto selfie
  3. `face_validations` - Hasil validasi wajah ML Kit
  4. `mobile_error_logs` - Log error aplikasi
  5. `notification_logs` - Notifikasi real-time

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Flutter 3.11+ |
| Language | Dart |
| State Management | Provider |
| Backend API | Node.js + Express (REST) |
| SQL Database | PostgreSQL (Cloud SQL) |
| NoSQL Database | Firebase Firestore |
| Face Detection | Google ML Kit |
| Geolocation | Geolocator |
| Camera | Camera Plugin |

---

## 📂 Project Structure

```
lib/
├── core/
│   └── constants/
│       ├── app_colors.dart          # Warna tema aplikasi
│       └── app_constants.dart       # Base URL & constants
├── data/
│   ├── models/
│   │   ├── user_model.dart
│   │   ├── attendance_model.dart
│   │   ├── leave_model.dart
│   │   ├── schedule_model.dart      # ✨ NEW
│   │   └── work_location_model.dart # ✨ NEW
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── attendance_service.dart
│   │   ├── leave_service.dart
│   │   ├── schedule_service.dart    # ✨ NEW
│   │   ├── location_service.dart    # ✨ ENHANCED
│   │   └── firestore_service.dart   # ✨ NEW
│   └── providers/
│       ├── auth_provider.dart
│       ├── attendance_provider.dart
│       ├── leave_provider.dart
│       ├── schedule_provider.dart   # ✨ NEW
│       └── notification_provider.dart # ✨ NEW
└── ui/
    └── screens/
        ├── login_screen.dart
        ├── home_screen.dart
        ├── attendance_camera_screen.dart
        ├── history_screen.dart
        ├── leave_screen.dart
        ├── apply_leave_screen.dart
        └── profile_screen.dart
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Flutter SDK 3.11 atau lebih baru
- Android Studio / VS Code
- Firebase Project (`presensi-tcc`)
- Backend API running

### 2. Clone & Install Dependencies
```bash
cd mobile_karyawan
flutter pub get
```

### 3. Firebase Configuration
Pastikan file `android/app/google-services.json` sudah ada dan valid.

Jika belum:
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project `presensi-tcc`
3. Download `google-services.json`
4. Letakkan di `android/app/`

### 4. Backend Configuration
Edit `lib/core/constants/app_constants.dart`:

```dart
class AppConstants {
  // Untuk Emulator
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  
  // Untuk Real Device (ganti dengan IP komputer kamu)
  // static const String baseUrl = 'http://192.168.1.100:5000/api';
}
```

### 5. Run Application
```bash
flutter run
```

---

## 🔐 Login Credentials (Testing)

### Karyawan
- **Email:** `karyawan@test.com`
- **Password:** `password123`

### HRD (untuk Web)
- **Email:** `hrd@test.com`
- **Password:** `password123`

> **Note:** User sudah dibuat di database. Jika login gagal, jalankan:
> ```bash
> cd backend-api
> node test-create-user.js
> ```

---

## 📸 Cara Kerja Presensi

### Check-in Flow:
1. Karyawan klik tombol **CHECK IN** di home screen
2. Kamera terbuka (front camera)
3. **Liveness Detection** berjalan:
   - Deteksi wajah dengan ML Kit
   - Hitung liveness score (85-100%)
   - Validasi senyum & mata terbuka
4. **Geofencing Validation**:
   - Ambil lokasi GPS karyawan
   - Fetch lokasi kantor dari backend
   - Validasi jarak dalam radius
5. **Submit ke Backend**:
   - Kirim data presensi ke PostgreSQL
   - Log metadata ke Firestore (3 collections)
6. **Success** ✅

### Check-out Flow:
- Sama seperti check-in, tapi tanpa selfie (langsung submit)

---

## 🗄️ Database Integration

### PostgreSQL (via REST API)
- `users` - Data karyawan
- `schedules` - Jadwal shift
- `work_locations` - Lokasi kantor
- `attendances` - Rekap presensi
- `leave_requests` - Pengajuan cuti

### Firestore (NoSQL)
- `gps_logs` - Log koordinat GPS
- `selfie_logs` - Metadata foto
- `face_validations` - Hasil ML Kit
- `mobile_error_logs` - Error logs
- `notification_logs` - Notifikasi real-time

---

## 🎨 UI/UX Guidelines

Sesuai dengan `FLUTTER_GUIDELINES.md`:

### Colors
- **Primary:** `#2563EB` (Blue)
- **Background:** `#F3F4F6` (Light Gray)
- **Card:** `#FFFFFF` (White)
- **Text Primary:** `#111827` (Dark Gray)
- **Text Secondary:** `#6B7280` (Medium Gray)

### Typography
- **Font:** Instrument Sans (fallback: System Default)
- **Sizes:** 24px (Title), 14px (Body), 11px (Caption)

### Shapes
- **Border Radius:** 8-12px
- **Shadow:** Minimal (blurRadius: 4-10, opacity: 0.05-0.1)

---

## 🔧 Troubleshooting

### Firebase Error
```
Error: google-services.json not found
```
**Solution:** Download dari Firebase Console dan letakkan di `android/app/`

### Location Permission Denied
```
Error: Location permissions are denied
```
**Solution:** 
1. Buka Settings > Apps > PresensiApp > Permissions
2. Enable Location permission

### Backend Connection Failed
```
Error: Failed to connect to /10.0.2.2:5000
```
**Solution:**
- Pastikan backend running di `http://localhost:5000`
- Untuk real device, ganti IP di `app_constants.dart`

### Camera Not Working
```
Error: No camera available
```
**Solution:**
- Pastikan permission camera sudah diizinkan
- Restart aplikasi

---

## 📝 API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Login karyawan |
| `/auth/profile` | GET | Get user profile |
| `/schedules/my` | GET | Get jadwal shift |
| `/locations` | GET | Get lokasi kantor |
| `/attendance/check-in` | POST | Submit check-in |
| `/attendance/check-out` | POST | Submit check-out |
| `/attendance/history` | GET | Get riwayat presensi |
| `/leaves` | GET | Get list cuti |
| `/leaves` | POST | Submit pengajuan cuti |

---

## 🎯 Ketentuan TCC - Checklist

- ✅ **3 Services:** Web (App Engine), Backend (Cloud Run), Mobile (APK)
- ✅ **8 Tabel SQL:** users, departments, work_locations, schedules, attendances, leave_requests, salaries, attendance_rules
- ✅ **5 Collections NoSQL:** gps_logs, selfie_logs, face_validations, mobile_error_logs, notification_logs
- ✅ **37 Endpoints:** Auth (4), Users (5), Departments (4), Locations (4), Schedules (4), Attendance (5), Leaves (4), Salaries (5), Rules (2)
- ✅ **Liveness Detection:** Google ML Kit Face Detection
- ✅ **Geofencing:** Dynamic dari API dengan radius configurable

---

## 📚 Documentation

- **Flutter Guidelines:** `FLUTTER_GUIDELINES.md`
- **Changelog:** `CHANGELOG.md`
- **Project Spec:** `../system_presensi_final_spec (1).html`
- **Backend Schema:** `../backend-api/schema.sql`

---

## 👨‍💻 Development

### Run in Debug Mode
```bash
flutter run --debug
```

### Build APK
```bash
flutter build apk --release
```

### Check for Issues
```bash
flutter doctor
flutter analyze
```

---

## 📞 Support

Jika ada masalah atau pertanyaan, cek:
1. `CHANGELOG.md` untuk update terbaru
2. `FLUTTER_GUIDELINES.md` untuk aturan development
3. Backend logs di terminal

---

*Built with ❤️ using Flutter*
*Version: 1.0.0*
*Last Updated: June 2, 2026*
