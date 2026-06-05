# Hasil Pengujian API REST Client (43 Skenario Lengkap)

Dokumen ini berisi log request dan response asli dari hasil eksekusi 43 endpoint API pada backend yang dideploy di Cloud Run.

---

### 1. Register HRD
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/auth/register

{
  "name": "Super HRD",
  "email": "hrd@perusahaan.com",
  "password": "password123",
  "role": "hrd"
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 116
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:52 GMT
etag: W/"74-KE2mTS8i0g+LAoFIS65zVNyM1qk"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: b57dcea37b6060b6421513a1726e2b8a;o=1
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 2313ms

{
  "message": "User berhasil didaftarkan",
  "user": {
    "id": 6,
    "name": "Super HRD",
    "email": "hrd@perusahaan.com",
    "role": "hrd"
  }
}
```

---

### 2. Register Karyawan
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/auth/register

{
  "name": "Budi Karyawan",
  "email": "budi@perusahaan.com",
  "password": "password123",
  "role": "karyawan",
  "department_id": 1
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 126
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:53 GMT
etag: W/"7e-Gf7j5pJ5L0lLSskblKiSdndgSMo"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: ff56f56940b8c1fa36665398cc3708af
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 1157ms

{
  "message": "User berhasil didaftarkan",
  "user": {
    "id": 7,
    "name": "Budi Karyawan",
    "email": "budi@perusahaan.com",
    "role": "karyawan"
  }
}
```

---

### 3. Login HRD (copy token dari response ke @authToken di atas)
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/auth/login

{
  "email": "hrd@perusahaan.com",
  "password": "password123"
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 294
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:54 GMT
etag: W/"126-K94HNwcxP08yGjl+CJqqyA2aBJo"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: ba1b57ebc62608f9421513a1726e210e
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 563ms

{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU",
  "user": {
    "id": 6,
    "name": "Super HRD",
    "email": "hrd@perusahaan.com",
    "role": "hrd",
    "department_name": null
  }
}
```

---

### 4. Login dengan password salah (skenario negatif)
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/auth/login

{
  "email": "hrd@perusahaan.com",
  "password": "wrongpassword"
}

#### Response:
```http
HTTP/1.1 400 Bad Request
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 39
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:54 GMT
etag: W/"27-ITyfUYfdQp5oNZzvJT251oKvaLU"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: c22877c27bf796a636665398cc3702f3
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 377ms

{
  "message": "Email atau Password salah"
}
```

---

### 5. Get Profile
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 92
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:54 GMT
etag: W/"5c-x8qvmstJFj1jNNevTJVjXVQKEmc"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: a37f2b419b2974b7421513a1726e2da0
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 377ms

{
  "id": 6,
  "name": "Super HRD",
  "email": "hrd@perusahaan.com",
  "role": "hrd",
  "department_name": null
}
```

---

### 6. Update Profile
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "name": "Super HRD Updated"
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 77
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:55 GMT
etag: W/"4d-OU/fSVczlWZuwi1Fpq1sE08/Vc8"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: ed4ba835422a973436665398cc370268
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 273ms

{
  "id": 6,
  "name": "Super HRD Updated",
  "email": "hrd@perusahaan.com",
  "role": "hrd"
}
```

---

### 7. Change Password
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "current_password": "password123",
  "new_password": "newpassword123"
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 38
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:56 GMT
etag: W/"26-4fnZ0jLTDjc5vfDv2Tn4w6rMBTM"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: d22bc1733284677a421513a1726e27f5
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 828ms

{
  "message": "Password berhasil diubah"
}
```

---

### 8. Get All Departments
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/departments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 554
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:57 GMT
etag: W/"22a-LomH8lKH8D1BEn5SI94mpxXIWeg"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: aa7b9929a68af4f77a10430ef1a82cf4
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 323ms

[
  {
    "id": 2,
    "name": "HRD",
    "description": "Human Resource Department",
    "created_at": "2026-06-04T15:46:59.131Z"
  },
  {
    "id": 4,
    "name": "IT",
    "description": "Divisi Teknologi Informasi",
    "created_at": "2026-06-04T16:21:14.756Z"
  },
  {
    "id": 5,
    "name": "IT",
    "description": "Divisi Teknologi dan Infrastruktur",
    "created_at": "2026-06-04T16:51:43.666Z"
  },
  {
    "id": 3,
    "name": "IT Support",
    "description": "Divisi teknologi dan infrastruktur",
    "created_at": "2026-06-04T16:07:29.649Z"
  },
  {
    "id": 1,
    "name": "IT Updated",
    "description": "Divisi IT dan Infrastruktur",
    "created_at": "2026-06-04T15:46:59.131Z"
  }
]
```

---

### 9. Create Department
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/departments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "name": "IT Temp",
  "description": "Divisi Teknologi dan Infrastruktur"
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 116
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:57 GMT
etag: W/"74-kmlf4INWaOKvTcfE7+Sv8KBT80M"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 9fc58ee2d7127dec4e2160f6c358127e
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 321ms

{
  "id": 6,
  "name": "IT Temp",
  "description": "Divisi Teknologi dan Infrastruktur",
  "created_at": "2026-06-04T16:52:57.316Z"
}
```

---

### 10. Update Department
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/departments/6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "name": "IT Department Temp",
  "description": "Divisi Teknologi"
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 109
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:57 GMT
etag: W/"6d-Mqu1lDsxU5+1caRpNclnBmHAoNE"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 44d8e3d9076a4df77a10430ef1a82f40
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 629ms

{
  "id": 6,
  "name": "IT Department Temp",
  "description": "Divisi Teknologi",
  "created_at": "2026-06-04T16:52:57.316Z"
}
```

---

### 11. Delete Department
DELETE https://presensi-backend-820401822458.asia-southeast2.run.app/api/departments/6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 32
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:58 GMT
etag: W/"20-ELFNNhcDRULJs3FsoMaPNdRAHdI"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 6fe47d626b75e1f94e2160f6c3581a79
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 356ms

{
  "message": "Department deleted"
}
```

---

### 12. Get All Locations
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/locations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 144
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:58 GMT
etag: W/"90-Gst2N9N0OofGJNPnXjGilHLaF8g"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: e6a2db3384827aff7a10430ef1a82f57
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 528ms

[
  {
    "id": 1,
    "name": "Kantor Pusat",
    "latitude": "-6.17511000",
    "longitude": "106.82715300",
    "radius_meters": 100,
    "created_at": "2026-06-04T15:50:12.133Z"
  }
]
```

---

### 13. Create Location
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/locations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "name": "Kantor Pusat Temp",
  "latitude": -7.7956,
  "longitude": 110.3695,
  "radius_meters": 100
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 147
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:59 GMT
etag: W/"93-6jHdiN5268GGEh6yadTqha0IWoo"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: ff8b5322e3445add4e2160f6c3581f1c
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 647ms

{
  "id": 2,
  "name": "Kantor Pusat Temp",
  "latitude": "-7.79560000",
  "longitude": "110.36950000",
  "radius_meters": 100,
  "created_at": "2026-06-04T16:52:59.152Z"
}
```

---

### 14. Update Location
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/locations/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "name": "Kantor Pusat Yogyakarta Temp",
  "latitude": -7.7956,
  "longitude": 110.3695,
  "radius_meters": 150
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 158
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:52:59 GMT
etag: W/"9e-/55zfn70TAYDv8bHbChRj8YdwJ0"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: e6752b37b34935817a10430ef1a828a8
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 598ms

{
  "id": 2,
  "name": "Kantor Pusat Yogyakarta Temp",
  "latitude": "-7.79560000",
  "longitude": "110.36950000",
  "radius_meters": 150,
  "created_at": "2026-06-04T16:52:59.152Z"
}
```

---

### 15. Delete Location
DELETE https://presensi-backend-820401822458.asia-southeast2.run.app/api/locations/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 30
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:00 GMT
etag: W/"1e-2bN0f3QTUBUMx8fIJjQmi+VOyQA"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: a5254f17315a0aa64e2160f6c3581a64
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 352ms

{
  "message": "Location deleted"
}
```

---

### 16. Get All Users
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 482
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:00 GMT
etag: W/"1e2-a6zWasVcj+ySZsbXRgwIshPYU4U"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: ee8b345b05d5abd07a10430ef1a828c7
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 578ms

[
  {
    "id": 1,
    "name": "Admin HRD",
    "email": "hrd@test.com",
    "role": "hrd",
    "department_id": 2,
    "department_name": "HRD"
  },
  {
    "id": 7,
    "name": "Budi Karyawan",
    "email": "budi@perusahaan.com",
    "role": "karyawan",
    "department_id": 1,
    "department_name": "IT Updated"
  },
  {
    "id": 3,
    "name": "Siti Nurhaliza",
    "email": "siti@test.com",
    "role": "karyawan",
    "department_id": 1,
    "department_name": "IT Updated"
  },
  {
    "id": 6,
    "name": "Super HRD Updated",
    "email": "hrd@perusahaan.com",
    "role": "hrd",
    "department_id": null,
    "department_name": null
  }
]
```

---

### 17. Create User
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "name": "Andi Karyawan",
  "email": "andi@perusahaan.com",
  "password": "password123",
  "role": "karyawan",
  "department_id": 1
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 79
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:01 GMT
etag: W/"4f-hmnzD3vCfne7jHQZtI6IaWE+LzM"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 787cc9169035fdc84e2160f6c3581815;o=1
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 623ms

{
  "id": 8,
  "name": "Andi Karyawan",
  "email": "andi@perusahaan.com",
  "role": "karyawan"
}
```

---

### 18. Update User
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/users/8
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "name": "Andi Karyawan Updated",
  "email": "andi@perusahaan.com",
  "department_id": 1
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 105
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:02 GMT
etag: W/"69-FnJWPD8yjZFFUVjDxwaExOQ/Vh8"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: d6532c4e979e9c4b7a10430ef1a8255b
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 443ms

{
  "id": 8,
  "name": "Andi Karyawan Updated",
  "email": "andi@perusahaan.com",
  "role": "karyawan",
  "department_id": 1
}
```

---

### 19. Delete User
DELETE https://presensi-backend-820401822458.asia-southeast2.run.app/api/users/8
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 26
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:02 GMT
etag: W/"1a-+BFCXZBji7vrbkrwyE5s2YKViik"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 78da4875825148864e2160f6c35819e8
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 322ms

{
  "message": "User deleted"
}
```

---

### 20. Get All Schedules
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/schedules
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 2
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:02 GMT
etag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: bf2b2d773baa8a4f7a10430ef1a82395
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 538ms

[]
```

---

### 21. Get My Schedules
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/schedules/my
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 2
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:03 GMT
etag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: f1675a248dbc09cd7a10430ef1a825b9
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 671ms

[]
```

---

### 22. Init Department Schedule (Senin-Jumat 08:00-16:00)
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/schedules/init-department
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "department_id": 1
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 887
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:05 GMT
etag: W/"377-KHc+LAj3uuOL+DBdPZp62NA3HTA"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 4ad22edd2dc199db4e2160f6c3581b46
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 1887ms

[
  {
    "id": 6,
    "user_id": null,
    "day_of_week": 1,
    "shift_start": "08:00:00",
    "shift_end": "16:00:00",
    "created_at": "2026-06-04T16:53:04.537Z",
    "department_id": 1,
    "department_name": "IT Updated"
  },
  {
    "id": 7,
    "user_id": null,
    "day_of_week": 2,
    "shift_start": "08:00:00",
    "shift_end": "16:00:00",
    "created_at": "2026-06-04T16:53:04.766Z",
    "department_id": 1,
    "department_name": "IT Updated"
  },
  {
    "id": 8,
    "user_id": null,
    "day_of_week": 3,
    "shift_start": "08:00:00",
    "shift_end": "16:00:00",
    "created_at": "2026-06-04T16:53:04.994Z",
    "department_id": 1,
    "department_name": "IT Updated"
  },
  {
    "id": 9,
    "user_id": null,
    "day_of_week": 4,
    "shift_start": "08:00:00",
    "shift_end": "16:00:00",
    "created_at": "2026-06-04T16:53:05.222Z",
    "department_id": 1,
    "department_name": "IT Updated"
  },
  {
    "id": 10,
    "user_id": null,
    "day_of_week": 5,
    "shift_start": "08:00:00",
    "shift_end": "16:00:00",
    "created_at": "2026-06-04T16:53:05.450Z",
    "department_id": 1,
    "department_name": "IT Updated"
  }
]
```

---

### 23. Update Schedule
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/schedules/6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "shift_start": "09:00:00",
  "shift_end": "17:00:00"
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 145
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:06 GMT
etag: W/"91-wf9ivbsKDOf6wJlt7C5QGgIJGGo"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: e8ddce63617f4a7d3d42e5789938c117
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 298ms

{
  "id": 6,
  "user_id": null,
  "day_of_week": 1,
  "shift_start": "09:00:00",
  "shift_end": "17:00:00",
  "created_at": "2026-06-04T16:53:04.537Z",
  "department_id": 1
}
```

---

### 24. Delete Department Schedule
DELETE https://presensi-backend-820401822458.asia-southeast2.run.app/api/schedules/department/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 39
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:06 GMT
etag: W/"27-opwgC7PCpMxkITVuWgoYtSjeFjU"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 2612c692beda54a73294040ae329ae31
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 341ms

{
  "message": "Jadwal departemen dihapus"
}
```

---

### 25. Delete Single Schedule
DELETE https://presensi-backend-820401822458.asia-southeast2.run.app/api/schedules/6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 30
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:06 GMT
etag: W/"1e-dowLe8GxBoVf+GE+36aT2s8ZRx8"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: c86ecd5bbae1a06e3d42e5789938c42e
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 295ms

{
  "message": "Schedule deleted"
}
```

---

### 26. Get Rules
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/rules
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 97
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:09 GMT
etag: W/"61-h1jc083Jwygu8sllZzCrZN1QJEM"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: ea50c79590304ece3d42e5789938cd94
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 751ms

{
  "id": 1,
  "tolerance_minutes": 10,
  "absent_after_minutes": 45,
  "updated_at": "2026-06-04T16:40:43.213Z"
}
```

---

### 27. Update Rules
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/rules
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "tolerance_minutes": 15,
  "absent_after_minutes": 60
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 97
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:10 GMT
etag: W/"61-POvtj17p8LZ2EvWL77IVtAMHp20"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 57bf3d1ce03a152d3294040ae329a61b
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 730ms

{
  "id": 1,
  "tolerance_minutes": 15,
  "absent_after_minutes": 60,
  "updated_at": "2026-06-04T16:53:10.822Z"
}
```

---

### 28. Check-in (dalam radius, wajah terdeteksi)
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/attendance/check-in
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

{
  "schedule_id": 14,
  "latitude": -7.7956,
  "longitude": 110.3695,
  "selfie_url": "https://storage.example.com/selfie-checkin.jpg",
  "liveness_score": 0.95
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 166
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:12 GMT
etag: W/"a6-uoEhfaDMlcc0lplDRMmUL/YCskE"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 131bef62199502023d42e5789938c4d3;o=1
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 1154ms

{
  "id": 1,
  "user_id": 7,
  "schedule_id": 14,
  "check_in": "2026-06-04T16:53:11.785Z",
  "check_out": null,
  "status": "hadir",
  "late_minutes": 0,
  "created_at": "2026-06-04T16:53:11.785Z"
}
```

---

### 29. Check-in setelah melewati batas alpha (skenario negatif - 403)
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/attendance/check-in
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

{
  "schedule_id": 13,
  "latitude": -7.7956,
  "longitude": 110.3695,
  "selfie_url": "https://storage.example.com/selfie.jpg",
  "liveness_score": 0.91
}

#### Response:
```http
HTTP/1.1 403 Forbidden
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 115
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:12 GMT
etag: W/"73-6cnkxmp9Gldsa/KWDydtDjMZ8P0"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: d5f8b746f8c920594ea769877301e5b9
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 1002ms

{
  "message": "Check-in ditolak. Anda terlambat 533 menit, melewati batas maksimal 60 menit. Status hari ini: Alpha."
}
```

---

### 30. Check-out
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/attendance/check-out
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

{
  "attendance_id": 1,
  "latitude": -7.7956,
  "longitude": 110.3695,
  "selfie_url": "https://storage.example.com/selfie-checkout.jpg",
  "liveness_score": 0.92
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 188
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:13 GMT
etag: W/"bc-fylbaBr0D3v2PxRsmmSaFeVUcQM"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 767733f633b9537f3d42e5789938cc91
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 548ms

{
  "id": 1,
  "user_id": 7,
  "schedule_id": 14,
  "check_in": "2026-06-04T16:53:11.785Z",
  "check_out": "2026-06-04T16:53:13.479Z",
  "status": "hadir",
  "late_minutes": 0,
  "created_at": "2026-06-04T16:53:11.785Z"
}
```

---

### 31. Get Attendance History
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/attendance/history
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 266
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:14 GMT
etag: W/"10a-X7f7qnVZcOvc2OtlQECHUxKNFTk"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 2b62180b95b130364ea769877301e2aa
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 361ms

[
  {
    "id": 1,
    "user_id": 7,
    "schedule_id": 14,
    "check_in": "2026-06-04T16:53:11.785Z",
    "check_out": "2026-06-04T16:53:13.479Z",
    "status": "hadir",
    "late_minutes": 0,
    "created_at": "2026-06-04T16:53:11.785Z",
    "user_name": "Budi Karyawan",
    "shift_start": "23:48:00",
    "shift_end": "17:00:00"
  }
]
```

---

### 32. Get Attendance History by Date
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/attendance/history?date=2026-06-04
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 266
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:14 GMT
etag: W/"10a-X7f7qnVZcOvc2OtlQECHUxKNFTk"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 37bbadd523a7c2935d6cd0d5eaf37123
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 749ms

[
  {
    "id": 1,
    "user_id": 7,
    "schedule_id": 14,
    "check_in": "2026-06-04T16:53:11.785Z",
    "check_out": "2026-06-04T16:53:13.479Z",
    "status": "hadir",
    "late_minutes": 0,
    "created_at": "2026-06-04T16:53:11.785Z",
    "user_name": "Budi Karyawan",
    "shift_start": "23:48:00",
    "shift_end": "17:00:00"
  }
]
```

---

### 33. Get Daily Summary (HRD)
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/attendance/daily-summary?date=2026-06-04
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 615
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:15 GMT
etag: W/"267-DG8GGSF599hMGhYWqZj83aF79NI"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: d8bc7e13f9de872b4ea769877301e585
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 841ms

{
  "date": "2026-06-03",
  "day_of_week": 3,
  "tolerance_minutes": 15,
  "absent_after_minutes": 60,
  "total": 2,
  "summary": [
    {
      "user_id": 7,
      "user_name": "Budi Karyawan",
      "email": "budi@perusahaan.com",
      "department_name": "IT Updated",
      "schedule_id": 13,
      "shift_start": "08:00:00",
      "shift_end": "16:00:00",
      "attendance_id": null,
      "check_in": null,
      "check_out": null,
      "status": "alpha",
      "late_minutes": 0
    },
    {
      "user_id": 3,
      "user_name": "Siti Nurhaliza",
      "email": "siti@test.com",
      "department_name": "IT Updated",
      "schedule_id": 13,
      "shift_start": "08:00:00",
      "shift_end": "16:00:00",
      "attendance_id": null,
      "check_in": null,
      "check_out": null,
      "status": "alpha",
      "late_minutes": 0
    }
  ]
}
```

---

### 34. Get Monthly Summary (HRD)
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/attendance/monthly-summary?month=6&year=2026
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 7400
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:17 GMT
etag: W/"1ce8-VkZvy1miGDoxyNF53v8nDgWhm7c"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 6053d70939c380675d6cd0d5eaf378d8
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 1952ms

{
  "month": 6,
  "year": 2026,
  "tolerance_minutes": 15,
  "absent_after_minutes": 60,
  "employees": [
    {
      "user_id": 7,
      "user_name": "Budi Karyawan",
      "email": "budi@perusahaan.com",
      "department_name": "IT Updated",
      "month": 6,
      "year": 2026,
      "summary": {
        "hadir": 1,
        "terlambat": 0,
        "alpha": 3,
        "izin_sakit": 0,
        "total_work_days": 22
      },
      "days": [
        {
          "date": "2026-06-01",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "alpha",
          "late_minutes": 0
        },
        {
          "date": "2026-06-02",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "alpha",
          "late_minutes": 0
        },
        {
          "date": "2026-06-03",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "alpha",
          "late_minutes": 0
        },
        {
          "date": "2026-06-04",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": "2026-06-04T16:53:11.785Z",
          "check_out": "2026-06-04T16:53:13.479Z",
          "status": "hadir",
          "late_minutes": 0
        },
        {
          "date": "2026-06-05",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-08",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-09",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-10",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-11",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-12",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-15",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-16",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-17",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-18",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-19",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-22",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-23",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-24",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-25",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-26",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-29",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-30",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        }
      ]
    },
    {
      "user_id": 3,
      "user_name": "Siti Nurhaliza",
      "email": "siti@test.com",
      "department_name": "IT Updated",
      "month": 6,
      "year": 2026,
      "summary": {
        "hadir": 0,
        "terlambat": 0,
        "alpha": 3,
        "izin_sakit": 0,
        "total_work_days": 22
      },
      "days": [
        {
          "date": "2026-06-01",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "alpha",
          "late_minutes": 0
        },
        {
          "date": "2026-06-02",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "alpha",
          "late_minutes": 0
        },
        {
          "date": "2026-06-03",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "alpha",
          "late_minutes": 0
        },
        {
          "date": "2026-06-04",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-05",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-08",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-09",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-10",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-11",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-12",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-15",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-16",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-17",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-18",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-19",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-22",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-23",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-24",
          "day_of_week": 3,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-25",
          "day_of_week": 4,
          "shift_start": "23:48:00",
          "shift_end": "17:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-26",
          "day_of_week": 5,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-29",
          "day_of_week": 1,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        },
        {
          "date": "2026-06-30",
          "day_of_week": 2,
          "shift_start": "08:00:00",
          "shift_end": "16:00:00",
          "check_in": null,
          "check_out": null,
          "status": "upcoming",
          "late_minutes": 0
        }
      ]
    }
  ]
}
```

---

### 35. Get All Leaves
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/leaves
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 2
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:18 GMT
etag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 4f5c8ecc9ba889ae4ea769877301ec3e
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 273ms

[]
```

---

### 36. Get Active Leave Today
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/leaves/active-today
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 4
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:18 GMT
etag: W/"4-K+iMpCQsduglOsYkdIUQZQMtaDM"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 8f1cc652a11916e45d6cd0d5eaf3711b
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 399ms

null
```

---

### 37. Apply Leave
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/leaves
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6Imthcnlhd2FuIiwiaWF0IjoxNzgwNTkxOTgzLCJleHAiOjE3ODA2NzgzODN9.yF_GM5G5jApFpESQh5eX3-uAaq6gtA4ii1Yt4C5Vvz8

{
  "type": "izin",
  "start_date": "2026-06-10",
  "end_date": "2026-06-10",
  "reason": "Keperluan keluarga"
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 220
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:18 GMT
etag: W/"dc-4nAh4Mcvgx0QpmX3eLBwK/UCNaw"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: bee8c940e6d5668e4ea769877301ed6e
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 358ms

{
  "id": 3,
  "user_id": 7,
  "type": "izin",
  "start_date": "2026-06-10T00:00:00.000Z",
  "end_date": "2026-06-10T00:00:00.000Z",
  "reason": "Keperluan keluarga",
  "status": "pending",
  "approved_by": null,
  "created_at": "2026-06-04T16:53:18.640Z"
}
```

---

### 38. Update Leave Status (HRD - Approve)
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/leaves/3/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "status": "approved"
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 218
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:19 GMT
etag: W/"da-lacSMoOD17XXh9Ig2UHa8GxjsDQ"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: e60e90943ffb232c5d6cd0d5eaf37e8e
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 281ms

{
  "id": 3,
  "user_id": 7,
  "type": "izin",
  "start_date": "2026-06-10T00:00:00.000Z",
  "end_date": "2026-06-10T00:00:00.000Z",
  "reason": "Keperluan keluarga",
  "status": "approved",
  "approved_by": 6,
  "created_at": "2026-06-04T16:53:18.640Z"
}
```

---

### 39. Update Leave Status (HRD - Reject)
PUT https://presensi-backend-820401822458.asia-southeast2.run.app/api/leaves/3/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "status": "rejected"
}

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 218
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:19 GMT
etag: W/"da-8nGqfqKRFLS7Sx1qLSUFI/7bBJo"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: e1464a05f3346cb743be91d17969d17d
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 268ms

{
  "id": 3,
  "user_id": 7,
  "type": "izin",
  "start_date": "2026-06-10T00:00:00.000Z",
  "end_date": "2026-06-10T00:00:00.000Z",
  "reason": "Keperluan keluarga",
  "status": "rejected",
  "approved_by": 6,
  "created_at": "2026-06-04T16:53:18.640Z"
}
```

---

### 40. Get Salaries
GET https://presensi-backend-820401822458.asia-southeast2.run.app/api/salaries
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

#### Response:
```http
HTTP/1.1 200 OK
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 2
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:19 GMT
etag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: 1f19a34667c52c5f5d6cd0d5eaf37013
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 408ms

[]
```

---

### 41. Create Salary
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/salaries
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Niwicm9sZSI6ImhyZCIsImlhdCI6MTc4MDU5MTk3NCwiZXhwIjoxNzgwNjc4Mzc0fQ.5dwpksNzijplX1Wa7aEx6ENTwfcv-wwtlooAsmMfmjU

{
  "user_id": 7,
  "month": 6,
  "year": 2026,
  "basic_salary": 5000000,
  "allowances": 500000,
  "deductions": 200000
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 186
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:20 GMT
etag: W/"ba-AqUBCsSc7RlCtwVKk1q8Y0qcz3Q"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: e5846f28f240c16443be91d17969de58
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 496ms

{
  "id": 1,
  "user_id": 7,
  "month": 6,
  "year": 2026,
  "basic_salary": "5000000.00",
  "allowances": "500000.00",
  "deductions": "200000.00",
  "net_salary": "5300000.00",
  "created_at": "2026-06-04T16:53:19.958Z"
}
```

---

### 42. Log Mobile Error
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/logs/error

{
  "user_id": 7,
  "error_type": "NetworkException",
  "message": "Failed to connect to server"
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 96
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:20 GMT
etag: W/"60-NLok+SRcSm1VP32HBdDhlqnbK4s"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: f0f84a938a40bbdd5d6cd0d5eaf371ea
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 260ms

{
  "success": true,
  "id": "WVayMbskWahAf3F5iDlp",
  "message": "Error log berhasil dicatat di Firestore"
}
```

---

### 43. Send Notification (HRD Broadcast)
POST https://presensi-backend-820401822458.asia-southeast2.run.app/api/logs/notification

{
  "title": "Pengumuman",
  "message": "Besok libur nasional, tidak ada presensi",
  "target_user_id": "all"
}

#### Response:
```http
HTTP/1.1 201 Created
access-control-allow-origin: *
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length: 84
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
content-type: application/json; charset=utf-8
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
date: Thu, 04 Jun 2026 16:53:20 GMT
etag: W/"54-YWM7VfseGxV/7iHPW+NJj+lZSlM"
origin-agent-cluster: ?1
referrer-policy: no-referrer
server: Google Frontend
strict-transport-security: max-age=31536000; includeSubDomains
x-cloud-trace-context: d1d326211968462043be91d17969d2a6
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 0
X-Response-Time: 172ms

{
  "success": true,
  "id": "X9wHeD9fWxQJ2jlUqzeC",
  "message": "Notifikasi berhasil dikirim"
}
```

---

