# DOKUMENTASI MASALAH & PANDUAN DEVELOPMENT MOBILE TICKETWAVE

**Lokasi File:** `C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\MOBILE_ISSUES.md`  
**Komponen:** Mobile Expo (`TicketWave-FE/Mobile`) & Backend Flask (`TicketWave-BE`)  
**Terakhir Diperbarui:** 20 November 2026  

## 1. Tujuan Dokumen

Dokumen ini mencatat masalah teknis lingkungan development saat menjalankan **TicketWave Mobile (Expo Go)** pada **iPhone fisik** dan **Android fisik** menggunakan topologi **Personal Hotspot dari HP** (di mana laptop tersambung ke hotspot HP melalui interface Wi-Fi Windows), beserta bukti teknis, solusi yang sudah terbukti, dan panduan singkat bagi pengembang.

cd C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\Mobile
$env:EXPO_PUBLIC_API_URL="http://192.168.1.4:5000/api"
npx expo start --tunnel

---

## 2. Quick Start Mobile Fisik

Buka **dua terminal PowerShell terpisah** dan biarkan keduanya **tetap terbuka** selama development.

### Terminal 1 — Backend

```powershell
cd C:\Users\LOQ\Documents\TicketWave\TicketWave-BE
.\venv\Scripts\Activate.ps1
python run.py
```
*Terminal ini harus tetap terbuka.*

### Terminal 2 — Mobile iPhone/Android Fisik

```powershell
cd C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\Mobile
$env:EXPO_PUBLIC_API_URL="http://192.168.1.4:5000/api"
npx expo start --tunnel
```
*(Ganti `192.168.1.4` jika IP laptop berubah setelah hotspot disambungkan ulang. Tambahkan `--clear` hanya jika cache bermasalah: `npx expo start --clear --tunnel`. Terminal ini juga harus tetap terbuka).*

**Setelah QR tampil di Terminal 2:**
1. Buka **Expo Go** di HP.
2. Jika masih berada di layar error, tekan **Go back** atau **Go home**.
3. **Pindai QR terbaru** dari terminal (iPhone dan Android fisik dapat memindai QR tunnel yang sama).
4. Tunggu proses bundling selesai hingga aplikasi terbuka.
5. **Jangan membuka proyek LAN lama dari daftar Recent** di Expo Go.

---

## 3. Ringkasan Status Issue

| ID | Judul Issue | Klasifikasi | Prioritas | Status |
|---|---|---|:---:|:---:|
| **MOBILE-ISSUE-01** | Request API Mobile ke Backend lokal mengalami timeout | Local Backend Binding / Windows Firewall / LAN Networking | **P1** *(dev lokal)* | **RESOLVED** |
| **MOBILE-ISSUE-02** | Expo Go gagal membuka kembali proyek melalui Metro LAN | Expo Go / Metro Bundler / Personal Hotspot Network Topology | **P1** *(dev lokal)* | **MITIGATED — TUNNEL WORKAROUND VERIFIED** |
| **MOBILE-ISSUE-03** | Alur pembayaran Mobile belum mengikuti integrasi Midtrans Sandbox Backend | Mobile Checkout / Midtrans Sandbox / Order Sync | **P1** | **PARTIALLY VERIFIED — ANDROID PASS, IOS NOT TESTED** |

---

## 4. MOBILE-ISSUE-01 — Request API Mobile ke Backend Lokal Mengalami Timeout

- **Status:** `RESOLVED`
- **Klasifikasi:** Local Backend Binding / Windows Firewall / LAN Networking

### Gejala Awal
- Request dari aplikasi Mobile ke `http://192.168.1.4:5000/api` (`GET /api/public/events/cities`, `GET /api/public/events`, `POST /api/auth/login`) gagal dengan `timeout` atau `ConnectException`:
  ```text
  [API Error] /auth/login http://192.168.1.4:5000/api fetch failed: The request timed out.
  ```

### Akar Masalah
Masalah bukan berasal dari form login, `AuthContext`, kredensial akun, endpoint autentikasi, atau Expo Router, melainkan:
1. Backend (`TicketWave-BE/run.py`) sebelumnya hanya bind ke `127.0.0.1:5000` (`localhost` atau `127.0.0.1` pada HP menunjuk ke HP itu sendiri, bukan ke laptop).
2. Windows Firewall pada laptop belum mengizinkan koneksi masuk pada port TCP `5000` (profil jaringan pada interface Wi-Fi Windows yang tersambung ke hotspot sebelumnya berstatus `Public`).
3. Setelah `run.py` diubah agar bind ke `0.0.0.0:5000` dan port `5000` diizinkan melalui Windows Firewall pada profil `Private`, perangkat fisik berhasil mengakses Backend.

### Perbaikan yang Diterapkan
1. `TicketWave-BE/run.py` diperbarui agar bind ke `0.0.0.0:5000` secara default (`FLASK_HOST=0.0.0.0`, `FLASK_PORT=5000`, `FLASK_DEBUG=false`).
2. Profil jaringan pada interface Wi-Fi Windows yang terhubung ke hotspot diubah dari `Public` menjadi `Private`.
3. Dibuat rule Windows Firewall khusus profil `Private` (tanpa mematikan Firewall dan tanpa membuka profil `Public`):
   - **Name:** `TicketWave Flask Backend 5000`
   - **Direction:** `Inbound` | **Protocol:** `TCP` | **Local Port:** `5000` | **Action:** `Allow` | **Profile:** `Private` | **Enabled:** `True`
4. Mobile menggunakan URL API laptop:
   ```text
   http://192.168.1.4:5000/api
   ```

### Bukti Penyelesaian
- `GET http://127.0.0.1:5000/health` -> **HTTP 200**
- `GET http://192.168.1.4:5000/health` -> **HTTP 200**
- `GET http://192.168.1.4:5000/api/public/events` -> **HTTP 200**
- **Log Backend menerima request nyata dari perangkat fisik (`192.168.1.6`)**:
  ```text
  192.168.1.6 - - "GET /api/events?page=1&per_page=50 HTTP/1.1" 200
  ```
  Log ini membuktikan bahwa `python run.py` sudah bind ke `0.0.0.0:5000`, rule Firewall port `5000` sudah bekerja, dan perangkat fisik dapat mengakses Backend Flask.
- Endpoint login (`POST /api/auth/login` & `GET /api/auth/me`) untuk role `user`, `admin`, dan `officer` melalui IP LAN -> **HTTP 200**.

### Mengapa Perubahan `run.py` (`M run.py`) Harus Dipertahankan
Perubahan pada `TicketWave-BE/run.py` **harus dipertahankan** jika pengembang ingin menjalankan Backend cukup dengan:
```powershell
python run.py
```
Fungsi perubahan pada `run.py`:
- `host=0.0.0.0` membuat Flask menerima koneksi dari laptop maupun perangkat lain dalam jaringan lokal/hotspot.
- `port=5000` menentukan port Backend lokal.
- `FLASK_HOST`, `FLASK_PORT`, dan `FLASK_DEBUG` membuat launcher development dapat dikonfigurasi tanpa mengubah kode lagi.

Jika `run.py` dikembalikan ke versi lama yang hanya memanggil `app.run(debug=True, port=5000)`, maka Backend kembali bind ke `127.0.0.1` dan perangkat fisik tidak dapat mengakses API, kecuali menjalankan perintah panjang setiap kali:
```powershell
python -m flask --app run:app run --host=0.0.0.0 --port=5000
```
Karena itu, status `M run.py` adalah **perubahan yang memang diperlukan**, bukan file liar atau error.

---

## 5. MOBILE-ISSUE-02 — Expo Go Gagal Membuka Kembali Proyek Melalui Metro LAN

- **Status:** `MITIGATED — TUNNEL WORKAROUND VERIFIED` *(belum ditulis RESOLVED penuh sebelum aplikasi terbukti selesai bundling 100% dan tampil kembali secara konsisten)*
- **Klasifikasi:** Expo Go / Metro Bundler / Personal Hotspot Network Topology

### Gejala
Ketika membuka proyek melalui mode LAN (`exp://192.168.1.4:8081`), Expo Go menampilkan:
- `"There was a problem running the requested project."`
- `"The request timed out."`
- `"Opening project... This is taking much longer than it should."`
- Backend tetap dapat diakses oleh perangkat fisik (`192.168.1.6` -> HTTP 200), sehingga ini **bukan error Backend API**.
- Terminal Metro LAN aktif pada `exp://192.168.1.4:8081`, tetapi belum menampilkan proses `iOS Bundled`, sehingga iPhone belum berhasil mencapai atau mengunduh bundle Metro melalui mode LAN.

### Analisis
1. **Perbedaan fungsi port `5000` dan port `8081`:**
   - **Port `5000`** digunakan oleh **Backend Flask**.
   - **Port `8081`** digunakan oleh **Metro Bundler** untuk mengirim bundle JavaScript ke Expo Go.
   - Keberhasilan akses ke Backend (`5000`) tidak otomatis membuktikan Metro (`8081`) dapat dijangkau melalui mode LAN.
2. **Penambahan Rule Firewall Port `8081`:**
   - **Name:** `TicketWave Expo Metro 8081`
   - **Direction:** `Inbound` | **Protocol:** `TCP` | **Local Port:** `8081` | **Profile:** `Private` | **Action:** `Allow` | **Enabled:** `True`
   - Walaupun rule port `8081` sudah dibuat, mode LAN masih tidak stabil.
3. **Faktor Topologi Personal Hotspot (Faktor Lingkungan yang Paling Mungkin):**
   - Laptop tersambung ke **Personal Hotspot dari HP** melalui interface Wi-Fi Windows.
   - Mode LAN membutuhkan koneksi langsung dari HP ke Metro Bundler di laptop pada port `8081`. Pada topologi Personal Hotspot, routing atau discovery menuju perangkat klien (laptop) untuk trafik Metro Bundler dapat tidak stabil atau dibatasi — hal ini dicatat sebagai **faktor lingkungan yang paling mungkin**, bukan penyebab mutlak tunggal.
   - Selain itu, Expo Go dapat menyimpan alamat proyek LAN lama di daftar **Recent**, serta perubahan IP setelah reconnect hotspot atau cache sesi lama dapat memicu timeout saat proyek dibuka kembali.
   - Terminal PowerShell yang menjalankan Metro harus tetap terbuka (sedangkan PowerShell Administrator untuk konfigurasi Firewall boleh ditutup setelah rule tersimpan).

### Mitigasi yang Terbukti
1. Gunakan **Expo Tunnel** agar pengiriman bundle Metro tidak bergantung pada routing langsung mode LAN, dan tetapkan URL API Backend secara eksplisit karena alamat tunnel hanya digunakan untuk Metro (`8081`), bukan Backend Flask (`5000`):
   ```powershell
   $env:EXPO_PUBLIC_API_URL="http://192.168.1.4:5000/api"
   npx expo start --tunnel
   ```
   *(Gunakan `--clear` hanya ketika cache bermasalah, bukan setiap kali menjalankan: `npx expo start --clear --tunnel`).*
2. Tekan **Go back** atau **Go home** di Expo Go dan pindai QR tunnel terbaru. Jangan membuka proyek LAN lama dari daftar **Recent**.

### Bukti Mitigasi
- URL Metro berubah dari `exp://192.168.1.4:8081` menjadi `exps://...on.expo.app`.
- Setelah QR tunnel dipindai, terminal Metro mulai menampilkan proses bundling iOS:
  ```text
  iOS node_modules\expo-router\entry.js ... 31.7%
  ```
- Bukti tersebut memastikan iPhone berhasil mencapai Metro melalui tunnel dan proses bundling mulai berjalan (belum diklaim bundling selesai 100% atau seluruh UI PASS sampai terverifikasi tampil konsisten).

---

## 6. MOBILE-ISSUE-03 — Alur Pembayaran Mobile Belum Mengikuti Integrasi Midtrans Sandbox Backend

- **Status:** `PARTIALLY VERIFIED — ANDROID PASS, IOS NOT TESTED`
- **Klasifikasi:** Mobile Checkout / Midtrans Sandbox / Order Sync

### Akar Masalah
Sebelum penyelarasan:
1. `mobile/app/checkout.tsx` memakai enum metode pembayaran tidak sesuai Backend (`transfer_bank`, `qris_ewallet`, `credit_card`), memilih `transfer_bank` secara default, tidak mengirimkan `payment_method` pada `POST /api/checkout`, dan tidak memiliki lock sinkron anti double-tap.
2. Mobile membuka `payment_url` melalui `Alert.alert` + `Linking.openURL` tanpa validasi domain resmi Midtrans (`app.sandbox.midtrans.com`), tanpa `expo-web-browser`, dan tanpa navigasi otomatis ke halaman detail pesanan setelah browser pembayaran dibuka/ditutup.
3. `mobile/app/order/[id].tsx` belum menyediakan tombol `"Periksa Status Pembayaran"` yang memanggil `POST /api/checkout/<booking_code>/sync-payment-status` dengan guard autentikasi/ownership dan penanganan error (`401`, `403`, `502`, `504`).
4. `mobile/src/utils/storage.ts` masih menyimpan helper `removeSavedBookingEntry` yang tidak terpakai.

### File Mobile yang Diubah
- `mobile/src/types/index.ts` — menambahkan `PaymentMethodId`, field wajib `payment_method` pada `CheckoutPayload`, status `denied`/`refunded`/`failed` pada `BookingStatus`, dan tipe `SyncPaymentStatusResponse`.
- `mobile/src/utils/payment.ts` *(baru)* — mendefinisikan `PAYMENT_METHOD_OPTIONS`, `getOfficialPaymentUrl()` (validasi ketat URL `https://app.sandbox.midtrans.com/snap/v[1-4]/...`, menolak URL dummy `booking_code`), `openMidtransPaymentBrowser()` (`expo-web-browser`), `canUserSyncBookingPayment()`, dan `getPaymentMethodLabel()`.
- `mobile/src/api/endpoints.ts` — menambahkan `syncBookingPaymentStatus(bookingCode)` yang memanggil `POST /checkout/<booking_code>/sync-payment-status` dengan body kosong `{}`.
- `mobile/src/components/checkout/PaymentMethodSelector.tsx` *(baru)* — komponen pemilihan metode pembayaran React Native (`accessibilityRole="radiogroup"` & `"radio"`, `accessibilityState` selected/checked, tinggi >= 64 px, ikon check + label `"Dipilih"`, tanpa emoji atau shadow biru berlebihan).
- `mobile/src/components/common/Button.tsx` — menambahkan prop `loadingTitle` (untuk `"Memproses Pesanan…"` / `"Memeriksa Status…"`), `accessibilityRole`, `accessibilityState`, `accessibilityLabel`, dan `testID`.
- `mobile/src/components/common/Badge.tsx` & `mobile/src/utils/formatters.ts` — mendukung label & badge untuk status `denied`, `refunded`, dan `failed`.
- `mobile/src/utils/storage.ts` — menghapus helper `removeSavedBookingEntry`.
- `mobile/app/checkout.tsx` — default metode pembayaran `null`, validasi lengkap form + metode pembayaran, tombol `"Lanjut ke Pembayaran — Rp…"`, pencegahan double-tap (`useRef` + `submitting`), pengiriman `payment_method`, validasi `payment_url`, pembukaan browser Midtrans via `expo-web-browser`, lalu navigasi ke `/order/<booking_code>`.
- `mobile/app/order/[id].tsx` — `GET /api/checkout/<booking_code>` tetap read-only (termasuk saat pull-to-refresh & `AppState` resume), tombol `"Periksa Status Pembayaran"` tampil khusus untuk user terautentikasi yang berhak saat `pending_payment`, double-tap lock, penanganan HTTP `401`/`403`/`502`/`504`, E-Ticket & QR hanya aktif setelah status `paid`, dan tombol bayar/sync/cancel otomatis hilang pada status selain `pending_payment`.
- `mobile/src/components/order/OrderCard.tsx` & `mobile/app/(tabs)/orders.tsx` — validasi `getOfficialPaymentUrl()`, pembukaan pembayaran via `expo-web-browser`, card dapat diketuk langsung ke `/order/<booking_code>`, refresh read-only saat fokus kembali, riwayat transaksi tetap dipertahankan, dan dipastikan tidak ada fitur hapus pesanan.

### Kontrak Pembayaran Mobile Aktual
- **Nilai `payment_method` pada `POST /api/checkout`:**
  - `transfer_bank` (*Transfer Bank*)
  - `virtual_account` (*Virtual Account*)
  - `qris` (*QRIS*)
- **Pembukaan `redirect_url` & Penggunaan `expo-web-browser`:**
  - `getOfficialPaymentUrl()` hanya menerima URL `https://app.sandbox.midtrans.com/snap/v[1-4]/(vtweb|redirection)/<token>` di mode Sandbox dan tidak pernah membentuk URL di sisi Mobile.
  - Dibuka via `WebBrowser.openBrowserAsync()` (`expo-web-browser`), menangani hasil `opened`, `dismissed`, `cancelled`, dan `error` tanpa pernah menganggap penutupan browser berarti lunas.
  - *Catatan perilaku Android Expo Go:* Pada peluncuran pertama Chrome yang menampilkan onboarding `FirstRunActivity`, menutup Custom Tab sempat memunculkan `HomeActivity` Expo Go di atas `ExperienceActivity`; kembali ke task aplikasi langsung menampilkan layar `/order/<booking_code>` dalam keadaan read-only.
- **Tombol Sinkronisasi & Sifat Read-Only `GET`:**
  - `"Periksa Status Pembayaran"` hanya muncul pada status `pending_payment` untuk user terautentikasi yang berhak (`admin`, `user_id` cocok, atau `user.email == buyer_email` pada booking `user_id=None` terkait `ISSUE-04`).
  - Memanggil `POST /api/checkout/<booking_code>/sync-payment-status` dengan body kosong `{}` (tanpa mengirim status `paid`), lalu mengambil ulang `GET /api/checkout/<booking_code>`.
  - `GET /api/checkout/<booking_code>` dipastikan 100% read-only (tidak mengubah status di database sebelum sinkronisasi ditekan).
- **Tidak Ada Fitur Hapus Pesanan:**
  - Seluruh halaman pesanan (`orders.tsx`, `order/[id].tsx`, `OrderCard.tsx`, `tickets.tsx`, `profile.tsx`, `storage.ts`) bebas dari tombol hapus, ikon trash, menu delete, swipe-to-delete, maupun request `DELETE` booking; `removeSavedBookingEntry` telah dihapus.

### Hasil Uji Midtrans Sandbox & Platform yang Diuji
- **Platform yang benar-benar diuji:** Runtime native **Android Emulator** (`Medium_Phone_API_36.0`, `emulator-5554`, Expo Go `58.0.5`, Chrome Custom Tabs) terhubung ke Backend Flask lokal (`http://10.0.2.2:5000/api`) dan Midtrans Sandbox nyata (`app.sandbox.midtrans.com` + `simulator.sandbox.midtrans.com`).
- **Platform yang tidak diuji secara native:** **iPhone fisik / iOS native** (Windows tidak menyediakan iOS Simulator; memerlukan verifikasi manual pengguna pada iPhone fisik).
- **Ringkasan hasil E2E Sandbox (prefix pembeli `E2E-MOBILE-MIDTRANS-VA-20261120`, email `user@example.com`):**
  - Double-tap pada `"Lanjut ke Pembayaran — Rp1.200.000"` hanya menghasilkan **1** request `POST /api/checkout` -> `booking_id = 109` (`TKTW-20261120-C6A259`), `payment_method = virtual_account`, status awal `pending_payment`.
  - Chrome Custom Tabs membuka `https://app.sandbox.midtrans.com/snap/v4/redirection/...`; Permata Virtual Account menghasilkan VA dummy Sandbox (masked: `324008******2887`).
  - Simulasi pembayaran pada `https://simulator.sandbox.midtrans.com/openapi/va/index?bank=permata` (`Amount to Pay: 1200000.00`) berhasil (`Simulated payment is successful.`).
  - Saat kembali ke detail pesanan Mobile sebelum sinkronisasi, `GET` read-only mempertahankan status `pending_payment` dan QR `QR Nonaktif`.
  - Setelah menekan `"Periksa Status Pembayaran"`, `booking_id = 109` berubah ke `paid` (`bank_transfer:permata`), `transaction_id = 3` menjadi `settlement`, `ticket_id = 121` (`TKT-9AFC0EFF`) menjadi `valid` dengan QR Modal aktif, pesanan tetap tampil di `Pesanan Saya` setelah refresh, dan `sold_count` tiket event #12 bertambah `2 -> 3` (terkonfirmasi pula pada Admin Detail Event: `Terjual 3/500`).
  - Quality check Mobile: `npm run lint` (exit `0`), `npx tsc --noEmit` (exit `0`), `npx expo export --platform web` (exit `0`), dan `0` kemunculan `MIDTRANS_SERVER_KEY` / `SB-Mid-server-` pada source maupun bundle.

### Hal yang Masih Dibutuhkan untuk Production
1. URL Backend HTTPS publik aktif untuk menerima webhook otomatis Midtrans (`POST /api/payment/midtrans/notification`) secara real-time tanpa bergantung pada endpoint fallback Sandbox `sync-payment-status` (yang otomatis memblokir `403` pada Production).
2. Konfigurasi kredensial Midtrans Production resmi (Server Key & Client Key Production di Backend `.env`, bukan di bundle Mobile, serta `EXPO_PUBLIC_MIDTRANS_IS_PRODUCTION=true` saat build rilis Production).
3. Verifikasi manual end-to-end pada perangkat **iPhone fisik (iOS native)** menggunakan `SFSafariViewController` (`expo-web-browser`).

---

## 7. Perbedaan Target Perangkat

| Target | URL API Backend Lokal | Cara Menjalankan Metro |
|---|---|---|
| **iPhone fisik** | IP LAN laptop, contoh `192.168.1.4` | `--tunnel` direkomendasikan |
| **Android fisik** | IP LAN laptop, contoh `192.168.1.4` | `--tunnel` direkomendasikan |
| **Android Emulator** | `10.0.2.2` | Mode lokal/LAN |
| **iOS Simulator** | Memerlukan macOS | Mode lokal |

**Catatan:**
- iPhone dan Android fisik dapat memindai QR tunnel yang sama.
- Jika Backend masih berada di laptop, HP tetap harus dapat menjangkau IP laptop (`http://192.168.1.4:5000/api`).
- IP `192.168.1.4` adalah IP laptop saat pengujian, bersifat dinamis, dan dapat berubah setelah Personal Hotspot disambungkan ulang.
- Windows tidak menyediakan iOS Simulator.

---

## 8. Checklist Diagnosis Singkat

- [ ] **1. Pastikan kedua terminal tetap terbuka:** Terminal Backend (`python run.py`) dan terminal Metro (`npx expo start --tunnel`) harus tetap berjalan.
- [ ] **2. Periksa IP laptop setelah hotspot disambungkan ulang:** Jalankan `ipconfig` di laptop untuk memastikan IP pada interface Wi-Fi Windows belum berubah dari nilai `$env:EXPO_PUBLIC_API_URL`.
- [ ] **3. Uji `/health` dari browser HP:** Buka `http://<IP-LAPTOP>:5000/health` di Safari/Chrome HP dan pastikan menghasilkan `{"service":"TicketWave Backend","status":"ok"}`.
- [ ] **4. Hindari daftar Recent di Expo Go:** Tekan *Go back* / *Go home* di Expo Go dan pindai QR tunnel terbaru.
- [ ] **5. Pastikan izin Local Network di iPhone aktif:** Aktifkan **iOS Settings -> Privacy & Security -> Local Network -> Expo Go**.
- [ ] **6. Jangan gunakan `127.0.0.1` atau `localhost` pada HP fisik:** Gunakan `10.0.2.2` untuk Android Emulator, dan gunakan IP laptop untuk HP fisik.

---

## 9. Catatan Production

- Expo Go merupakan lingkungan development.
- Aplikasi production tidak membutuhkan Metro, QR, atau terminal Expo.
- Backend production nantinya harus menggunakan URL server online.
