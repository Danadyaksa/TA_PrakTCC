# 🔐 Kredensial Login - Mobile Karyawan

## ✅ User Sudah Dibuat di Database

### 👤 **Karyawan 1 (Untuk Testing Mobile)**
```
Email: karyawan@test.com
Password: password123
Role: karyawan
Department: IT
```

### 👤 **Karyawan 2**
```
Email: siti@test.com
Password: password123
Role: karyawan
Department: IT
```

### 👨‍💼 **HRD (Untuk Testing Web)**
```
Email: hrd@test.com
Password: password123
Role: hrd
Department: HRD
```

---

## 🔧 Konfigurasi Backend

### Base URL
- **Emulator Android**: `http://10.0.2.2:5000/api`
- **Real Device**: `http://[IP_KOMPUTER]:5000/api`

### Backend Status
✅ Backend running di `http://localhost:5000`

### Database
- **Host**: localhost
- **Port**: 5432
- **Database**: db_presensi
- **User**: postgres

---

## 📱 Cara Login di Mobile

1. Buka aplikasi Flutter
2. Masukkan kredensial:
   - Email: `karyawan@test.com`
   - Password: `password123`
3. Klik **LOGIN**

---

## 🗄️ Data Tambahan yang Sudah Dibuat

### Jadwal Shift (Karyawan 1)
- **Senin - Jumat**: 08:00 - 17:00
- **User ID**: 2 (karyawan@test.com)

### Lokasi Kantor
- **Nama**: Kantor Pusat
- **Latitude**: -6.175110
- **Longitude**: 106.827153
- **Radius**: 100 meter

---

## 🧪 Testing Login via API

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"karyawan@test.com","password":"password123"}'
```

### Expected Response
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "name": "Budi Santoso",
    "email": "karyawan@test.com",
    "role": "karyawan"
  }
}
```

---

## ⚠️ Troubleshooting

### Error: "Email atau Password salah"
**Penyebab:**
- Email atau password salah
- User belum dibuat di database

**Solusi:**
```bash
cd backend-api
node test-create-user.js
```

### Error: "Network Error" / "Connection Refused"
**Penyebab:**
- Backend tidak running
- Base URL salah

**Solusi:**
1. Pastikan backend running:
   ```bash
   cd backend-api
   npm start
   ```
2. Cek base URL di `lib/core/constants/app_constants.dart`
   - Emulator: `http://10.0.2.2:5000/api`
   - Real Device: `http://192.168.x.x:5000/api`

### Error: "Cannot connect to database"
**Penyebab:**
- PostgreSQL tidak running
- Database belum dibuat

**Solusi:**
1. Start PostgreSQL service
2. Buat database:
   ```sql
   CREATE DATABASE db_presensi;
   ```
3. Run schema:
   ```bash
   psql -U postgres -d db_presensi -f backend-api/schema.sql
   ```

---

## 📊 Daftar Semua User di Database

| ID | Name | Email | Role | Department |
|----|------|-------|------|------------|
| 1 | Super HRD | hrd@perusahaan.com | hrd | HRD |
| 2 | akmal | akmal@gmail.com | karyawan | IT |
| 3 | Admin HRD | hrd@test.com | hrd | HRD |
| 4 | Budi Santoso | karyawan@test.com | karyawan | IT |
| 5 | Siti Nurhaliza | siti@test.com | karyawan | IT |

---

*Last Updated: June 2, 2026*
*Database: db_presensi*
*Backend: http://localhost:5000*
