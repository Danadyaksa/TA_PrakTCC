# Progress Sistem Presensi Karyawan

## Tech Stack
- **Backend**: Node.js + Express (port 5000)
- **Web HRD**: Next.js (app/dashboard)
- **Mobile Karyawan**: Flutter
- **SQL DB**: PostgreSQL (`db_presensi`)
- **NoSQL DB**: Firebase Firestore
- **Auth**: JWT
- **Face Detection**: Google ML Kit

---

## ✅ SUDAH SELESAI

### Backend (Node.js + Express)
- [x] Auth: login, register, get profile, update profile, change password
- [x] Users: CRUD + return `department_name` di login response
- [x] Departments: CRUD
- [x] Schedules: per departemen (bukan per user), Senin-Jumat, init default 08:00-16:00
- [x] Attendance: check-in, check-out, history (filter by date + timezone Jakarta)
- [x] Leave Requests: apply, approve/reject, list (filter bulan/tahun), `GET /leaves/active-today`
- [x] Locations: CRUD geofencing
- [x] Attendance Rules: GET & PUT toleransi terlambat + batas alpha
- [x] Salaries: CRUD rekap gaji

### Web HRD (Next.js)
- [x] Login page (redesign, show/hide password, spinner)
- [x] Sidebar dengan logout confirmation dialog
- [x] Dashboard
- [x] Karyawan: list, tambah, edit (nama/email/departemen), hapus
- [x] Departemen: list, tambah, edit, hapus (bersih dari HRD/Karyawan)
- [x] Jadwal: per departemen, dropdown pilih dept, edit jam per hari Senin-Jumat
- [x] Presensi: rekap dengan filter tanggal (tidak bisa pilih masa depan)
- [x] Cuti & Izin: list dengan filter bulan/tahun, approve/reject
- [x] Lokasi Kerja: CRUD + MapPicker dengan tombol "Gunakan Lokasi Sekarang"
- [x] Gaji: input dan rekap per karyawan
- [x] Pengaturan: tab Profil Akun (ganti nama + password) & tab Aturan Kehadiran
- [x] Semua `confirm()` dan `alert()` diganti Dialog + Toast component

### Mobile Flutter (Karyawan)
- [x] Login (show/hide password)
- [x] Home: pull-to-refresh, jadwal real (bukan dummy), status cuti/izin approved
- [x] Tombol absen: Check-in (tepat jam shift) → Check-out (tepat jam pulang)
- [x] Deteksi wajah ML Kit: smile >70%, mata >80%, stable 5 frame
- [x] Geofencing: cek semua lokasi (bukan hanya yang pertama)
- [x] Riwayat presensi dengan timezone WIB
- [x] Profil: info departemen (real dari API), ganti password
- [x] Cuti & Izin: list + apply
- [x] Notifikasi lokal Android: 10 menit sebelum shift, warning alpha, 5 menit setelah shift
- [x] Notifikasi tersimpan ke Firestore `notification_logs` (dengan dedup per hari)
- [x] Tab notifikasi: bell icon di home, badge unread, mark as read

### Firestore Collections (5/5 ✅)
- [x] `gps_logs` — koordinat saat check-in/out
- [x] `selfie_logs` — metadata foto selfie
- [x] `face_validations` — hasil ML Kit liveness
- [x] `mobile_error_logs` — error log mobile
- [x] `notification_logs` — riwayat notifikasi per user

### PostgreSQL Tables (8/8 ✅)
- [x] `users`
- [x] `departments`
- [x] `work_locations`
- [x] `schedules` (migrasi ke per departemen)
- [x] `attendances`
- [x] `leave_requests`
- [x] `salaries`
- [x] `attendance_rules`

---

## ❌ BELUM / PERLU DICEK

### Fungsional
- [ ] **Alpha otomatis** — karyawan yang tidak check-in melewati batas alpha belum otomatis di-set status `alpha` di DB (masih manual/belum ada cron job)
- [ ] **Ganti foto profil** — belum ada upload foto di mobile maupun web
- [ ] **Push notification via FCM** — notif sekarang hanya lokal (muncul saat app terbuka), belum bisa dikirim dari backend/HRD ke HP karyawan saat app tertutup

### Deployment (belum dilakukan)
- [ ] Backend → **Cloud Run** (butuh Dockerfile)
- [ ] Web HRD → **App Engine** (butuh `app.yaml`)
- [ ] PostgreSQL → **Cloud SQL** (migrasi dari localhost)
- [ ] Env variable production (IP backend, JWT secret, dll)

### Kecil
- [ ] Nilai `alphaMinutes` di notifikasi Flutter masih hardcoded `45` — belum diambil dari `attendance_rules` API
- [ ] Flutter: kalau karyawan tidak punya departemen, jadwal kosong (tidak ada pesan yang jelas di UI)
- [ ] Web: filter karyawan di halaman gaji masih pakai `role === 'karyawan'` — tidak catch edge case role null

---

## Endpoint Count (estimasi)
| Grup | Jumlah |
|------|--------|
| Auth | 5 |
| Users | 4 |
| Departments | 4 |
| Locations | 4 |
| Schedules | 5 |
| Attendance | 3 |
| Leaves | 4 |
| Salaries | 2 |
| Rules | 2 |
| **Total** | **~33** |

Target spec: minimal 15 ✅

---

## Kredensial Testing
- HRD login: `hrd@perusahaan.com` / (password awal)
- Karyawan test: `karyawan@test.com` / `password123`
- Backend: `http://192.168.100.173:5000` (real device) / `http://10.0.2.2:5000` (emulator)
