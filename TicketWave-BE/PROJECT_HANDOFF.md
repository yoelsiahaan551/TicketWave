# TicketWave Backend — Project Handoff & Planning

> Dokumen ini dibuat buat handoff ke AI coding agent (opencode / agent lain) atau developer
> baru yang lanjutin project ini. Isinya: apa yang udah dibangun, apa yang belum, dan
> urutan prioritas pengerjaan selanjutnya.

---

## 1. Ringkasan Proyek

**TicketWave** — Smart Digital Ticketing Management System for Concert & Festival.

Platform ticketing di mana **Admin TicketWave** (bukan EO/agensi) yang membuat semua event.
Agensi cukup kasih data ke Admin, lalu dapat akses **akun Petugas** buat kelola penjualan,
transaksi, laporan, dan check-in event mereka sendiri.

**3 Role:** Admin, Petugas (officer), User. Tidak ada role Agensi/Manager/Kasir terpisah —
kasir adalah fitur di dalam akun Petugas.

---

## 2. Tech Stack (Final)

| Layer | Teknologi |
|---|---|
| Backend Framework | Flask |
| ORM | Flask-SQLAlchemy |
| Migration | Flask-Migrate (Alembic) |
| Validasi | Marshmallow |
| Database | **Supabase PostgreSQL** (sudah connect & migrasi jalan) |
| File Storage | **Cloudinary** (sudah terhubung, dipakai untuk gambar) |
| Payment Gateway | Midtrans (belum diintegrasikan) |
| Auth | **JWT Extended + Bcrypt** (sudah dikerjakan, endpoint ready) |
| Deployment target | Backend di Railway, Frontend di Vercel (belum deploy) |

Frontend (Next.js + Zustand + TanStack Query) dan Mobile (React Native Expo) **belum digarap**
sama sekali — dokumen ini fokus ke backend.

---

## 3. Struktur Folder (Final, sudah disepakati)

Pola: **modular per fitur**, bukan layer-based. Models tersentralisasi di satu folder.
URL routing **resource-based, bukan role-based** (lihat poin 5).

```
ticketwave-backend/
├── app/
│   ├── __init__.py                  # application factory
│   ├── config/
│   │   ├── config.py                # Dev/Prod/Test config class
│   │   ├── extensions.py            # db, migrate, cors (jwt & bcrypt masih di-comment)
│   │   └── cloudinary_config.py     # init Cloudinary SDK
│   ├── middleware/
│   │   └── error_handler.py         # global error handler (404, 405, 500, dst)
│   ├── models/                      # SEMUA model SQLAlchemy, centralized
│   │   ├── user.py
│   │   ├── agency.py
│   │   ├── event.py
│   │   ├── festival_artist.py
│   │   ├── ticket_type.py
│   │   ├── ticket_phase.py
│   │   ├── ticket.py
│   │   └── transaction.py
│   ├── modules/
│   │   ├── auth/                    # KOSONG, belum dikerjain
│   │   ├── admin/
│   │   │   ├── agency_routes.py     # ✅ SUDAH JADI (full CRUD + upload logo)
│   │   │   ├── schema.py            # ✅ SUDAH JADI (Marshmallow validasi Agency)
│   │   │   ├── event_routes.py      # belum ada filenya
│   │   │   └── dashboard_routes.py  # belum ada filenya
│   │   ├── officer/                 # KOSONG, belum dikerjain (kasir, scan, laporan, dashboard)
│   │   ├── event/                   # KOSONG, belum dikerjain (browsing publik sisi User)
│   │   ├── ticket/                  # KOSONG, belum dikerjain (booking, QR, PDF)
│   │   ├── payment/                 # KOSONG, belum dikerjain (integrasi Midtrans)
│   │   ├── notification/            # KOSONG, belum dikerjain
│   │   └── user/                    # KOSONG, belum dikerjain (profil, history)
│   └── utils/
│       ├── responses.py             # ✅ success_response() & error_response() standar
│       ├── upload_service.py        # ✅ upload_image() & delete_image() Cloudinary
│       ├── decorators.py            # KOSONG, buat role_required() nanti pas auth
│       └── validators.py            # KOSONG
├── instance/
│   └── dev.db                       # SQLite lokal (fallback kalau DATABASE_URL kosong)
├── migrations/                      # sudah di-init, 1 migration jalan (init tables)
├── scripts/                         # KOSONG, buat seeder nanti
├── tests/                           # KOSONG, belum ada unit test
├── .env                             # (JANGAN commit — isi credential asli)
├── .env.example
├── .gitignore
├── requirements.txt
├── run.py
└── PROJECT_HANDOFF.md               # dokumen ini
```

---

## 4. Yang SUDAH Selesai ✅

### 4.1 Infrastruktur & Konfigurasi
- Application factory pattern (`app/__init__.py`) jalan normal.
- Config per environment (`development` pakai SQLite fallback / Supabase, `production`, `testing`).
- **Database Supabase PostgreSQL sudah connect dan migration sudah jalan** — 8 tabel sudah
  terbentuk di Supabase (bukan cuma lokal SQLite lagi).
- **Cloudinary sudah terhubung** — kredensial di `.env`, helper upload siap dipakai modul lain.
- Response format API sudah konsisten di semua endpoint:
  ```json
  { "success": true/false, "message": "...", "data": {...}, "errors": {...} }
  ```
- Global error handler (404, 405, 500, HTTPException generik) sudah aktif.
- **Konvensi URL: resource-based, bukan role-based.** Contoh: `/api/agencies`, BUKAN
  `/api/admin/agencies` — supaya nama role gak ketebak dari struktur URL publik.
  Role-checking nanti dilakukan di dalam kode (decorator), bukan lewat penamaan endpoint.
  **Pola ini WAJIB diikuti konsisten buat semua modul baru** (`/api/events`, `/api/tickets`,
  `/api/kasir`, `/api/scan`, dst — tanpa prefix admin/officer/user).

### 4.2 Database — 8 Model Sudah Dibuat
Semua model sudah didefinisikan lengkap dengan relasi FK dan method `to_dict()`:

| Model | Tabel | Keterangan |
|---|---|---|
| `User` | `users` | role: admin/officer/user. `password_hash` masih nullable (auth belum jalan) |
| `Agency` | `agencies` | Relasi 1-1 ke `User` (officer_id). Punya `logo_url` (Cloudinary) |
| `Event` | `events` | Support `event_type` single/festival. Status lifecycle draft→archived |
| `FestivalArtist` | `festival_artists` | Lineup artis per hari, khusus event festival |
| `TicketType` | `ticket_types` | Kategori tiket per event + kuota + sold_count |
| `TicketPhase` | `ticket_phases` | Early Bird/Presale/Normal, per ticket type |
| `Ticket` | `tickets` | booking_code, qr_token, status lifecycle booked→finished |
| `Transaction` | `transactions` | Record pembayaran Midtrans per tiket |

Migration pertama (`init tables`) sudah di-generate dan di-`upgrade` ke Supabase.

### 4.3 CRUD Agency — ✅ SELESAI
File: `app/modules/admin/agency_routes.py`

| Method | Endpoint | Status |
|---|---|---|
| POST | `/api/agencies` | ✅ Create + validasi email duplikat |
| GET | `/api/agencies` | ✅ List + search + pagination |
| GET | `/api/agencies/<id>` | ✅ Detail |
| PUT | `/api/agencies/<id>` | ✅ Update partial |
| POST | `/api/agencies/<id>/logo` | ✅ Upload logo ke Cloudinary |
| DELETE | `/api/agencies/<id>` | ✅ Delete (ditolak kalau masih ada event terkait) |

Semua sudah dites manual lewat Postman dan konfirmasi data masuk ke Supabase.

### 4.4 CRUD Event — ✅ SELESAI
File: `app/modules/admin/event_routes.py` & `app/modules/admin/event_schema.py`

| Method | Endpoint | Status |
|---|---|---|
| POST | `/api/events` | ✅ Create single/festival + nested ticket types & phases |
| GET | `/api/events` | ✅ List + filter (agency, status, type, city, search) + pagination |
| GET | `/api/events/<id>` | ✅ Detail lengkap (agency, ticket types, phases, artists) |
| PUT | `/api/events/<id>` | ✅ Update partial |
| POST | `/api/events/<id>/poster` | ✅ Upload poster ke Cloudinary |
| POST | `/api/events/<id>/banner` | ✅ Upload banner ke Cloudinary |
| PATCH | `/api/events/<id>/status` | ✅ Update status event (draft→published→on_sale→dst) |
| DELETE | `/api/events/<id>` | ✅ Delete (ditolak kalau sudah ada tiket terjual) |

**Fitur:**
- Support 2 tipe event: `single` (concert) dan `festival` (multi-day)
- Nested create: bisa langsung buat ticket types + phases sekaligus saat create event
- Validasi berbeda per tipe: single wajib artist_name/event_date/event_time, festival wajib days_count/festival_artists
- Upload poster & banner pakai Cloudinary (auto hapus file lama)
- Filter lengkap di list endpoint
- Sudah dites lengkap: create single event, create festival event, list, detail, update, update status

Dokumentasi lengkap ada di `EVENT_API_DOCS.md`.

### 4.5 CRUD Ticket Phase — ✅ SELESAI (BARU)
File: `app/modules/admin/ticket_phase_routes.py`, `app/modules/admin/ticket_phase_schema.py`, `app/utils/pricing.py`

| Method | Endpoint | Status |
|---|---|---|
| POST | `/api/ticket-types/<id>/phases` | ✅ Create phase baru dengan validasi overlap |
| GET | `/api/ticket-types/<id>/phases` | ✅ List phases (order by start_date) |
| GET | `/api/phases/<id>` | ✅ Detail phase |
| PUT | `/api/phases/<id>` | ✅ Update phase dengan validasi overlap |
| DELETE | `/api/phases/<id>` | ✅ Delete phase |

**Fitur:**
- CRUD phase terpisah (sebelumnya cuma bisa nested saat create event)
- **Validasi overlap tanggal:** Sistem otomatis cegah 2 phase overlap di ticket type yang sama
- Helper functions untuk pricing:
  - `get_active_phase(ticket_type_id, check_date)` - Ambil phase aktif
  - `calculate_final_price(ticket_type_id, check_date)` - Hitung harga setelah diskon
  - `get_next_phase(ticket_type_id, current_date)` - Ambil phase berikutnya
- Sudah dites lengkap: create, list, update, delete, validasi overlap (saat create & update)

Dokumentasi lengkap ada di `TICKET_PHASE_API_DOCS.md`.

### 4.5 Environment Variables yang Sudah Terisi
```
FLASK_ENV=development
SECRET_KEY=<sudah diisi random>
DATABASE_URL=<connection string Supabase Session Pooler, port 5432>
JWT_SECRET_KEY=<sudah diisi random, TAPI belum dipakai>
CLOUDINARY_CLOUD_NAME=<sudah diisi>
CLOUDINARY_API_KEY=<sudah diisi>
CLOUDINARY_API_SECRET=<sudah diisi>
MIDTRANS_SERVER_KEY=        <- KOSONG
MIDTRANS_CLIENT_KEY=        <- KOSONG
```

---

## 5. Catatan Teknis Penting (Wajib Dibaca Sebelum Lanjut Coding)

1. **Bug pola `os.getenv()` dengan default value**: Kalau env var ditulis kosong di `.env`
   (misal `DATABASE_URL=`), Python `os.getenv("KEY", "default")` akan return **string kosong**,
   BUKAN fallback ke default — karena key-nya "ada" cuma isinya kosong. Solusinya harus pakai
   `os.getenv("KEY") or "default"`. Ini sudah difix di `DATABASE_URL`
   (`app/config/config.py`), tapi **belum difix di `SECRET_KEY` dan `JWT_SECRET_KEY`** —
   perlu dicek/diperbaiki kalau nanti keduanya mau punya fallback default juga.

2. **Supabase Direct Connection = IPv6-only.** Kalau connect pakai host
   `db.<project-ref>.supabase.co` sering gagal resolve DNS di jaringan Indonesia (IPv4-only ISP).
   **Pakai Session Pooler** (`aws-0-<region>.pooler.supabase.com:5432`) sebagai gantinya —
   ini yang sekarang dipakai di `.env` project ini.

3. **Marshmallow versi 4.3.1** ter-install (bukan 3.x). Kode yang ada masih pakai fitur dasar
   (`Schema`, `fields.String`, `fields.Email`, `validate.Length`) jadi kemungkinan besar
   kompatibel, tapi belum ditest ekstensif dengan fitur Marshmallow yang lebih kompleks
   (nested schema, custom validator kompleks). Kalau ada modul baru butuh fitur lanjutan,
   cek dulu changelog breaking changes Marshmallow 3→4.

4. **JWT & Bcrypt sudah diaktifkan** di `app/config/extensions.py`. Auth sudah jalan dengan
   endpoint lengkap: register, login, refresh token, email verification (email belum dikirim
   beneran, masih log console), dan password reset. Semua endpoint admin (Agency, Event,
   Ticket Phase) sudah dilindungi dengan `@jwt_required()` + `@role_required("admin")`.

5. **`password_hash` di model `User` sekarang `nullable=False`** — wajib diisi. User model
   juga sudah ditambah field untuk email verification (`email_verified`, `email_verification_token`,
   `email_verification_token_expires`) dan password reset (`password_reset_token`,
   `password_reset_token_expires`).

6. **SMTP belum disetup** — Email verification dan password reset masih log ke console,
   belum kirim email beneran. Frontend bisa develop UI dulu tanpa harus setup SMTP.
   Setup SMTP nanti tinggal tambah config di `.env` dan uncomment kode email sending
   di `app/modules/auth/routes.py`. Lihat bagian "SMTP Setup" di bawah untuk panduan.

---

## 6. Yang BELUM Dikerjakan — Planning & Prioritas

Urutan di bawah ini disusun berdasarkan **dependency logis** (modul yang jadi prasyarat modul
lain dikerjakan duluan), bukan cuma urutan sembarang.

### Prioritas 1 — Fondasi yang Masih Kurang
- [x] **Auth (Register/Login + JWT)** — ✅ SELESAI
  - `POST /api/auth/register` — register user baru (role: user only)
  - `POST /api/auth/login` — login semua role, return access token + refresh token
  - `POST /api/auth/refresh` — refresh access token pakai refresh token
  - `GET /api/auth/me` — get current user profile
  - `GET /api/auth/verify-email/<token>` — verify email via token (email belum dikirim beneran, masih log console)
  - `POST /api/auth/request-password-reset` — request reset password (kirim token via email/log)
  - `POST /api/auth/reset-password` — reset password pakai token
  - `app/utils/decorators.py` — `@role_required("admin")`, `@role_required(["admin", "officer"])`, `@email_verified_required`
  - **Semua endpoint Agency, Event, Ticket Phase sudah dilindungi** dengan `@jwt_required()` + `@role_required("admin")`
  - **Dummy users tersedia** (jalankan `python scripts/seed_users.py`):
    - Admin: `admin@ticketwave.com` / `admin123`
    - Officer: `officer@ticketwave.com` / `officer123`
    - User: `user@example.com` / `user123`
  - **SMTP belum disetup** — email verification & password reset masih log console (lihat "SMTP Setup" di bawah)

### Prioritas 2 — Core Business: Event Management
- [x] **CRUD Event** (`app/modules/admin/event_routes.py`) — ✅ SELESAI
  - Create/update sudah handle 2 jenis: `single` (artist_name, event_date, event_time) dan
    `festival` (days_count + nested FestivalArtist per hari)
  - Upload poster & banner ke Cloudinary sudah jalan (reuse `app/utils/upload_service.py`)
  - Endpoint update status event sudah ada (PATCH `/api/events/<id>/status`)
  - Transisi status: draft → published → on_sale → sales_closed → ongoing → finished → archived
  - **BELUM:** Auto-create akun Officer pas publish event (fitur ini butuh auth dulu)
- [x] **CRUD TicketType** — ✅ SELESAI (nested di create event)
- [x] **CRUD TicketPhase Terpisah** — ✅ SELESAI
  - Phase sudah bisa dibuat nested saat create event + sekarang ada endpoint terpisah
  - **Endpoint yang sudah dibuat:**
    - `POST /api/ticket-types/<id>/phases` - ✅ Tambah phase baru setelah event dibuat
    - `GET /api/ticket-types/<id>/phases` - ✅ List phases (order by start_date)
    - `GET /api/phases/<id>` - ✅ Detail phase
    - `PUT /api/phases/<id>` - ✅ Edit phase (ubah tanggal, diskon, dll)
    - `DELETE /api/phases/<id>` - ✅ Hapus phase
  - **Validasi sudah ada:** ✅ Cegah overlap tanggal antar phase (saat create & update)
  - **File yang sudah dibuat:**
    - `app/modules/admin/ticket_phase_schema.py` - ✅ Marshmallow validation
    - `app/modules/admin/ticket_phase_routes.py` - ✅ CRUD endpoints dengan validasi overlap
    - `app/utils/pricing.py` - ✅ Helper functions (get_active_phase, calculate_final_price, get_next_phase)
  - **Testing:** Sudah ditest lengkap (create, list, update, delete, validasi overlap)
  - **Dokumentasi:** `TICKET_PHASE_API_DOCS.md`
  - Logic hitung harga aktif sudah ada di helper functions, tinggal dipanggil pas modul checkout

### Prioritas 3 — Sisi Publik (User)
- [x] **Browsing event publik** (`app/modules/public/event_routes.py`) — ✅ SELESAI
  - `GET /api/public/events` — list events dengan filter (city, event_type, search, date_from, date_to)
  - `GET /api/public/events/{id}` — detail event dengan ticket types & harga aktif (sudah include diskon dari active phase)
  - `GET /api/public/events/cities` — list available cities untuk dropdown filter
  - Response includes `price_from` (cheapest ticket), `stock_available`, `final_price` (after discount)
  - **Dokumentasi:** `PUBLIC_CHECKOUT_API_DOCS.md`
- [x] **Alur pembelian tiket** (`app/modules/ticket/checkout_routes.py`) — ✅ SELESAI (struktur ready, perlu Midtrans integration)
  - `POST /api/checkout` — Create booking (checkout), reserve stock for 15 minutes
  - `GET /api/checkout/{booking_code}` — Get booking detail (auto-check expiry)
  - `POST /api/checkout/{booking_code}/cancel` — Cancel pending booking, return stock
  - `POST /api/checkout/payment/notification` — Webhook for Midtrans (structure ready, needs signature verification)
  - **Models created:** `Booking` & `Ticket` (fully migrated)
  - Booking code format: `TKTW-YYYYMMDD-XXXXX`
  - Ticket code format: `TKT-XXXXX` + QR token for check-in
  - Stock management: auto-reserve on checkout, auto-return on expire/cancel
  - Guest checkout supported (user_id nullable)
  - **BELUM:** 
    - Integrasi Midtrans Snap API (payment_url masih dummy)
    - Generate PDF e-ticket (butuh `reportlab` atau `weasyprint`)
    - Email service untuk kirim e-ticket (butuh Flask-Mail setup)
  - **Dokumentasi:** `PUBLIC_CHECKOUT_API_DOCS.md`, `PUBLIC_CHECKOUT_IMPLEMENTATION_SUMMARY.md`
- [ ] **Cari Tiket Anda** — cari ulang tiket tanpa login pakai booking_code (sudah bisa via GET booking detail, bisa tambah endpoint search by name+phone)

### Prioritas 4 — Sisi Petugas (Officer)
- [ ] **Dashboard Officer** — pendapatan, tiket terjual, tersisa, grafik (scoped ke agency
  officer yang login)
- [ ] **Kasir Offline** — buat tiket manual pas penjualan online sudah ditutup
- [ ] **Scan Tiket (QR Check-In)** — validasi qr_token, update status jadi `checked_in`,
  catat waktu & siapa yang scan
- [ ] **Laporan** — pendapatan, refund, check-in stats

### Prioritas 5 — Sisi Admin Lanjutan
- [ ] **Dashboard Admin** — agregat semua event & agency
- [ ] **Notifikasi** — event baru, reminder H-1, dst (belum jelas channel-nya email/push/in-app)

### Prioritas 6 — Kualitas & Deployment
- [ ] Unit test (`tests/` masih kosong total)
- [ ] Seeder data dummy (`scripts/` masih kosong)
- [ ] Rate limiting di endpoint publik (checkout, cari tiket)
- [ ] Deploy backend ke Railway, connect ke Supabase production
- [ ] CORS config disesuaikan pas frontend sudah ada domainnya (sekarang masih default terbuka)

---

## 7. Konvensi Kode yang Harus Diikuti (Konsistensi)

1. **Komentar & docstring pakai Bahasa Indonesia** (casual tapi jelas) — ikutin gaya yang
   sudah ada di file-file existing.
2. **Response format wajib pakai** `success_response()` / `error_response()` dari
   `app/utils/responses.py` — jangan `jsonify()` manual di route baru.
3. **Validasi input wajib pakai Marshmallow schema**, taruh di file `schema.py` per modul
   (pola: `app/modules/<module>/schema.py`), jangan validasi manual di dalam route function.
4. **URL prefix resource-based**, bukan role-based (lihat poin 5 di atas). Role-checking
   dilakukan via decorator, bukan penamaan URL.
5. **Model di-import lewat `app/models/__init__.py`** — kalau bikin model baru, jangan lupa
   tambahin import-nya di situ juga, karena Flask-Migrate detect tabel dari situ.
6. **Upload file gambar pakai `app/utils/upload_service.py`** (`upload_image()`), jangan
   panggil `cloudinary.uploader` langsung di route — biar validasi ukuran/ekstensi konsisten.
7. **Migration**: tiap ubah model, jalankan `flask db migrate -m "pesan jelas"` lalu
   `flask db upgrade`. Jangan edit tabel manual lewat Supabase SQL Editor / Table Editor,
   karena bakal bikin migration history gak sinkron dengan skema aktual.

---

## 9. SMTP Setup untuk Email Verification & Password Reset

Auth sudah jalan, tapi email belum dikirim beneran — masih log ke console. Untuk mengaktifkan pengiriman email:

### 9.1. Tambah Config di `.env`

```bash
# SMTP Configuration (untuk email verification & password reset)
SMTP_HOST=smtp.gmail.com              # contoh pakai Gmail
SMTP_PORT=587                          # TLS port
SMTP_EMAIL=noreply@ticketwave.com     # email pengirim
SMTP_PASSWORD=your-app-password        # app password (bukan password akun)
SMTP_USE_TLS=True
```

**Catatan untuk Gmail:**
- Jangan pakai password akun biasa — pakai **App Password** (Google Account → Security → 2-Step Verification → App passwords)
- Kalau 2FA belum aktif, harus diaktifkan dulu baru bisa generate App Password

**Alternatif SMTP provider:**
- **SendGrid** (free tier 100 email/hari) — lebih reliable untuk production
- **Mailgun** (free tier 5000 email/bulan pertama)
- **AWS SES** (pay-as-you-go, murah)

### 9.2. Uncomment Config di `app/config/config.py`

Di class `BaseConfig`, sudah ada komentar SMTP config. Tinggal uncomment:

```python
# --- SMTP (untuk email verification, belum disetup) ---
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = os.getenv("SMTP_PORT", 587)
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "True") == "True"
```

### 9.3. Install Email Library

```bash
pip install Flask-Mail
```

Atau tambahin ke `requirements.txt`:
```
Flask-Mail
```

### 9.4. Setup Flask-Mail Extension

Di `app/config/extensions.py`:
```python
from flask_mail import Mail

mail = Mail()
```

Di `app/__init__.py`:
```python
from app.config.extensions import db, migrate, cors, jwt, bcrypt, mail

def create_app(env=None):
    # ...
    mail.init_app(app)
```

### 9.5. Buat Email Helper Function

Buat file `app/utils/email_service.py`:
```python
from flask_mail import Message
from app.config.extensions import mail
from flask import current_app

def send_email(to, subject, body):
    """
    Kirim email pakai Flask-Mail.
    
    Args:
        to: email tujuan (string)
        subject: subject email
        body: isi email (HTML atau plain text)
    """
    msg = Message(
        subject=subject,
        sender=current_app.config['SMTP_EMAIL'],
        recipients=[to]
    )
    msg.html = body
    mail.send(msg)
```

### 9.6. Update Auth Routes untuk Kirim Email

Di `app/modules/auth/routes.py`, ganti kode yang sekarang masih `print()` dengan `send_email()`:

**Register (email verification):**
```python
# Ganti dari:
print(f"Verification Link: {verification_link}")

# Jadi:
from app.utils.email_service import send_email

send_email(
    to=new_user.email,
    subject="Verify Your TicketWave Account",
    body=f"""
    <h2>Welcome to TicketWave!</h2>
    <p>Please verify your email by clicking the link below:</p>
    <a href="{verification_link}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    """
)
```

**Password Reset:**
```python
send_email(
    to=user.email,
    subject="Reset Your TicketWave Password",
    body=f"""
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    """
)
```

### 9.7. Testing

1. Restart Flask server
2. Register user baru via `POST /api/auth/register`
3. Cek inbox email yang didaftarkan
4. Klik link verifikasi → status `email_verified` jadi `True`

**Troubleshooting:**
- Kalau email gak masuk, cek spam folder
- Cek log server untuk error SMTP connection
- Pastikan SMTP_EMAIL & SMTP_PASSWORD benar
- Kalau pakai Gmail, pastikan "Less secure app access" dimatikan (harus pakai App Password)

---

## 10. Checklist Setup buat Developer/Agent Baru

- [ ] `python -m venv venv` lalu aktifkan
- [ ] `pip install -r requirements.txt`
- [ ] Copy `.env.example` → `.env`, isi semua value (lihat poin 4.4 buat referensi yang sudah ada)
- [ ] `flask db upgrade` (pastikan `DATABASE_URL` sudah mengarah ke Supabase Session Pooler)
- [ ] `python scripts/seed_users.py` (buat dummy users: admin, officer, user)
- [ ] `python run.py` → cek `GET /health` return `{"status":"ok"}`
- [ ] Test auth: `POST /api/auth/login` dengan `admin@ticketwave.com` / `admin123`
- [ ] Test protected endpoint: `GET /api/agencies` dengan token dari login

---

*Dokumen ini terakhir diupdate: 2026-11-03 — Setelah Public Event Browsing & Checkout System selesai. Progress: ~60% (fondasi database + 3 modul CRUD + Auth + Public Browsing + Checkout selesai). Next priority: Midtrans integration + E-ticket PDF generation + Email service.*
