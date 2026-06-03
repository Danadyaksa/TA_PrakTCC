# 📱 PANDUAN PENGEMBANGAN MOBILE (FLUTTER)

> **⚠️ ATTENTION TO ALL AI AGENTS:**
> If you are asked to modify, add, or fix features in the Flutter application for this project, you MUST adhere to the guidelines written in this document. Do not deviate from the established MVC architecture, UI rules, or database flow.

---

## 🏗️ 1. Arsitektur Proyek (MVC + Provider)
Aplikasi ini menggunakan pola **Model-View-Controller (MVC)** dengan `Provider` sebagai alat *State Management*-nya.
Struktur folder di dalam `lib/` wajib dipertahankan seperti ini:

*   `lib/models/` ➔ Berisi kelas representasi data (JSON parsing, entities).
*   `lib/ui/views/` (atau `screens/`) ➔ Berisi antarmuka pengguna (UI/Widgets). **Tidak boleh ada logika API di sini!**
*   `lib/ui/controllers/` (atau `providers/`) ➔ Berisi *Business Logic* yang `extends ChangeNotifier`. Digunakan untuk memanggil service dan mengupdate UI via `notifyListeners()`.
*   `lib/data/services/` ➔ Berisi kelas murni untuk HTTP Request ke Backend atau koneksi langsung ke Firebase.
*   `lib/core/constants/` ➔ Berisi URL, warna, font, dan teks statis.

---

## 🎨 2. Panduan UI/UX (Menyesuaikan Web Next.js)
Agar senada dengan aplikasi Web HRD (yang menggunakan Tailwind CSS & Lucide), terapkan aturan UI berikut di Flutter:

*   **Typography (Font)**: Gunakan `GoogleFonts.instrumentSans()` atau `GoogleFonts.inter()`.
*   **Warna Tema Utama**:
    *   *Primary*: Biru (seperti `Colors.blue.shade600` atau `Color(0xFF2563EB)`)
    *   *Background Utama*: Abu-abu sangat terang (`Color(0xFFF3F4F6)`)
    *   *Card/Container*: Putih murni (`Colors.white`)
    *   *Teks Utama*: Abu-abu gelap/Hitam (`Color(0xFF111827)`)
    *   *Teks Subtitle*: Abu-abu medium (`Color(0xFF6B7280)`)
*   **Bentuk (Shapes)**:
    *   Gunakan `RoundedRectangleBorder` dengan radius **8.0 hingga 12.0** untuk Card dan Button.
    *   Hindari shadow (bayangan) yang terlalu tebal. Gunakan shadow yang tipis (blurRadius kecil, offset 1, warna hitam opacity 0.05) seperti bawaan Tailwind `shadow-sm`.
*   **Iconography**: Gunakan icon yang mirip dengan Lucide (seperti `FeatherIcons` atau bawaan `Icons` Outlined).

---

## 🗄️ 3. Alur Database & Integrasi (PENTING!)
Aplikasi ini terhubung ke **DUA** jenis database dengan jalur yang berbeda. AI wajib memperhatikan alur ini saat menambah fitur:

### A. PostgreSQL (Melalui REST API Node.js)
Digunakan untuk **Data Master & Transaksional Relasional**.
*   **Entitas Terkait:** Authentication (Login/Token), Jadwal Shift, Data Karyawan, Histori Presensi Valid, Pengajuan Cuti.
*   **Cara Akses:** Gunakan package `http` atau `dio` di dalam folder `services/`.
*   **Base URL:** Ambil dari `AppConstants.baseUrl` (contoh: `http://10.0.2.2:5000/api`).
*   **Auth:** Jangan lupa sertakan header `Authorization: Bearer <token>` dari SharedPreferences.

### B. Firestore NoSQL (Koneksi Langsung dari Flutter)
Digunakan untuk **Data Realtime, Log Mentah, dan Metadata**.
Terdapat **5 Collection** yang wajib digunakan/diisi sesuai fungsinya:
1.  `gps_logs`: Menyimpan titik lokasi *real-time* dan status `is_in_radius`.
2.  `selfie_logs`: Menyimpan metadata liveness dari ML Kit (`is_face_detected`, `liveness_score`).
3.  `mobile_error_logs`: Jika aplikasi mengalami exception (`try-catch`), kirim log error ke sini.
4.  `notifications`: Dengarkan (listen via Stream) collection ini untuk memunculkan pengumuman HRD secara realtime.
5.  `device_bindings`: Baca/Tulis IMEI atau UUID perangkat untuk mencegah manipulasi GPS ganda.
*   **Cara Akses:** Gunakan package `cloud_firestore` langsung dari fungsi di UI atau Controller.

---

## 📝 4. SOP Menambah Fitur Baru (A-Z)
Jika user meminta membuat fitur baru (Misal: Slip Gaji), AI harus melakukan langkah ini secara berurutan:

1.  **Dependencies**: Pastikan package di `pubspec.yaml` mencukupi.
2.  **Model**: Buat file `lib/models/nama_fitur_model.dart` dari respons JSON.
3.  **Service**: Buat file `lib/data/services/nama_fitur_service.dart`.
    *   Jika ini fitur master, buat fungsi HTTP GET/POST ke backend Node.js.
    *   Jika ini fitur log, buat fungsi `FirebaseFirestore.instance.collection...`.
4.  **Controller (Provider)**: Buat file `lib/ui/controllers/nama_fitur_provider.dart`.
    *   Panggil service di sini.
    *   Simpan datanya di variabel.
    *   Panggil `notifyListeners()`.
    *   *Instruksikan user untuk mendaftarkan provider ini di `main.dart`.*
5.  **View (UI)**: Buat file `lib/ui/views/nama_fitur_screen.dart`.
    *   Gunakan `Consumer<NamaFiturProvider>` atau `context.watch()`.
    *   Terapkan pedoman desain (warna dan font) dari poin 2 di atas.

---
*Document Version: 1.0 | Context for LLM / AI Coding Assistants*