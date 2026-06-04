# Panduan Deploy

## Prasyarat
- Google Cloud SDK (`gcloud`) sudah diinstall dan login
- Project GCP sudah dibuat, misal `presensi-app`
- Database PostgreSQL sudah tersedia (Cloud SQL atau external)
- `gcloud config set project presensi-app`

---

## 1. Deploy Backend ke Cloud Run

### A. Set environment secrets di Secret Manager (opsional tapi recommended)
Atau cukup set via `--set-env-vars` saat deploy.

### B. Build & deploy

```bash
cd backend-api

gcloud run deploy presensi-backend \
  --source . \
  --region asia-southeast2 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "DB_USER=postgres,DB_NAME=db_presensi,DB_HOST=YOUR_DB_HOST,DB_PORT=5432,JWT_SECRET=YOUR_JWT_SECRET,NODE_ENV=production" \
  --set-secrets "DB_PASSWORD=db-password:latest"
```

> Ganti `YOUR_DB_HOST` dengan IP publik Cloud SQL atau host DB kamu.
> `DB_PASSWORD` bisa diset via Secret Manager atau langsung `--set-env-vars`.

### C. Catat URL Cloud Run
Setelah deploy selesai, GCP akan menampilkan URL seperti:
```
https://presensi-backend-xxxxxxxx-as.a.run.app
```
**Simpan URL ini** — dipakai di langkah frontend.

---

## 2. Deploy Frontend ke App Engine

### A. Update URL backend
Edit `web-hrd/app.yaml`, ganti value `NEXT_PUBLIC_API_URL`:
```yaml
env_variables:
  NEXT_PUBLIC_API_URL: "https://presensi-backend-xxxxxxxx-as.a.run.app/api"
```

### B. Build Next.js
```bash
cd web-hrd
npm install
npm run build
```

Output standalone ada di `.next/standalone/`.

### C. Deploy ke App Engine
```bash
cd web-hrd
gcloud app deploy app.yaml --project presensi-app
```

Pertama kali akan diminta memilih region, pilih `asia-southeast2` (Jakarta).

### D. Buka app
```bash
gcloud app browse
```

---

## 3. Update Flutter (mobile)

Setelah backend live, update URL di Flutter:
```dart
// mobile_karyawan/lib/core/constants/app_constants.dart
static const String baseUrl = 'https://presensi-backend-xxxxxxxx-as.a.run.app/api';
```

Lalu build APK:
```bash
cd mobile_karyawan
flutter build apk --release
```

---

## Catatan Penting

### Database
Cloud Run tidak bisa connect ke `localhost`. Opsi:
1. **Cloud SQL** — gunakan Cloud SQL Proxy atau koneksi via socket
2. **External DB** — gunakan IP publik dengan whitelist IP Cloud Run (gunakan `0.0.0.0/0` untuk development)
3. **Neon / Supabase** — PostgreSQL cloud gratis yang mudah dikonfigurasi

### CORS
Backend sudah menggunakan `cors()` middleware. Untuk production, ganti dengan origin spesifik:
```js
// backend-api/index.js
app.use(cors({
  origin: ['https://YOUR_APP_ENGINE_URL.appspot.com'],
}));
```

### Firebase
Pastikan `firebase-config.json` berisi service account yang valid.
Untuk Cloud Run, bisa juga gunakan Workload Identity Federation daripada file JSON.
