# Walkthrough: Integrasi Hari Libur Nasional Otomatis (Tanggal Merah)

Fitur ini mengintegrasikan aplikasi presensi dengan API Hari Libur Nasional Indonesia agar hari libur nasional secara otomatis ditandai sebagai status `"libur"` (bukan `"alpha"`) di laporan harian dan bulanan karyawan.

---

## Perubahan yang Dilakukan

### 1. Backend API (Node.js)
* **[NEW] [holidayHelper.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/utils/holidayHelper.js)**:
  * Menghubungkan API `api-hari-libur.vercel.app`.
  * Mengimplementasikan caching *in-memory* di memori server agar tidak membebani performa request.
* **[MODIFY] [attendanceController.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/controllers/attendanceController.js)**:
  * **`getDailySummary`**: Karyawan yang tidak absen pada tanggal merah akan otomatis mendapatkan status `'libur'` alih-alih `'alpha'`.
  * **`getMonthlySummary`**: Setiap hari kerja terjadwal karyawan yang bertepatan dengan tanggal merah akan otomatis bermigrasi dari status `'alpha'` ke `'libur'`. Status libur tidak dimasukkan ke dalam penghitungan penalti/akumulasi absen alpha bulanan. Mengirim data `holiday_name` dan ringkasan jumlah `libur` bulanan.

### 2. Frontend Web HRD (Next.js)
* **[MODIFY] [monthly/page.jsx](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/web-hrd/app/dashboard/attendance/monthly/page.jsx)**:
  * Menambahkan style visual untuk status `libur` di tabel detail rekap bulanan (warna abu-abu netral).
  * Menambahkan lencana summary `Libur` di baris utama data karyawan untuk menunjukkan jumlah hari libur nasional yang dialami dalam bulan tersebut.
  * Menampilkan deskripsi nama hari libur nasional secara langsung di kolom **Keterangan** tabel detail (misal: *"Tahun Baru Masehi"*, *"Isra Mi'raj"*).
* **[MODIFY] [userService.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/web-hrd/lib/services/userService.js)**:
  * Menambahkan metode `uploadFace` yang membuat request multipart form-data berisi file foto wajah ke endpoint `PUT /api/users/:id/face`.
* **[MODIFY] [page.jsx](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/web-hrd/app/dashboard/users/page.jsx)**:
  * Menambahkan kolom "Status Wajah" pada tabel karyawan untuk mengetahui apakah karyawan sudah memiliki foto referensi wajah terdaftar (`Terdaftar` atau `Belum Terdaftar`).
  * Menambahkan tombol aksi berikon kamera (`Camera`) di setiap baris karyawan.
  * Menambahkan Dialog Modal Pendaftaran Wajah yang memiliki preview gambar, input file picker, dan tombol submit untuk mengunggah foto wajah referensi karyawan ke server.

---

## Hasil Pengujian

Kami melakukan verifikasi secara lokal menggunakan Node.js untuk memvalidasi bahwa utilitas pembaca hari libur nasional berhasil mengambil data dari API eksternal dan mencocokkannya dengan benar:

```bash
node test_holiday.js
```

**Output Log Konsol:**
```text
Testing Holiday Helper...
Checking 2026-01-01 (New Year)...
[Holiday Service] Fetching holidays from API for 2026-01...
[Holiday Service] Cached 2 holidays for 2026-01
Result for 2026-01-01: { isHoliday: true, description: 'Tahun Baru 2026 Masehi' }
Checking 2026-01-05 (Regular workday)...
Result for 2026-01-05: { isHoliday: false, description: null }
Fetching holidays map for January 2026...
Holidays in Jan 2026:
  - 2026-01-01: Tahun Baru 2026 Masehi
  - 2026-01-16: Isra Mi’raj Nabi Muhammad SAW
```

* Hasil pengujian menunjukkan API terhubung dengan lancar dan pemetaan tanggal libur berhasil dibaca serta dimasukkan ke dalam cache dengan aman.

---

# Walkthrough: Face Verification per Akun (Azure Face API)

Fitur ini mengintegrasikan verifikasi wajah biometrik (Face Recognition) menggunakan layanan Azure Face API sehingga masing-masing akun karyawan hanya bisa melakukan absen menggunakan wajah mereka sendiri yang telah didaftarkan.

---

## Perubahan yang Dilakukan

### 1. Database (PostgreSQL)
* **[MODIFY] [db.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/db.js)**:
  * Menambahkan query otomatis `ALTER TABLE users ADD COLUMN IF NOT EXISTS face_url TEXT;` saat server backend pertama kali terhubung ke database. Ini memastikan kolom penyimpanan URL wajah referensi selalu tersedia secara mandiri.

### 2. Backend API (Node.js)
* **[NEW] [storageHelper.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/utils/storageHelper.js)**:
  * Mengintegrasikan upload buffer gambar ke **Firebase Storage** dan otomatis menjadikannya publik agar bisa dibaca oleh Azure Face API. Mengembalikan public HTTPS URL.
* **[NEW] [faceHelper.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/utils/faceHelper.js)**:
  * Mengintegrasikan pemanggilan API **Azure Cognitive Services Face API**.
  * Alur: Memanggil endpoint `/detect` untuk mendapatkan `faceId` dari kedua gambar (foto referensi terdaftar vs selfie check-in/out), lalu memanggil endpoint `/verify` untuk membandingkan kecocokannya.
  * **Mode Simulasi/Bypass (Tanpa Azure Account)**: Jika key/endpoint Azure Face API dikosongkan di `.env` (atau diisi `'bypass'`), sistem secara cerdas akan mendeteksi dan mengaktifkan mode simulasi. Hasil verifikasi akan otomatis bernilai cocok (`isMatch: true`), namun file foto selfie tetap diunggah ke Firebase Storage & tercatat di database secara normal. Sangat ideal untuk kebutuhan presentasi/demo instan.
* **[MODIFY] [firebase.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/firebase.js)**:
  * Mengonfigurasi `storageBucket` secara dinamis dari `serviceAccount.project_id` agar Firebase Storage siap digunakan.
* **[MODIFY] [userRoutes.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/routes/userRoutes.js) & [userController.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/controllers/userController.js)**:
  * Menambahkan endpoint baru `PUT /api/users/:id/face` yang dilindungi oleh otentikasi HRD. Endpoint ini menerima upload gambar referensi wajah karyawan (`multer.memoryStorage()`), mengunggahnya ke Firebase Storage, dan menyimpannya ke kolom `face_url`.
* **[MODIFY] [attendanceRoutes.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/routes/attendanceRoutes.js) & [attendanceController.js](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/backend-api/controllers/attendanceController.js)**:
  * Memperbarui endpoint `/check-in` dan `/check-out` agar menerima file gambar selfie asli (`multipart/form-data`) dengan field `'selfie'`.
  * Menolak absensi jika karyawan belum mendaftarkan wajah referensi ke HRD.
  * Mengunggah selfie ke Firebase Storage, membandingkannya dengan wajah referensi menggunakan `verifyFaces`, dan menolak absensi (HTTP 403) jika persentase kecocokan di bawah threshold (isIdentical = false dan confidence < 0.55).
  * Menyimpan URL selfie publik ke Firestore log (`selfie_logs`) agar HRD dapat melihat foto absensi asli dari mana saja.

### 3. Aplikasi Mobile (Flutter)
* **[MODIFY] [attendance_service.dart](file:///c:/Kulyeah/Semester%206/Prak%20Teknologi%20Cloud%20Computing/TA_PrakTCC/mobile_karyawan/lib/data/services/attendance_service.dart)**:
  * Mengubah pemanggilan REST API `checkIn` and `checkOut` dari request JSON biasa menjadi **`http.MultipartRequest`**.
  * Mengirim file gambar fisik hasil tangkapan kamera lokal (`image.path`) sebagai field multipart `'selfie'`.
  * Menangkap pesan error dari backend jika verifikasi wajah gagal (HTTP 403) dan melontarkan `Exception` agar ditangkap UI kamera untuk menampilkan SnackBar kegagalan ke karyawan.

