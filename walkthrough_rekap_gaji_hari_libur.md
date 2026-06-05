# Walkthrough - Perbaikan & Pengembangan Fitur Rekap Gaji & Hari Libur Khusus

Dokumen ini mendokumentasikan pembenahan besar pada halaman **Rekap Gaji**, **Departemen**, serta penambahan fitur baru **Kelola Hari Libur Khusus oleh HRD** di halaman Pengaturan.

---

## 1. Batas Tanggal Pembuatan Akun & Perbaikan Bug Kehadiran

* **Batas Pembuatan Akun (Bug A):** Karyawan baru tidak lagi ditandai sebagai `ALPHA` atau `LIBUR` pada tanggal sebelum akun mereka dibuat (diambil dari kolom `created_at` di database). Tanggal sebelum aktif ini akan berstatus `—` (tidak aktif) dan tidak dihitung ke dalam jumlah hari kerja. Karyawan baru juga disaring agar tidak muncul di laporan kehadiran harian masa lampau.
* **Perbaikan Timezone Leksikografis (Bug B):** Memperbaiki isu status absensi yang menggantung di status `BELUM` padahal tanggalnya sudah lewat. Logika perbandingan dialihkan menggunakan string tanggal berzona waktu Jakarta (`Asia/Jakarta`) secara leksikografis sehingga status otomatis berubah menjadi `ALPHA` tepat waktu secara akurat.
* **Perbaikan Tampilan Izin (Bug C):** Memperbaiki bug `Invalid Date` yang disebabkan oleh bentrok tipe data objek `Date` PostgreSQL di Node.js saat digabungkan dengan string waktu. Data pengajuan kini dikonversi terlebih dahulu ke string `YYYY-MM-DD` sehingga status **IZIN** dari tanggal 26–27 Juni (dan tanggal lainnya) kini muncul dengan benar di rekap bulanan.

---

## 2. Integrasi Gaji Pokok per Departemen

* **Database:** Menambahkan kolom `basic_salary` pada tabel `departments` secara otomatis.
* **Manajemen Departemen:** Menambahkan kolom input **Gaji Pokok Standar** saat menambah/mengedit departemen di tab **Departemen**, yang kemudian menjadi acuan gaji dasar otomatis karyawan di divisi tersebut.

---

## 3. Otomatisasi & Desain Ulang Rekap Gaji

* **Penyajian Data Otomatis:** HRD tidak perlu lagi menginput rekap gaji satu per satu secara manual. Semua karyawan yang aktif otomatis terdaftar langsung di tabel rekap berdasarkan filter **Bulan**, **Tahun**, dan **Departemen** (atau Semua Departemen).
* **Inline Edit & Perhitungan Dinamis:** HRD cukup mengetik nominal **Tunjangan** dan **Potongan** di baris karyawan. Nilai **Total Bersih** akan otomatis terkalkulasi di frontend secara dinamis (`Gaji Pokok + Tunjangan - Potongan`).
* **Penyimpanan Instan (Upsert):** Menyediakan tombol **Simpan** per baris karyawan. Jika sudah tersimpan, statusnya berubah menjadi **Saved** (centang hijau) dan data akan diperbarui ke database menggunakan logika *upsert* (update jika ada, insert jika baru).
* **Rekap Kehadiran Real-time:** Menampilkan badge jumlah `Hadir`, `Terlambat`, `Alpha`, dan `Izin` di setiap baris karyawan untuk mempermudah HRD menghitung bonus/potongan.
* **Perbaikan Loading Stuck:** Mengatasi bug *infinite loop* pada halaman gaji dengan melepas referensi toast dari dependensi pemanggilan API.

---

## 4. Manajemen Hari Libur Khusus oleh HRD

* **Penyimpanan Database:** Menambahkan tabel database baru `holidays` secara otomatis untuk menyimpan hari libur khusus buatan HRD.
* **Penggabungan Hari Libur:** Logika kehadiran backend menggabungkan Hari Libur Nasional otomatis (dari API publik) dengan Hari Libur Khusus (dari database PostgreSQL). Input manual HRD memiliki prioritas *override* jika ada tanggal yang bentrok.
* **Antarmuka di Tab Pengaturan:** Menambahkan tabel "Hari Libur Khusus" di tab **Pengaturan > Aturan Kehadiran**, lengkap dengan dialog popup modal untuk menambah, mengedit, dan menghapus hari libur khusus secara langsung.

---

## Berkas yang Dimodifikasi

### Backend API
- **[db.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/backend-api/db.js)**: query migrasi kolom `basic_salary` dan tabel `holidays`.
- **[index.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/backend-api/index.js)**: Meregistrasikan rute `/api/holidays`.
- **[holidayHelper.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/backend-api/utils/holidayHelper.js)**: Logika penggabungan hari libur DB dan API publik.
- **[holidayController.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/backend-api/controllers/holidayController.js) [NEW]**: Kontroler CRUD database hari libur.
- **[holidayRoutes.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/backend-api/routes/holidayRoutes.js) [NEW]**: Rute API hari libur khusus.
- **[departmentController.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/backend-api/controllers/departmentController.js)**: parsing dan penyimpanan `basic_salary` saat CRUD departemen.
- **[salaryController.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/backend-api/controllers/salaryController.js)**: logika retrieval rekap gaji + absensi karyawan terfilter, serta logika upsert.

### Frontend Web HRD
- **[holidayService.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/web-hrd/lib/services/holidayService.js) [NEW]**: Panggilan API hari libur khusus.
- **[settings/page.jsx](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/web-hrd/app/dashboard/settings/page.jsx)**: UI dialog popup dan tabel kelola hari libur khusus.
- **[departments/page.jsx](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/web-hrd/app/dashboard/departments/page.jsx)**: UI input dan kolom Gaji Pokok Standar departemen.
- **[salaryService.js](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/web-hrd/lib/services/salaryService.js)**: parsing filter parameters.
- **[salaries/page.jsx](file:///d:/IF23/SMT%206/Prak%20TCC/TA_TCC/web-hrd/app/dashboard/salaries/page.jsx)**: UI rekap gaji interaktif dan terintegrasi.
