# DOKUMENTASI MASALAH & KETERBATASAN ARSITEKTUR BACKEND TICKETWAVE
**File Path:** `C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\BACKEND_ISSUES.md`  
**Target Komponen:** Backend Flask (`TicketWave-BE`)  
**Referensi Terkait:** Frontend Next.js (`TicketWave-FE/web`), Mobile Expo (`TicketWave-FE/mobile`), Laporan Audit Integrasi (`MD.BE.md`), Audit Frontend (`BE.md`)  
**Tanggal Diperbarui:** 20 November 2026  
**Status Audit:** READ-ONLY Static & Dynamic Source Code Analysis (Diperbarui dengan Verifikasi Perbaikan Runtime)  

Dokumen ini adalah **sumber tunggal kebenaran (single source of truth)** untuk seluruh temuan teknis, bug kode, celah keamanan, dan keterbatasan desain API pada Backend Flask TicketWave. Dokumen ini membedakan secara tegas antara **Bug Internal Backend** (kesalahan sintaksis, nama kolom database, signature fungsi, exception handler) dengan **Keterbatasan Desain API** (ketiadaan endpoint spesifik, ketiadaan model relasi, dan integrasi pihak ketiga yang belum lengkap).

---

## Ringkasan Masalah Backend

- **Total Issue Tercatat:** `15`
- **Status `OPEN`:** `11` (`ISSUE-03`–`ISSUE-08`, `ISSUE-11`–`ISSUE-15`)
- **Status `PARTIALLY RESOLVED — SANDBOX VERIFIED`:** `1` (`ISSUE-09`)
- **Status `IMPLEMENTED — LIVE WEBHOOK VERIFICATION BLOCKED`:** `1` (`ISSUE-10`)
- **Status `RESOLVED`:** `2` (`ISSUE-01`, `ISSUE-02`)

| ID | Masalah | Prioritas | Status | Dampak Next.js | Dampak Mobile |
|---|---|:---:|:---:|---|---|
| **ISSUE-01** | Detail festival multi-day menghasilkan HTTP 500 (`FestivalArtist.day` vs `day_number`) | **P1** | **RESOLVED** | Halaman `/user/event/[id]` (`event_id=12`) kini berhasil memuat detail & lineup festival (`HTTP 200 OK`) | Layar `event/[id].tsx` kini dapat memuat detail & lineup festival (`HTTP 200 OK`) |
| **ISSUE-02** | Seluruh endpoint officer menghasilkan HTTP 404 (`scan_bp` & `kasir_bp` belum terdaftar, file rute belum ada) | **P1** | **RESOLVED — LIVE QR VALIDATION AND CHECK-IN VERIFIED** | Seluruh modul `/officer/*` kini berfungsi penuh (`GET /api/scan/stats`, `GET /api/scan/history`, `POST /api/scan/validate`, `POST /api/scan/check-in` mengembalikan HTTP 200/409/400/404 sesuai kontrak; modul `/api/kasir/*` tetap ditunda di luar ruang lingkup) | Seluruh modul `officer/*` pada Mobile kompatibel dengan kontrak respons `/api/scan/*` yang sama |
| **ISSUE-03** | Upload media logo, poster, dan banner menghasilkan HTTP 500 (Dua penyebab: kredensial invalid & exception SDK Cloudinary unhandled, plus `delete_image` URL bug) | **P2** | **OPEN** | Gagal unggah logo agensi, poster, dan banner event pada dashboard admin | Gagal unggah file media pada form edit agensi dan event (HTTP 500) |
| **ISSUE-04** | Ketiadaan endpoint daftar pesanan pengguna (`GET /api/checkout/my-bookings`) | **P2** | **OPEN** | Frontend terpaksa mengandalkan `localStorage` per peramban; data hilang jika cache dibersihkan | Aplikasi terpaksa mengandalkan `AsyncStorage` lokal; pesanan tidak sinkron antar perangkat |
| **ISSUE-05** | Ketiadaan endpoint daftar manajemen users admin (`GET /api/users`) | **P3** | **OPEN** | Navigasi admin user hanya stub/template tanpa integrasi data pengguna | Layar `admin/users.tsx` hanya menampilkan fallback dari `/api/auth/me` dan `/api/agencies` |
| **ISSUE-06** | Ketiadaan endpoint agregasi omzet dan analitik penjualan global | **P3** | **OPEN** | Dashboard admin menghitung estimasi matematis di klien yang rentan selisih | Dashboard admin menampilkan label `—` tanpa data finansial riil |
| **ISSUE-07** | Ketiadaan model dan endpoint penugasan officer ke event/gate | **P3** | **OPEN** | Daftar event petugas menampilkan seluruh event publik tanpa konteks penugasan | Layar `officer/events.tsx` hanya menampilkan list publik dengan catatan disclaimer |
| **ISSUE-08** | Bug kalkulasi fase harga tiket diskon pada checkout & katalog (`calculate_final_price`) | **P1** | **OPEN** | Transaksi checkout tiket berfase diskon gagal fatal dengan HTTP 500 (*TypeError*) | Checkout tiket fase Early Bird/Presale gagal dengan HTTP 500 (*TypeError*) |
| **ISSUE-09** | Simulasi dummy URL pembayaran Midtrans Snap tanpa integrasi riil API (`POST /api/checkout`) | **P2** | **PARTIALLY RESOLVED — SANDBOX VERIFIED** | Checkout Next.js mengirim `payment_method`, menerima `redirect_url` Snap Sandbox asli, `GET /api/checkout/<code>` murni read-only, & tombol manual memanggil `POST .../sync-payment-status`; Production masih terpisah | Mobile tidak diubah pada tugas ini; endpoint Backend kini menerbitkan `redirect_url` Snap Sandbox nyata |
| **ISSUE-10** | Kelemahan keamanan webhook Midtrans (tanpa SHA-512, status kartu kredit `capture` terabaikan, & tiket tidak di-cancel) | **P2** | **IMPLEMENTED — LIVE WEBHOOK VERIFICATION BLOCKED** | Verifikasi SHA-512, `compare_digest`, `gross_amount`, `capture`/`settlement`/`refund`, idempotensi, & pembatalan tiket lulus 13 unit test; live webhook ke localhost terblokir tanpa HTTPS publik (fallback `POST` terproteksi tersedia hanya untuk Sandbox/dev) | Konsisten dengan perilaku Backend; tiket diinvalidasi menjadi `cancelled` saat order dibatalkan/kedaluwarsa/refund |
| **ISSUE-11** | Ketiadaan atribut kategori / genre pada model Event dan endpoint katalog publik | **P4** | **OPEN** | Filter kategori musik/seni pada katalog dieksplorasi diabaikan oleh backend | Filter chip kategori pada tab `(tabs)/events.tsx` tidak memfilter genre event di backend |
| **ISSUE-12** | Layanan email verifikasi & reset password hanya log konsol terminal (SMTP belum terkonfigurasi) | **P3** | **OPEN** | Pengguna tidak menerima email aktivasi atau tautan reset password di kotak masuk | Pengguna mobile mengandalkan copy token manual dari log server / fallback dev |
| **ISSUE-13** | Status code mismatch pada handler `error_response` (argumen status code masuk ke parameter `errors`) | **P3** | **OPEN** | Akses forbidden atau resource not found diterima sebagai HTTP 400 bukannya 403/404 | Interceptor dan penanganan error klien membaca status HTTP 400 untuk semua jenis error |
| **ISSUE-14** | Ketiadaan endpoint pembaruan profil pengguna (`PUT /api/auth/me`) | **P3** | **OPEN** | Pengguna tidak dapat memperbarui nama profil atau nomor telepon di halaman profil | Form edit profil di aplikasi mobile tidak memiliki endpoint untuk persistensi data |
| **ISSUE-15** | Ketiadaan mekanisme revokasi sesi server-side & endpoint logout (`POST /api/auth/logout`) | **P3** | **OPEN** | Token JWT tetap aktif sampai masa kedaluwarsa alami meskipun pengguna sudah logout | Pembersihan sesi hanya terjadi di sisi klien tanpa token blocklist di server |

---

## ISSUE-01 — Detail Festival Multi-Day Menghasilkan HTTP 500

- **Status:** `RESOLVED`
- **Prioritas:** `P1` (High)
- **Komponen:** Public Event Module (`app/modules/public/event_routes.py`)
- **Endpoint:** `GET /api/public/events/<event_id>`
- **File terkait:**
  - `app/modules/public/event_routes.py` (Baris 138–143 setelah perubahan)
  - `app/models/festival_artist.py` (Baris 14)
- **Gejala:**
  Setiap kali pengguna (guest/user) membuka detail event bertipe `festival`, server Flask mengalami unhandled exception dan mengembalikan respons `HTTP 500 Internal Server Error`.
- **Hasil aktual (sebelum perbaikan):**
  `HTTP 500 Internal Server Error`.  
  Traceback Flask Backend:  
  `AttributeError: type object 'FestivalArtist' has no attribute 'day'`
- **Hasil yang diharapkan:**
  Server mengembalikan respons `HTTP 200 OK` dengan format data:
  ```json
  {
    "success": true,
    "message": "Event detail retrieved successfully",
    "data": {
      "event": { ... },
      "lineup": [
        { "id": 1, "day_number": 1, "artist_name": "Hindia" },
        { "id": 2, "day_number": 2, "artist_name": "Tulus" }
      ],
      "ticket_types": [ ... ]
    }
  }
  ```
- **Akar masalah:**
  Pada `app/modules/public/event_routes.py` baris 138 (sebelum perbaikan), kode melakukan query:
  ```python
  festival_artists = FestivalArtist.query.filter_by(event_id=event.id).order_by(FestivalArtist.day.asc()).all()
  ```
  Sedangkan pada model `app/models/festival_artist.py` baris 14, kolom database didefinisikan sebagai:
  ```python
  day_number = db.Column(db.Integer, nullable=False)
  ```
  Atribut `day` tidak ada pada model SQLAlchemy, sehingga query SQL gagal dieksekusi.
- **Dampak pada Next.js:**
  Sebelum perbaikan, halaman Next.js `/user/event/[id]` mengalami error boundary saat membuka event festival musik (`[API Error] "/public/events/12" 500`). Setelah perbaikan, halaman `/user/event/12` berhasil memuat detail festival dan daftar artis tanpa error.
- **Dampak pada mobile:**
  Sebelum perbaikan, layar `event/[id].tsx` di aplikasi Expo menampilkan banner error "Gagal memuat detail event" (`HTTP 500`). Setelah perbaikan, endpoint `GET /api/public/events/12` mengembalikan `HTTP 200 OK` sehingga detail festival dan lineup artis dapat digunakan oleh Next.js dan Mobile.
- **Langkah reproduksi:**
  1. Buat event dengan `event_type: "festival"` dan status `"on_sale"`.
  2. Tambahkan artis pada tabel `festival_artists` untuk event tersebut.
  3. Kirimkan request `GET http://localhost:5000/api/public/events/<event_id>`.
  4. Amati respons HTTP dan urutan array `data.lineup`.
- **Perbaikan yang diterapkan (Catatan Resolusi):**
  - **Akar masalah:** Query detail festival pada `app/modules/public/event_routes.py` memanggil `FestivalArtist.day.asc()`, sedangkan model `FestivalArtist` (`app/models/festival_artist.py` baris 14) mendefinisikan field `day_number`.
  - **File kode yang diperbaiki:** `C:\Users\LOQ\Documents\TicketWave\TicketWave-BE\app\modules\public\event_routes.py`
  - **Baris aktual setelah perubahan:** Baris `138–143` (di dalam blok `if event.event_type == "festival":` pada baris `137–144`).
  - **Perubahan kode (`FestivalArtist.day.asc()` → `FestivalArtist.day_number.asc()`):**
    ```python
    # SEBELUM (Baris 138):
    festival_artists = FestivalArtist.query.filter_by(event_id=event.id).order_by(FestivalArtist.day.asc()).all()

    # SESUDAH (Baris 138-143):
    festival_artists = (
        FestivalArtist.query
        .filter_by(event_id=event.id)
        .order_by(FestivalArtist.day_number.asc())
        .all()
    )
    ```
  - **Bukti sebelum perbaikan:** `GET http://127.0.0.1:5000/api/public/events/12` menghasilkan `HTTP 500 INTERNAL SERVER ERROR` dengan `AttributeError: type object 'FestivalArtist' has no attribute 'day'`.
  - **Bukti setelah perbaikan:** `GET http://127.0.0.1:5000/api/public/events/12` menghasilkan **`HTTP 200 OK`** (`"success": true`, `"message": "Event detail retrieved successfully"`) dengan kontrak respons `{ "agency", "event", "lineup", "ticket_types" }` tetap utuh.
  - **Bukti urutan artis menggunakan `day_number`:** Pada `event_id = 12` (`SoundWave Summer Fest 2026`), array `data.lineup` dikembalikan terurut naik berdasarkan `day_number`:
    1. `{"id": 1, "event_id": 12, "day_number": 1, "artist_name": "Sheila on 7"}`
    2. `{"id": 2, "event_id": 12, "day_number": 2, "artist_name": "Dewa 19"}`
    3. `{"id": 3, "event_id": 12, "day_number": 3, "artist_name": "Padi Reborn"}`
  - **Bukti tidak ada regresi pada event single dan daftar event publik:**
    - `GET http://127.0.0.1:5000/health` → `HTTP 200 OK` (`{"service": "TicketWave Backend", "status": "ok"}`)
    - `GET http://127.0.0.1:5000/api/public/events` → `HTTP 200 OK` (`total_items: 11`)
    - `GET http://127.0.0.1:5000/api/public/events/4` (`single` — `Jakarta Mega Concert 1984`) → `HTTP 200 OK` (`lineup: []`)
    - `GET http://127.0.0.1:5000/api/public/events/5` (`single` — `Jakarta Mega Concert 7001`) → `HTTP 200 OK` (`lineup: []`, `ticket_types: 1`)
  - **Dampak:** Detail festival (`GET /api/public/events/12`) kini dapat digunakan oleh Next.js (`/user/event/12` diverifikasi tampil penuh tanpa `API Error 500`) dan Mobile (`/event/12`).
  - **Tanggal verifikasi aktual:** `20 November 2026`
  - **Status akhir:** `RESOLVED`
- **Risiko perubahan:**
  Rendah. Tidak mengubah struktur skema database maupun kontrak respons API.
- **Kriteria penerimaan:**
  Request `GET /api/public/events/<event_id>` untuk festival mengembalikan status `HTTP 200 OK` dan array `lineup` terurut berdasarkan `day_number`.
- **Bukti pengujian:**
  Verifikasi runtime `GET /api/public/events/12` (`HTTP 200 OK`), verifikasi UI Next.js `http://localhost:3000/user/event/12` (`HTTP 200 OK`, lineup Hari ke-1 s/d Hari ke-3 tampil urut), serta pencarian kode menyeluruh memastikan `0` referensi `FestivalArtist.day` yang tersisa di `TicketWave-BE`.

---

## ISSUE-02 — Seluruh Endpoint Officer Menghasilkan HTTP 404

- **Status:** `RESOLVED — LIVE QR VALIDATION AND CHECK-IN VERIFIED`
- **Prioritas:** `P1` (High)
- **Komponen:** Officer Module (`app/modules/officer/scan_routes.py`) & App Factory (`app/__init__.py`)
- **Endpoint Terimplementasi & Terverifikasi (`/api/scan/*`):**
  - `GET /api/scan/stats`
  - `GET /api/scan/history`
  - `POST /api/scan/validate` (strictly read-only; validasi dua tahap)
  - `POST /api/scan/check-in` (pembaruan atomik pada tabel `tickets`)
  - *(Catatan ruang lingkup: `kasir_bp` `/api/kasir/*` tidak dibutuhkan oleh portal scanner Officer Web maupun Mobile saat ini sehingga tetap ditunda / di luar ruang lingkup perbaikan `ISSUE-02` ini).*
- **File terkait:**
  - `TicketWave-BE/app/modules/officer/scan_routes.py` (Baru — blueprint `scan_bp` lengkap dengan guard JWT + role `officer`/`admin`, sanitasi payload, validasi status `valid`/`used`/`cancelled`/`pending_payment`/`expired`, atomic check-in, dan serialisasi aman tanpa membocorkan `qr_token` maupun field rekaan)
  - `TicketWave-BE/app/__init__.py` (Baris 58 & 66 — mendaftarkan `scan_bp` dengan `url_prefix="/api/scan"`)
  - `TicketWave-BE/tests/test_officer_scan.py` (Baru — 5 unit test guard role `401`/`403`, read-only validate, penolakan unpaid/expired/cancelled/random/malformed, atomic check-in + duplicate `409`, dan histori/statistik)
- **Gejala (Sebelum Perbaikan):**
  Seluruh request yang dikirimkan oleh portal petugas (baik dari browser maupun scanner perangkat mobile) menerima status `HTTP 404 Not Found`.
- **Akar masalah (Sebelum Perbaikan):**
  1. Pada `app/__init__.py`, pendaftaran `scan_bp` masih dikomentari.
  2. File `app/modules/officer/scan_routes.py` belum dibuat di folder `app/modules/officer/`.
- **Perbaikan yang diterapkan (Catatan Resolusi):**
  - Mengimplementasikan keempat endpoint `/api/scan/*` sesuai kontrak bersama **Next.js** (`web/app/lib/officerService.js`) dan **Mobile** (`mobile/src/api/endpoints.ts`) tanpa memerlukan perubahan skema atau migrasi database (`Ticket` sudah memiliki `ticket_code`, `qr_token`, `status`, `checked_in_at`, `checked_in_by`).
  - Seluruh endpoint dilindungi `@jwt_required()` dan pengecekan role `officer`/`admin` (mengembalikan `HTTP 401` tanpa token dan `HTTP 403` untuk role `user`).
  - `POST /api/scan/validate` bersifat strictly read-only dan mendukung pencarian berdasarkan `qr_token` resmi (masked di UI) maupun `ticket_code` (`case-insensitive`): mengembalikan `200 VALID`, `200 DIBATALKAN`, `409 SUDAH DIGUNAKAN`, `400 TIDAK VALID` (unpaid/expired/malformed), atau `404 TIDAK VALID` (tidak ditemukan), tanpa pernah mengembalikan HTTP `500` maupun `qr_token` pada payload respons.
  - `POST /api/scan/check-in` melakukan `UPDATE` SQL atomik bersyarat (`Ticket.status == "valid"` dan `Ticket.checked_in_at IS NULL`) sehingga check-in ganda ditolak konsisten dengan `HTTP 409` (`SUDAH DIGUNAKAN`, beserta `first_checked_in_at` UTC & `first_checked_in_by`).
- **Dampak pada Next.js & Mobile:**
  - Portal Officer Next.js (`/officer`, `/officer/scan`, `/officer/validation`, `/officer/history`) kini beroperasi penuh end-to-end dengan database riil tanpa 404 dan tanpa mock fallback.
  - Endpoint `/api/scan/*` juga selaras dengan parser pada Mobile (`mobile/src/api/endpoints.ts`) tanpa merusak kontrak API Mobile.
- **Kriteria penerimaan:**
  Keempat endpoint terdaftar pada `app.url_map`, lulus unit test terotomasi, serta lulus pengujian runtime end-to-end dari render QR resmi Next.js hingga check-in Officer dan penolakan scan kedua.
- **Bukti pengujian:**
  - Unit test Backend: `python -m unittest discover -s tests -p 'test_*.py' -v` -> `18` test lulus (`OK`, exit code `0`, mencakup 13 test Midtrans + 5 test Officer scan).
  - Pemeriksaan `app.url_map`: memuat `/api/scan/stats`, `/api/scan/history`, `/api/scan/validate`, `/api/scan/check-in`.
  - Pengujian browser live Next.js + Midtrans Sandbox (`booking_code`: `TKTW-20261120-ABDBB5`, `ticket_code`: `TKT-D8FB3D98`, penanda uji `E2E-WEB-QR-SCAN-20261120`):
    - Gambar PNG QR resmi yang dirender Next.js didekodekan secara optik via `html5-qrcode` (`scanFile`) di `/officer/scan` -> validasi pertama `VALID` (dua tahap), konfirmasi check-in pertama `CHECK-IN SELESAI` (`checked_in_by`: Officer Test), scan optik kedua pada gambar QR yang sama & validasi manual ulang ditolak `HTTP 409 SUDAH DIGUNAKAN`, input acak ditolak `HTTP 404 TIDAK VALID`, `/officer/history` mencatat `checkin-122`, dan `success_count` pada `/officer` naik tepat satu (`29 -> 30`).
- **Tanggal verifikasi aktual:** `20 November 2026`
- **Status akhir:** `RESOLVED — LIVE QR VALIDATION AND CHECK-IN VERIFIED`

---

## ISSUE-03 — Upload Media Logo, Poster, dan Banner Menghasilkan HTTP 500

- **Status:** `OPEN`
- **Prioritas:** `P2` (Medium-High)
- **Komponen:** Upload Service (`app/utils/upload_service.py`) & Media Routes
- **Endpoint:**
  - `POST /api/agencies/<int:agency_id>/logo`
  - `POST /api/events/<int:event_id>/poster`
  - `POST /api/events/<int:event_id>/banner`
- **File terkait:**
  - `app/utils/upload_service.py` (Baris 38-61)
  - `app/config/cloudinary_config.py` (Baris 9-15)
  - `app/modules/admin/agency_routes.py` (Baris 119-138)
  - `app/modules/admin/event_routes.py` (Baris 228-285)
- **Gejala:**
  Form pengunggahan gambar (multipart form-data) gagal dengan kode `HTTP 500 Internal Server Error` saat berinteraksi dengan API pihak ketiga Cloudinary.
- **Hasil aktual:**
  `HTTP 500 Internal Server Error`. Traceback server menunjukkan exception dari SDK Cloudinary yang tidak tertangkap.
- **Hasil yang diharapkan:**
  - Jika kredensial Cloudinary valid: File terunggah, URL CDN tersimpan ke database, dan server mengembalikan `HTTP 200 OK`.
  - Jika kredensial tidak valid / belum disetel: Server mengembalikan respons error yang aman (`HTTP 422` atau `HTTP 503`) tanpa melempar uncaught 500 exception.
- **Akar masalah (Dua Penyebab Utama + Bug Penghapusan Gambar Lama):**
  1. **Konfigurasi Kredensial Cloudinary Tidak Valid:** Variabel environment `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, dan `CLOUDINARY_API_SECRET` pada backend tidak valid / gagal autentikasi saat melakukan handshake ke server Cloudinary.
  2. **Exception SDK Belum Ditangani dengan Aman:** Pada `app/utils/upload_service.py:45`, fungsi `upload_image` langsung memanggil SDK Cloudinary tanpa membungkusnya dalam try-catch:
     ```python
     result = cloudinary.uploader.upload(file, folder=folder, resource_type="image", overwrite=True)
     ```
     Sementara controller pada `agency_routes.py` dan `event_routes.py` hanya menangkap exception lokal `UploadError`. Ketika SDK Cloudinary melempar exception otorisasi/jaringan, exception tersebut tidak tertangkap dan langsung memicu HTTP 500.
  3. **Bug Pembersihan Gambar Lama (`delete_image`):** Pada `app/modules/admin/event_routes.py:247, 277`, pemanggilan dilakukan dengan:
     ```python
     if event.poster_url:
         delete_image(event.poster_url)
     ```
     Fungsi `delete_image` di `upload_service.py:58` memanggil `cloudinary.uploader.destroy(public_id)`. Cloudinary mengharapkan string `public_id`, namun kode mengirimkan URL lengkap (`https://res.cloudinary.com/...`). Akibatnya gambar lama gagal terhapus dari cloud dan menumpuk di storage (kesalahan ini disembunyikan oleh blok `except: pass`).
- **Dampak pada Next.js:**
  Admin agensi tidak dapat mengunggah logo perusahaan pada halaman profil agensi; poster dan banner event tidak dapat diperbarui.
- **Dampak pada mobile:**
  Aksi upload logo pada `admin/agency/[id]/edit.tsx` serta upload poster dan banner pada `admin/event/[id]/edit.tsx` memunculkan alert kegagalan `Upload failed (HTTP 500)`.
- **Langkah reproduksi:**
  1. Login sebagai Admin.
  2. Kirim `POST http://localhost:5000/api/agencies/1/logo` dengan form-data file gambar valid (`logo=@test.png`).
  3. Amati respons server menghasilkan HTTP 500 akibat kegagalan SDK Cloudinary.
- **Saran perbaikan:**
  1. Perbarui nilai environment variable Cloudinary yang valid pada konfigurasi lokal backend.
  2. Tangani exception Cloudinary di `app/utils/upload_service.py`:
     ```python
     try:
         result = cloudinary.uploader.upload(file, folder=folder, resource_type="image", overwrite=True)
     except Exception as exc:
         raise UploadError("Layanan upload media sedang tidak tersedia atau kredensial penyimpanan tidak valid.")
     ```
  3. Ekstrak `public_id` dari URL lama sebelum memanggil `delete_image`, atau simpan field `poster_public_id` / `banner_public_id` di database.
  4. Tambahkan opsi fallback penyimpanan lokal (`local disk storage`) jika environment Cloudinary tidak diatur.
- **Risiko perubahan:**
  Rendah. Memperkuat ketahanan aplikasi terhadap kegagalan layanan pihak ketiga.
- **Kriteria penerimaan:**
  File gambar berhasil terunggah dan mengembalikan secure URL, atau jika koneksi cloud gagal, server memberikan respons terstruktur dengan kode status 422/503 tanpa crash HTTP 500.
- **Bukti pengujian:**
  Inspeksi kode sumber pada `app/modules/admin/agency_routes.py:129-133`, `app/utils/upload_service.py:45-61`, dan `app/modules/admin/event_routes.py:245-280`.

---

## ISSUE-04 — Ketiadaan Endpoint Daftar Pesanan Pengguna

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P2` (Medium-High)
- **Komponen:** Checkout & Booking Module (`app/modules/ticket/checkout_routes.py`)
- **Endpoint:** Ketiadaan `GET /api/checkout/my-bookings`
- **File terkait:**
  - `app/modules/ticket/checkout_routes.py` (Baris 103)
  - `app/models/booking.py` (Baris 21)
- **Gejala:**
  Backend hanya menyediakan endpoint lookup berbasis kode booking spesifik (`GET /api/checkout/<booking_code>`), tanpa menyediakan endpoint untuk mengambil daftar seluruh transaksi pemesanan milik akun pengguna yang sedang login.
- **Hasil aktual:**
  Pengguna login tidak memiliki mekanisme API untuk meminta daftar transaksi mereka dari server.
- **Hasil yang diharapkan:**
  Tersedia endpoint terproteksi `GET /api/checkout/my-bookings` yang mengembalikan daftar seluruh pemesanan terkait `user_id` pengguna yang terotentikasi.
- **Akar masalah:**
  1. Pada `app/models/booking.py:21`, field `user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)` sudah tersedia di database.
  2. Namun saat pembuatan booking di `app/modules/ticket/checkout_routes.py:103`, nilai `user_id` di-hardcode ke `None`:
     ```python
     user_id=None,  # TODO: set user_id if logged in (from JWT)
     ```
- **Dampak pada Next.js:**
  Frontend Next.js terpaksa menyimpan daftar kode booking yang pernah dibuat pada `localStorage` browser. Jika pengguna menggunakan peramban lain, berganti laptop, atau membersihkan cache peramban, seluruh daftar pesanan hilang dari riwayat.
- **Dampak pada mobile:**
  Aplikasi mobile terpaksa menyimpan daftar kode booking di `AsyncStorage` perangkat. Pesanan yang dibuat melalui web tidak akan muncul pada tab Pesanan aplikasi mobile.
- **Langkah reproduksi:**
  Periksa endpoint rute pada `checkout_routes.py`: hanya terdapat `POST /`, `GET /<booking_code>`, `POST /<booking_code>/cancel`, dan `POST /payment/notification`.
- **Saran perbaikan:**
  1. Pada `create_checkout` di `checkout_routes.py`: Periksa apakah ada header `Authorization: Bearer <token>`. Jika ada dan valid, isi `booking.user_id = current_user_id`.
  2. Buat endpoint baru pada `checkout_routes.py`:
     ```python
     @checkout_bp.get("/my-bookings")
     @jwt_required()
     def get_my_bookings():
         current_user_id = get_jwt_identity()
         bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc()).all()
         return success_response([b.to_dict() for b in bookings], "Daftar pesanan berhasil diambil")
     ```
- **Risiko perubahan:**
  Rendah. Merupakan penambahan fitur non-breaking.
- **Kriteria penerimaan:**
  Pengguna yang login dapat melakukan sinkronisasi riwayat pesanan di seluruh perangkat secara konsisten melalui API.
- **Bukti pengujian:**
  Inspeksi kode sumber pada `app/modules/ticket/checkout_routes.py:103`.

---

## ISSUE-05 — Ketiadaan Endpoint Daftar Manajemen Users Admin

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P3` (Medium)
- **Komponen:** Auth & Admin User Module
- **Endpoint:** Ketiadaan `GET /api/users`
- **File terkait:**
  - `app/modules/auth/routes.py`
  - `app/__init__.py`
- **Gejala:**
  Admin tidak dapat melihat daftar akun terdaftar dalam sistem (baik role `user`, `officer`, maupun `admin`), tidak dapat mencari user berdasarkan email/nama, dan tidak dapat mengelola akun dari antarmuka.
- **Hasil aktual:**
  Request `GET /api/users` mengembalikan `HTTP 404 Not Found` karena tidak ada rute yang terdaftar.
- **Hasil yang diharapkan:**
  Tersedia endpoint `GET /api/users` dengan parameter pencarian dan paginasi yang dikhususkan untuk Administrator.
- **Akar masalah:**
  Modul manajemen user tingkat platform belum dikembangkan pada backend Flask. Blueprint `auth_bp` hanya berfokus pada autentikasi diri sendiri (`/login`, `/register`, `/me`).
- **Dampak pada Next.js:**
  Komponen navigasi admin pengguna tidak memiliki sumber data dan hanya berfungsi sebagai placeholder UI.
- **Dampak pada mobile:**
  Halaman `admin/users.tsx` terpaksa menampilkan disclaimer dan hanya dapat memuat data profil admin sendiri dari `GET /api/auth/me` serta relasi petugas dari `GET /api/agencies`.
- **Langkah reproduksi:**
  Login sebagai Admin dan akses `GET http://localhost:5000/api/users`. Respons menghasilkan HTTP 404.
- **Saran perbaikan:**
  Tambahkan rute pada modul admin (`app/modules/admin/user_routes.py`) atau tambahkan ke blueprint admin:
  ```python
  @admin_bp.get("/users")
  @jwt_required()
  @role_required("admin")
  def list_users(current_user):
      query = User.query.order_by(User.created_at.desc())
      # pagination & search logic
      ...
  ```
- **Risiko perubahan:**
  Rendah. Endpoint baru terisolasi di bawah proteksi role admin.
- **Kriteria penerimaan:**
  Admin dapat melihat daftar seluruh user, memfilter berdasarkan role, dan memeriksa status verifikasi email secara dinamis.
- **Bukti pengujian:**
  Daftar route pada `app.url_map` membuktikan tidak adanya entri endpoint `/api/users`.

---

## ISSUE-06 — Ketiadaan Endpoint Agregasi Omzet dan Analitik Penjualan Global

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P3` (Medium)
- **Komponen:** Analytics & Reporting Module
- **Endpoint:** Ketiadaan `GET /api/admin/stats` atau `GET /api/admin/revenue`
- **File terkait:**
  - `app/modules/admin/event_routes.py`
  - `app/models/booking.py`
- **Gejala:**
  Dashboard admin tidak dapat menampilkan angka perputaran dana / omzet riil dan metrik performa penjualan tiket secara akurat.
- **Data yang saat ini tersedia di database:**
  - `TicketType.sold_count` (jumlah tiket terjual per jenis tiket).
  - `TicketType.quota` (kuota kapasitas).
  - `TicketType.base_price` (harga dasar).
  - `Booking.total_price` dan `Booking.status` (`paid`, `pending_payment`, `cancelled`).
- **Akar masalah:**
  Backend belum menyediakan controller yang melakukan kalkulasi agregasi SQL (`SUM`, `COUNT`) terhadap transaksi berstatus `paid`.
- **Dampak pada Next.js:**
  Halaman dashboard admin Next.js terpaksa menghitung estimasi pendapatan secara manual di sisi browser dengan mengalikan kuota terjual dengan harga dasar (`sold_count * base_price`), yang menghasilkan angka tidak akurat karena mengabaikan diskon fase harga dan transaksi refund.
- **Dampak pada mobile:**
  Aplikasi mobile (`admin/index.tsx`) memilih menampilkan tanda `—` pada kartu estimasi omzet untuk menghindari penyajian data palsu atau estimasi yang menyesatkan.
- **Langkah reproduksi:**
  Periksa endpoint statistik pada rute Flask; tidak tersedia agregator finansial global.
- **Saran perbaikan:**
  Buat endpoint `GET /api/admin/stats` dengan query agregasi database terverifikasi:
  ```python
  total_revenue = db.session.query(func.sum(Booking.total_price)).filter(Booking.status == "paid").scalar() or 0
  total_tickets_sold = db.session.query(func.sum(Booking.quantity)).filter(Booking.status == "paid").scalar() or 0
  ```
- **Risiko perubahan:**
  Rendah.
- **Kriteria penerimaan:**
  Dashboard admin menyajikan angka omzet riil berdasarkan transaksi lunas yang dapat diverifikasi terhadap riwayat mutasi pembayaran.
- **Bukti pengujian:**
  Kode sumber `mobile/app/admin/index.tsx:40-42` mengonfirmasi ketiadaan endpoint omzet dari backend.

---

## ISSUE-07 — Ketiadaan Model dan Endpoint Penugasan Officer ke Event/Gate

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P3` (Medium)
- **Komponen:** Officer & Agency Relation Model
- **Endpoint:** Ketiadaan `GET /api/officer/my-events` atau `GET /api/officer/assignments`
- **File terkait:**
  - `app/models/agency.py` (Baris 21)
  - `app/models/user.py` (Baris 31)
  - `app/modules/officer/`
- **Gejala:**
  Petugas (officer) yang login tidak memiliki batasan atau penugasan spesifik terhadap event mana yang menjadi wewenang pemeriksaannya dan gate mana yang ditugaskan kepadanya.
- **Akar masalah:**
  1. Skema database saat ini hanya memetakan relasi 1:1 antara `agencies` dan `users` melalui foreign key `agency.officer_id`.
  2. Tidak ada model relasi `OfficerAssignment` atau tabel pivot yang menautkan `officer_id`, `event_id`, nama gate pass, dan jadwal bertugas.
- **Dampak pada Next.js:**
  Halaman daftar event officer (`/officer/events`) menampilkan seluruh event publik yang sedang aktif di sistem tanpa memfilter hak akses agensi atau event penugasan.
- **Dampak pada mobile:**
  Layar `officer/events.tsx` menampilkan daftar event publik dengan catatan disclaimer transparan bahwa Backend belum mendukung relasi penugasan officer-event spesifik.
- **Langkah reproduksi:**
  Periksa model `Agency` dan `User`; tidak terdapat atribut relasi penugasan ke level event atau gate.
- **Saran perbaikan:**
  1. Buat model database baru:
     ```python
     class OfficerAssignment(db.Model):
         __tablename__ = "officer_assignments"
         id = db.Column(db.Integer, primary_key=True)
         user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
         event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
         gate_name = db.Column(db.String(50), default="Main Gate")
         assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
     ```
  2. Sediakan endpoint `GET /api/officer/my-events` untuk membatasi ruang lingkup pemindaian tiket oleh petugas.
- **Risiko perubahan:**
  Sedang. Memerlukan migrasi database (`flask db migrate`).
- **Kriteria penerimaan:**
  Petugas hanya dapat melihat dan memindai tiket untuk event yang ditugaskan oleh Admin / Agensi terkait.
- **Bukti pengujian:**
  Inspeksi relasi pada `app/models/agency.py:21-27` dan `app/models/user.py:30-32`.

---

## ISSUE-08 — Bug Kalkulasi Fase Harga Tiket dan Diskon pada Checkout & Katalog

- **Status:** `OPEN` (Aktif pada Kode Sumber Aktual)
- **Prioritas:** `P1` (High)
- **Komponen:** Pricing Utility (`app/utils/pricing.py`) & Checkout/Public Modules
- **Endpoint:**
  - `POST /api/checkout`
  - `GET /api/public/events`
  - `GET /api/public/events/<event_id>`
- **File terkait:**
  - `app/utils/pricing.py` (Baris 31-71)
  - `app/modules/ticket/checkout_routes.py` (Baris 90)
  - `app/modules/public/event_routes.py` (Baris 95, 149)
- **Gejala:**
  Setiap transaksi pemesanan tiket yang sedang berada dalam fase harga diskon (misalnya fase *Early Bird* atau *Presale*) mengalami error fatal saat checkout dengan kode status `HTTP 500 Internal Server Error`.
- **Hasil aktual:**
  `HTTP 500 Internal Server Error`. Traceback server Flask melempar:
  `TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'`
- **Hasil yang diharapkan:**
  Harga tiket dipotong sesuai persentase diskon fase aktif, harga satuan (`unit_price`) dikalkulasikan secara tepat, dan booking berhasil dibuat dengan status `HTTP 201 Created`.
- **Akar masalah:**
  Terdapat **ketidaksesuaian kontrak parameter fungsi (Signature Mismatch)** antara fungsi helper dengan pemanggilnya:
  1. Definisi fungsi pada `app/utils/pricing.py` baris 31:
     ```python
     def calculate_final_price(ticket_type_id, check_date=None):
         ticket_type = TicketType.query.get(ticket_type_id)
         if not ticket_type:
             return None
         # mengembalikan dict: {"base_price": ..., "final_price": ...}
     ```
     Fungsi ini mengharapkan parameter pertama adalah **`ticket_type_id` (integer)** dan mengembalikan **dictionary** atau `None`.
  2. Namun pada `app/modules/ticket/checkout_routes.py` baris 90, fungsi dipanggil dengan parameter harga dan persentase:
     ```python
     unit_price = int(calculate_final_price(float(ticket_type.base_price), active_phase.discount_percent))
     ```
     Karena nilai `float(ticket_type.base_price)` (contoh: `250000.0`) dikirim sebagai ID, pencarian `TicketType.query.get(250000.0)` gagal dan mengembalikan `None`.
  3. Konversi `int(None)` menghasilkan `TypeError` fatal.
  4. Kesalahan pemanggilan identik juga terjadi pada `app/modules/public/event_routes.py` baris 95 dan 149:
     ```python
     price_from = calculate_final_price(float(cheapest_ticket.base_price), active_phase.discount_percent)
     final_price = calculate_final_price(float(tt.base_price), active_phase.discount_percent)
     ```
     Menyebabkan field `price_from` dan `final_price` pada katalog event publik bernilai `None` saat fase diskon sedang aktif.
- **Dampak pada Next.js:**
  Pengguna web Next.js tidak dapat melakukan checkout tiket apapun yang memiliki fase diskon aktif.
- **Dampak pada mobile:**
  Pengguna mobile Expo mengalami kegagalan transaksi checkout pada tiket bertanda Early Bird / Presale.
- **Langkah reproduksi:**
  1. Buat event dan tambahkan tiket dengan harga dasar misal `Rp 100.000`.
  2. Tambahkan fase tiket (*early_bird*) dengan tanggal aktif hari ini dan diskon `20%`.
  3. Lakukan checkout melalui `POST /api/checkout` dengan kuantitas 1.
  4. Amati crash `TypeError` pada konsol server Flask.
- **Saran perbaikan:**
  Ubah fungsi pemanggilan di `checkout_routes.py:90` agar mengambil nilai `final_price` dari hasil kalkulasi yang benar:
  ```python
  # SEBELUM:
  unit_price = int(calculate_final_price(float(ticket_type.base_price), active_phase.discount_percent))

  # SESUDAH:
  calc = calculate_final_price(ticket_type.id)
  unit_price = int(calc["final_price"]) if calc else int(ticket_type.base_price)
  ```
  Dan terapkan perbaikan serupa pada `app/modules/public/event_routes.py` baris 95 dan 149.
- **Risiko perubahan:**
  Rendah. Menyelesaikan bug kritis pada inti bisnis proses pemesanan tiket.
- **Kriteria penerimaan:**
  Pemesanan tiket berfase diskon menghasilkan total harga yang terpotong secara benar dan tersimpan ke tabel `bookings` dengan status 201 Created.
- **Bukti pengujian:**
  Inspeksi kode sumber aktual pada `app/utils/pricing.py:31-50` vs `app/modules/ticket/checkout_routes.py:87-92`.

---

## ISSUE-09 — Simulasi Dummy URL Pembayaran Midtrans Snap Tanpa Integrasi Riil API

- **Status:** `PARTIALLY RESOLVED — SANDBOX VERIFIED` *(Lingkungan Sandbox terverifikasi nyata; integrasi Production masih memerlukan kredensial dan verifikasi Production terpisah)*
- **Prioritas:** `P2` (Medium-High)
- **Komponen:** Checkout & Payment Gateway Module (`app/modules/ticket/checkout_routes.py`, `app/modules/ticket/schema.py`)
- **Endpoint:** `POST /api/checkout`, `GET /api/checkout/<booking_code>` (read-only), `POST /api/checkout/<booking_code>/sync-payment-status` (Sandbox/dev only)
- **File terkait:**
  - `app/config/config.py` (`FRONTEND_URL`)
  - `app/modules/ticket/checkout_routes.py`
  - `app/modules/ticket/schema.py`
  - `web/app/components/user/PaymentMethod.jsx`
  - `web/app/user/checkout/page.jsx`
  - `web/app/user/pesanan/[id]/page.jsx`
  - `web/app/payment/finish/page.jsx`
  - `web/app/payment/unfinish/page.jsx`
  - `web/app/payment/error/page.jsx`
  - `web/app/components/payment/PaymentReturnHandler.jsx`
  - `web/app/lib/paymentContext.js`
  - `web/app/lib/authRedirect.js`
  - `web/app/lib/api.js`
- **Gejala (sebelum perbaikan):**
  Setelah proses checkout tiket berhasil, nilai `payment_url` yang diberikan kepada pengguna adalah string statis tiruan (`https://app.midtrans.com/snap/v2/vtweb/<booking_code>`), bukan URL transaksi resmi yang dihasilkan oleh API Midtrans Snap.
- **Yang Sudah Selesai (Sandbox Terverifikasi — 20 November 2026):**
  - **Snap Sandbox nyata:** `POST /api/checkout` memanggil endpoint resmi Sandbox `POST https://app.sandbox.midtrans.com/snap/v1/transactions` menggunakan Basic Auth `MIDTRANS_SERVER_KEY` (tanpa mengekspos key), mengirimkan `transaction_details`, `customer_details`, `item_details`, `callbacks` (`finish`/`error`/`pending` -> `<FRONTEND_URL>/payment/finish?booking_code=<booking_code>` berbasis env `FRONTEND_URL`), `expiry`, dan `enabled_payments` yang terverifikasi, serta melakukan rollback atomik jika gagal. Selain itu, `create_checkout()` kini mengisi `booking.user_id` dari token JWT `user` bila ada (sambil tetap mendukung guest checkout). *(Lihat pula `Masalah 5 — Return Midtrans Membocorkan Sesi Role dan Salah Redirect` pada `TicketWave-FE/web/BE.md`.)*
  - **Redirect URL Sandbox:** Server mengembalikan `redirect_url` Sandbox resmi (`https://app.sandbox.midtrans.com/snap/v4/...`) dan menyimpannya di `booking.payment_url`.
  - **Virtual Account Permata Sandbox:** Pilihan `virtual_account` pada `CheckoutSchema` (`validate.OneOf(["transfer_bank", "virtual_account", "qris"])`) memetakan channel VA resmi Midtrans, dan pembayaran VA Permata dummy berhasil disimulasikan di Simulator Sandbox.
  - **Get Status API:** Endpoint eksplisit `POST /api/checkout/<booking_code>/sync-payment-status` memanggil `GET https://api.sandbox.midtrans.com/v2/<order_id>/status` langsung dari Backend dengan Server Key, memvalidasi `order_id` serta `gross_amount`, dan menolak mode Production (`403`), request tanpa JWT (`401`), maupun pengguna non-pemilik/non-admin (`403`).
  - **Booking `paid`:** Booking Sandbox uji `id = 107` (`TKTW-20261120-9F07F8`) berstatus `paid` (`payment_method = bank_transfer:permata`) dengan record `Transaction` id = `1` berstatus `settlement`.
  - **E-ticket aktif:** Tiket `id = 119` (`TKT-0323294C`) berstatus `valid` dan modal QR Pass aktif setelah `paid` (serta tetap terkunci sebelum `paid`).
  - **Frontend direct payment:** Halaman checkout Next.js mewajibkan pemilihan metode pembayaran, mencegah double-submit, dan langsung mengarahkan browser ke `payment_url` Snap Sandbox resmi; halaman detail pesanan kini memisahkan `GET` read-only dengan tombol eksplisit `"Periksa Status Pembayaran"` (`POST .../sync-payment-status`) hanya saat `pending_payment`.
  - **Tidak ada URL dummy:** Pola URL fiktif `https://app.midtrans.com/snap/v2/vtweb/<booking_code>` telah dihapus sepenuhnya dari Backend dan diblokir oleh `getOfficialPaymentUrl()` di Frontend.
- **Yang Masih Diperlukan untuk Production:**
  - **Kredensial Production:** Mengisi `MIDTRANS_SERVER_KEY` (`Mid-server-...`) dan `MIDTRANS_CLIENT_KEY` (`Mid-client-...`) akun Merchant Midtrans Production yang sah.
  - **`MIDTRANS_IS_PRODUCTION=true` hanya saat deployment Production:** Tidak mengaktifkan flag Production selama pengembangan/Sandbox lokal.
  - **Pengujian nominal kecil yang disetujui secara terkontrol:** Melakukan uji transaksi Production bernilai minimal di bawah persetujuan eksplisit pemilik bisnis.
  - **Validasi domain Production:** Menyesuaikan `getOfficialPaymentUrl()` dan allowlist origin pembayaran agar domain Snap Production terverifikasi ketat sesuai lingkungan aktif.
  - **Finish URL:** Mengonfigurasi Callback Finish Redirect URL pada dashboard Midtrans agar pengguna kembali ke halaman detail pesanan resmi setelah bayar.
  - **Error URL:** Mengonfigurasi Error Redirect URL agar kegagalan pembayaran pada Snap diarahkan ke layar informasi error yang jelas.
  - **Notification URL HTTPS publik:** Memasang endpoint HTTPS publik `/api/checkout/payment/notification` pada Pengaturan Notification URL di Dashboard Midtrans Production.
  - **Secret management:** Menyimpan Server Key, Client Key, dan JWT secret dalam secret manager platform deployment (bukan file teks di repositori).
  - **Monitoring transaksi:** Menyediakan observability/alerting untuk error gateway `502`/`503`/`504`, mismatch nominal, dan transaksi pending mendekati batas `expired_at`.
  - **Rekonsiliasi status:** Menyediakan scheduled reconciliation job berbasis Midtrans Get Status API untuk menangani kasus webhook tertunda/terlewat.
  - **Prosedur refund:** Menyediakan alur operasional dan endpoint/rekonsiliasi resmi untuk `refund` / `partial_refund` dan pengembalian kuota tiket.
  - **Pengujian pembayaran Production terpisah:** Menjalankan checklist verifikasi end-to-end terpisah khusus deployment Production (bukan disamakan dengan Sandbox verification).
- **Bukti Verifikasi Sandbox Nyata (20 November 2026):**
  - Booking Sandbox uji dipertahankan: `booking_id = 107` (`TKTW-20261120-9F07F8`), `ticket_id = 119` (`TKT-0323294C`), `transaction_id = 1` (`settlement`), `ticket_type_id = 16` (`sold_count = 1`), serta booking uji alur return Midtrans (`TKTW-20261120-84BA9B`, `paid`, `TKT-6C30E911`, `user_id = 3`; dan `TKTW-20261120-193E11` yang membuktikan tombol Close `×` header Snap mengarah ke `/payment/finish?booking_code=TKTW-20261120-193E11&...`).
  - `GET /api/checkout/TKTW-20261120-9F07F8` berulang terbukti murni read-only (`SHA-256 instance/dev.db` identik sebelum dan sesudah `GET`); `POST /api/checkout/TKTW-20261120-9F07F8/sync-payment-status` teruji `HTTP 401` tanpa JWT dan idempotent `HTTP 200` (`synced = false`, `midtrans_status = settlement`) dengan JWT Admin.
  - Unit Test Backend: `tests/test_checkout_midtrans.py` — **15/15 test lulus (`OK`)** (bagian dari **20/20** suite test Backend, mencakup validasi `callbacks` `FRONTEND_URL` dan optional JWT `booking.user_id`), ditambah **5/5** unit test Frontend `app/lib/sessionIsolation.test.mjs`.

---

## ISSUE-10 — Kelemahan Keamanan Webhook Midtrans (Tanpa SHA-512, Status Kartu Kredit `capture` Terabaikan, & Tiket Tidak Di-cancel)

- **Status:** `IMPLEMENTED — LIVE WEBHOOK VERIFICATION BLOCKED` *(Kode keamanan, idempotensi, & sinkronisasi eksplisit telah diimplementasikan dan lulus unit test lokal; penerimaan live webhook dari Midtrans ke localhost masih `BLOCKED-BY-ENVIRONMENT` karena tidak ada URL HTTPS publik)*
- **Prioritas:** `P2` (Medium-High)
- **Komponen:** Payment Webhook & Sync Module (`app/modules/ticket/checkout_routes.py`, `app/models/booking.py`)
- **Endpoint:** `POST /api/checkout/payment/notification`, `POST /api/checkout/<booking_code>/sync-payment-status`
- **File terkait:**
  - `app/modules/ticket/checkout_routes.py` (`payment_notification`, `sync_booking_payment_status`, `get_booking_detail`, `apply_midtrans_transaction_status`, `_gross_amount_matches`)
  - `app/models/booking.py` (`cancel()`, `expire()`)
  - `tests/test_checkout_midtrans.py`
- **Yang Sudah Selesai:**
  - **Signature SHA-512:** Handler `payment_notification()` menghitung `SHA512(order_id + status_code + gross_amount + ServerKey)`.
  - **`compare_digest`:** Perbandingan signature menggunakan `hmac.compare_digest` yang tahan timing-attack (signature salah ditolak dengan `HTTP 403`).
  - **Gross amount validation:** Menolak ketidaksesuaian `gross_amount` terhadap `booking.total_price` menggunakan presisi `Decimal` (`HTTP 400`).
  - **Order ID validation:** Memastikan `order_id` ada di database `bookings` (`HTTP 404`), disertai validasi format 3-digit `status_code` dan allowlist `transaction_status` serta `fraud_status` (`HTTP 400`).
  - **Idempotensi:** Pemanggilan webhook berulang maupun notifikasi tidak berurutan (out-of-order, misalnya `pending`/`expire`/`cancel` yang datang terlambat setelah `settlement`) tidak menurunkan status `paid`, tidak menggandakan record `Ticket`/`Transaction`, dan tidak mengurangi/menambah `sold_count` lebih dari satu kali.
  - **Status lengkap:** Menangani `settlement`, `capture` (`fraud_status = accept` → `paid`; `deny` → `cancelled`; `challenge` → tetap `pending`), `pending`, `deny`, `cancel`, `expire`, `refund`, dan `partial_refund`.
  - **Ticket cancellation:** `Booking.cancel()` dan `Booking.expire()` menonaktifkan seluruh tiket terkait (`ticket.status = "cancelled"`) dan mengembalikan kuota `sold_count` dengan batas aman `max(0, ...)`.
  - **Unit test:** `tests/test_checkout_midtrans.py` memverifikasi seluruh skenario keamanan, idempotensi, out-of-order, refund ganda, GET read-only, timeout `504`, ownership sync, dan blokir mode Production (**13/13 test lulus**).
- **Yang Masih Diperlukan (Produksi & Verifikasi Live Webhook):**
  - **Deploy Backend pada HTTPS publik:** Server Production harus dapat dijangkau langsung oleh Midtrans melalui TLS/HTTPS valid (jangan gunakan tunnel lokal tanpa persetujuan saat development).
  - **Atur Notification URL di dashboard Midtrans:** Daftarkan endpoint resmi `https://<domain-backend>/api/checkout/payment/notification`.
  - **Verifikasi webhook Sandbox nyata:** Setelah deployment HTTPS tersedia, uji pengiriman notifikasi otomatis langsung dari Midtrans Dashboard / Sandbox ke endpoint HTTPS tersebut.
  - **Verifikasi retry notification:** Uji respons HTTP `200`/`4xx`/`5xx` terhadap mekanisme retry otomatis Midtrans untuk memastikan keandalan antrean webhook.
  - **Verifikasi notifikasi tidak berurutan:** Konfirmasi ulang behavior state machine pada skenario retry & out-of-order webhook di lingkungan staging HTTPS.
  - **Monitoring webhook gagal:** Tambahkan alert dan log terstruktur (tanpa Server Key/data rahasia) jika terjadi kegagalan verifikasi atau error `500` saat memproses webhook.
  - **Get Status reconciliation job:** Tambahkan cron/worker berkala backend untuk memeriksa transaksi `pending_payment` yang hampir kedaluwarsa apabila webhook gagal terkirim.
  - **Rate limit endpoint fallback:** Terapkan rate limiting pada endpoint checkout & sinkronisasi bila fitur Sandbox/admin reconciliation tetap dipertahankan.
  - **Ownership booking dan perbaikan `ISSUE-04`:** Hubungkan `booking.user_id` dengan akun user yang login saat checkout (`ISSUE-04`) dan sediakan token akses tamu yang aman sehingga kontrol kepemilikan tidak bergantung pada pencocokan `buyer_email` di Sandbox.
  - **Jangan menggunakan localhost sebagai Notification URL:** Server Midtrans tidak dapat mengirim callback HTTP/HTTPS ke `127.0.0.1` atau `localhost`.
- **Catatan Arsitektur:**
  - **`GET /api/checkout/<booking_code>` sudah read-only:** Endpoint `GET` detail pesanan tidak memanggil API Midtrans maupun mengubah tabel `bookings`, `tickets`, `transactions`, `paid_at`, atau `ticket_types.sold_count`.
  - **Sinkronisasi eksplisit menggunakan `POST`:** Pemeriksaan status manual ke Midtrans Get Status API dipindahkan ke `POST /api/checkout/<booking_code>/sync-payment-status`.
  - **Webhook tetap mekanisme utama Production:** Endpoint sinkronisasi `POST` otomatis diblokir (`HTTP 403`) apabila `MIDTRANS_IS_PRODUCTION=true` atau `FLASK_ENV=production`.
  - **Fallback `POST` tidak boleh menjadi endpoint publik tanpa perlindungan:** Saat ini dilindungi kewajiban JWT (`401`), pemeriksaan kepemilikan (`user_id` cocok atau `admin`), pembatasan guest (`user_id is None` karena `ISSUE-04` hanya diizinkan untuk `admin` atau email pembeli yang cocok pada lingkungan Sandbox/dev), dan selalu mengambil status langsung dari Midtrans menggunakan Server Key Backend (tidak pernah mempercayai payload status dari Frontend).

---

## ISSUE-11 — Ketiadaan Atribut Kategori / Genre pada Model Event dan Endpoint Katalog Publik

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P4` (Low)
- **Komponen:** Event Model (`app/models/event.py`) & Public Catalog (`app/modules/public/event_routes.py`)
- **Endpoint:** `GET /api/public/events`
- **File terkait:**
  - `app/models/event.py` (Baris 10-30)
  - `app/modules/public/event_routes.py` (Baris 24-84)
- **Gejala:**
  Fitur penyaringan event berdasarkan kategori (misalnya Musik, Olahraga, Teater, Seni, Festival) di frontend tidak berfungsi di sisi server dan seluruh event tetap ditampilkan tanpa filter kategori yang dipilih.
- **Akar masalah:**
  1. Model `Event` di `app/models/event.py` hanya memiliki kolom `event_type` (`single` atau `festival`) dan `city`. Tidak ada kolom `category` atau `genre`.
  2. Pada `app/modules/public/event_routes.py:38-44`, controller hanya membaca query parameter `city`, `event_type`, `search`, `date_from`, dan `date_to`.
  3. Query parameter `category` yang dikirimkan oleh Frontend Next.js atau Mobile tidak dikenali dan diabaikan.
- **Dampak pada Next.js:**
  Filter kategori pada halaman eksplorasi event (`web/app/events/page.jsx`) tidak memfilter data event sesuai genre.
- **Dampak pada mobile:**
  Filter chip kategori (Live Concert, Music Festival, Pop, Rock, EDM) pada layar `(tabs)/events.tsx` hanya dapat memfilter sebagian via `event_type`, sementara genre spesifik tidak terfilter di backend.
- **Langkah reproduksi:**
  Kirim request `GET /api/public/events?category=Music` dan amati bahwa query SQL yang dieksekusi Flask tidak memfilter kolom kategori.
- **Saran perbaikan:**
  1. Tambahkan kolom `category = db.Column(db.String(50), nullable=True, default="Music")` pada model `Event`.
  2. Jalankan migrasi database (`flask db migrate -m "add category to events"`).
  3. Tambahkan filter `if category: query = query.filter(Event.category.ilike(f"%{category}%"))` pada `list_public_events`.
- **Risiko perubahan:**
  Rendah hingga Sedang. Memerlukan migrasi skema tabel `events`.
- **Kriteria penerimaan:**
  Request `GET /api/public/events?category=Music` hanya mengembalikan event dengan kategori yang sesuai.
- **Bukti pengujian:**
  Inspeksi model pada `app/models/event.py` dan controller `app/modules/public/event_routes.py:38-50`.

---

## ISSUE-12 — Layanan Email Verifikasi & Reset Password Hanya Berupa Output Konsol Log (SMTP Belum Terpasang)

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P3` (Medium)
- **Komponen:** Authentication & Email Notification (`app/modules/auth/routes.py`)
- **Endpoint:**
  - `POST /api/auth/register`
  - `POST /api/auth/request-password-reset`
- **File terkait:**
  - `app/modules/auth/routes.py` (Baris 76-87, 235-246)
- **Gejala:**
  Saat pengguna melakukan registrasi akun atau meminta reset password, email verifikasi dan tautan ubah sandi tidak pernah dikirimkan ke kotak masuk email pengguna.
- **Akar masalah:**
  Pada `app/modules/auth/routes.py`, pengiriman email nyata belum dihubungkan ke server SMTP (seperti Flask-Mail atau SendGrid):
  ```python
  # Baris 76-81 auth/routes.py:
  # TODO: Kirim email verification (SMTP belum setup)
  # Untuk sekarang, cuma log token-nya
  print("EMAIL VERIFICATION (Log Only - SMTP belum setup)")
  print(f"To: {new_user.email}")
  print(f"Verification Link: {verification_link}")
  ```
  Hal serupa terjadi pada permintaan reset password (baris 235-245).
- **Dampak pada Next.js:**
  Pengguna web tidak dapat melakukan aktivasi mandiri dari email nyata; verifikasi email harus di-bypass atau mengandalkan link di log server.
- **Dampak pada mobile:**
  Pengguna mobile harus memasukkan token verifikasi secara manual yang disalin dari log terminal pengembang.
- **Langkah reproduksi:**
  1. Registrasi akun baru dengan email aktif.
  2. Periksa kotak masuk / spam email; tidak ada pesan masuk dari sistem TicketWave.
  3. Periksa terminal Flask; token tercetak pada stdout log.
- **Saran perbaikan:**
  1. Konfigurasi ekstensi email (misal `Flask-Mailman` atau integrasi SMTP).
  2. Ambil kredensial SMTP (`MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`) dari environment variable.
  3. Kirimkan email HTML responsif yang berisi tautan aktivasi dan reset password resmi.
- **Risiko perubahan:**
  Rendah.
- **Kriteria penerimaan:**
  Email verifikasi dan reset password terkirim secara nyata ke alamat email penerima.
- **Bukti pengujian:**
  Inspeksi kode sumber pada `app/modules/auth/routes.py:76-87` dan `app/modules/auth/routes.py:235-246`.

---

## ISSUE-13 — Status Code Mismatch pada Handler Helper `error_response` di Berbagai Route & Decorator

- **Status:** `OPEN` (Bug Logika & Kepatuhan REST API)
- **Prioritas:** `P3` (Medium)
- **Komponen:** Response Helper (`app/utils/responses.py`) & Decorator / Controller Routes
- **Endpoint:**
  - Seluruh rute berproteksi `@role_required` dan `@email_verified_required`
  - `GET /api/public/events/<event_id>`
  - `POST /api/checkout`
  - `GET /api/checkout/<booking_code>`
- **File terkait:**
  - `app/utils/responses.py` (Baris 23-28)
  - `app/utils/decorators.py` (Baris 47-50, 83-86)
  - `app/modules/public/event_routes.py` (Baris 73, 80, 126, 130)
  - `app/modules/ticket/checkout_routes.py` (Baris 70, 75, 164, 202)
- **Gejala:**
  Saat terjadi kesalahan akses terlarang (Forbidden) atau data tidak ditemukan (Not Found), server Flask mengembalikan status HTTP `400 Bad Request` bukannya `403 Forbidden` atau `404 Not Found`. Nilai angka status code (403 atau 404) justru masuk ke dalam field JSON `errors`.
- **Hasil aktual:**
  Header HTTP respons: `HTTP/1.1 400 Bad Request`  
  Body JSON:
  ```json
  {
    "success": false,
    "message": "Access forbidden. Required role: admin",
    "errors": 403
  }
  ```
- **Hasil yang diharapkan:**
  Header HTTP respons: `HTTP/1.1 403 Forbidden`  
  Body JSON:
  ```json
  {
    "success": false,
    "message": "Access forbidden. Required role: admin",
    "errors": null
  }
  ```
- **Akar masalah:**
  Definisi fungsi pada `app/utils/responses.py:23`:
  ```python
  def error_response(message="Terjadi kesalahan", errors=None, status_code=400):
      return jsonify({
          "success": False,
          "message": message,
          "errors": errors,
      }), status_code
  ```
  Fungsi ini memiliki urutan parameter posisi: `(message, errors, status_code)`.  
  Namun pada pemanggil di `decorators.py:47`:
  ```python
  return error_response(f"Access forbidden. Required role: {', '.join(roles)}", 403)
  ```
  Angka `403` dikirim sebagai argumen posisi kedua, sehingga masuk ke parameter `errors = 403`, sedangkan parameter `status_code` tidak terisi dan menggunakan nilai default `400`.  
  Pola pemanggilan keliru yang sama terjadi pada:
  - `decorators.py:83`: `error_response("Email verification required...", 403)` -> status code 400.
  - `public/event_routes.py:126`: `error_response("Event not found", 404)` -> status code 400.
  - `public/event_routes.py:130`: `error_response("Event is not available for sale", 403)` -> status code 400.
  - `checkout_routes.py:70`: `error_response("Event not found", 404)` -> status code 400.
  - `checkout_routes.py:164`: `error_response("Booking not found", 404)` -> status code 400.
- **Dampak pada Next.js:**
  Interceptor API pada frontend membaca seluruh error otorisasi dan resource not found sebagai error 400 generik, menyulitkan branching logika (misal redirect ke login saat 401/403).
- **Dampak pada mobile:**
  Mobile client `src/api/client.ts` harus mengecek keyword teks di dalam payload karena status HTTP yang diterima selalu 400.
- **Langkah reproduksi:**
  1. Login dengan akun role `user`.
  2. Akses endpoint admin `GET /api/agencies`.
  3. Periksa header status respons yang dikembalikan server: menghasilkan status 400 bukannya 403.
- **Saran perbaikan:**
  Ubah pemanggilan di seluruh file tersebut dengan keyword argument eksplisit:
  ```python
  # SEBELUM:
  return error_response("Access forbidden", 403)

  # SESUDAH:
  return error_response("Access forbidden", status_code=403)
  ```
  Atau perbarui signature `error_response` pada `app/utils/responses.py` menjadi:
  ```python
  def error_response(message="Terjadi kesalahan", status_code=400, errors=None):
  ```
- **Risiko perubahan:**
  Rendah. Memastikan kepatuhan terhadap standar kode status HTTP RESTful.
- **Kriteria penerimaan:**
  Respons server untuk akses terlarang mengirimkan status code HTTP 403, dan data tidak ditemukan mengirimkan status code HTTP 404.
- **Bukti pengujian:**
  Inspeksi kode sumber pada `app/utils/responses.py:23` vs `app/utils/decorators.py:47-50` dan `app/modules/public/event_routes.py:126`.

---

## ISSUE-14 — Ketiadaan Endpoint Pembaruan Profil Pengguna (`PUT /api/auth/me`)

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P3` (Medium)
- **Komponen:** Authentication & User Profile (`app/modules/auth/routes.py`)
- **Endpoint:** Ketiadaan `PUT /api/auth/me` atau `PATCH /api/auth/me`
- **File terkait:**
  - `app/modules/auth/routes.py` (Baris 163-178)
  - `app/models/user.py`
- **Gejala:**
  Pengguna tidak dapat memperbarui data profil akun mereka (seperti nama lengkap dan nomor telepon) dari halaman pengaturan profil.
- **Hasil aktual:**
  Backend hanya menyediakan `GET /api/auth/me`. Request HTTP `PUT` atau `PATCH` ke `/api/auth/me` menghasilkan `HTTP 405 Method Not Allowed`.
- **Hasil yang diharapkan:**
  Tersedia endpoint `PUT /api/auth/me` terproteksi `@jwt_required()` yang memungkinkan pengguna memperbarui nama dan nomor telepon aktif.
- **Akar masalah:**
  Rute otentikasi hanya mengimplementasikan pembacaan data profil (`get_current_user`), tanpa fungsi pemutakhiran record `User` di basis data.
- **Dampak pada Next.js:**
  Formulir edit profil pada `web/app/user/profile/page.jsx` dan `settings/page.jsx` tidak dapat memutakhirkan data ke database.
- **Dampak pada mobile:**
  Tab Profil aplikasi mobile (`(tabs)/profile.tsx`) hanya menampilkan identitas akun secara read-only.
- **Langkah reproduksi:**
  Kirimkan request `PUT http://localhost:5000/api/auth/me` dengan Authorization header dan body `{"name": "Nama Baru"}`. Server merespons `405 Method Not Allowed`.
- **Saran perbaikan:**
  Tambahkan handler pembaruan profil di `app/modules/auth/routes.py`:
  ```python
  @auth_bp.put("/me")
  @jwt_required()
  def update_current_user():
      current_user_id = get_jwt_identity()
      user = User.query.get(int(current_user_id))
      data = request.get_json() or {}
      if "name" in data: user.name = data["name"].strip()
      if "phone" in data: user.phone = data["phone"].strip()
      db.session.commit()
      return success_response("Profile updated successfully", user.to_dict())
  ```
- **Risiko perubahan:**
  Rendah.
- **Kriteria penerimaan:**
  Request `PUT /api/auth/me` berhasil memperbarui data nama/telepon dan mengembalikan data pengguna termutakhir dengan status 200 OK.
- **Bukti pengujian:**
  Inspeksi kode sumber pada `app/modules/auth/routes.py:163-178` (hanya ada dekorator `@auth_bp.get("/me")`).

---

## ISSUE-15 — Ketiadaan Mekanisme Revokasi Sesi Server-Side & Endpoint Logout (`POST /api/auth/logout`)

- **Status:** `OPEN` (Keterbatasan Desain API)
- **Prioritas:** `P3` (Medium)
- **Komponen:** Authentication & Token Revocation (`app/modules/auth/routes.py`)
- **Endpoint:** Ketiadaan `POST /api/auth/logout`
- **File terkait:**
  - `app/modules/auth/routes.py`
  - `app/config/extensions.py` (jwt init)
- **Gejala:**
  Saat pengguna melakukan logout di peramban atau aplikasi mobile, token JWT yang masih aktif tidak dicabut atau diblokir di sisi server. Token yang telah dicuri atau disadap tetap dapat digunakan untuk mengakses data hingga masa kedaluwarsa alami berakhir (1 jam untuk access token, 30 hari untuk refresh token).
- **Hasil aktual:**
  Backend tidak menyediakan endpoint `POST /api/auth/logout`. Logout hanya dilakukan secara pasif di klien dengan menghapus token dari `localStorage` atau `AsyncStorage`.
- **Hasil yang diharapkan:**
  Tersedia endpoint `POST /api/auth/logout` yang mencatat JTI (*JWT ID*) token ke dalam tabel blocklist (misalnya menggunakan Redis atau tabel basis data `token_blocklist`), serta callback `@jwt.token_in_blocklist_loader` untuk menolak setiap token yang telah di-logout.
- **Akar masalah:**
  Backend menerapkan autentikasi JWT murni stateless tanpa memelihara daftar token yang dibatalkan.
- **Dampak pada Next.js:**
  Pengguna yang telah logout dari satu browser tidak dapat membatalkan sesi aktif di perangkat lain secara terpusat.
- **Dampak pada mobile:**
  Aksi logout pada aplikasi mobile tidak mengirimkan instruksi pembatalan sesi ke backend.
- **Langkah reproduksi:**
  1. Login dan salin `access_token`.
  2. Lakukan logout di aplikasi.
  3. Kirim request `GET /api/auth/me` menggunakan token yang disalin tadi melalui cURL/Postman.
  4. Server tetap mengembalikan `HTTP 200 OK` (token masih diakui valid).
- **Saran perbaikan:**
  1. Implementasikan model `TokenBlocklist(id, jti, created_at)`.
  2. Daftarkan callback JWT blocklist pada `app/config/extensions.py`:
     ```python
     @jwt.token_in_blocklist_loader
     def check_if_token_revoked(jwt_header, jwt_payload):
         jti = jwt_payload["jti"]
         return TokenBlocklist.query.filter_by(jti=jti).first() is not None
     ```
  3. Tambahkan endpoint `POST /api/auth/logout` di `app/modules/auth/routes.py` yang menyimpan JTI token ke basis data.
- **Risiko perubahan:**
  Sedang. Memerlukan penambahan tabel database atau store in-memory.
- **Kriteria penerimaan:**
  Setelah memanggil `POST /api/auth/logout`, token yang bersangkutan langsung ditolak dengan status HTTP 401 saat digunakan pada request berikutnya.
- **Bukti pengujian:**
  Inspeksi rute otentikasi pada `app/modules/auth/routes.py` menunjukkan tidak adanya handler `logout` dan tidak ada konfigurasi blocklist loader pada `app/config/extensions.py`.

---
*Dokumentasi ini dikonsolidasikan dan dipelihara di TicketWave-FE sebagai referensi utama audit integrasi.*
