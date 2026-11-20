# DOKUMENTASI MASALAH & PANDUAN DEVELOPMENT MOBILE TICKETWAVE

**Lokasi File:** `C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\MOBILE_ISSUES.md`  
**Komponen:** Mobile Expo (`TicketWave-FE/Mobile`) & Backend Flask (`TicketWave-BE`)  
**Terakhir Diperbarui:** 21 November 2026  

## 1. Tujuan Dokumen

Dokumen ini mencatat masalah teknis lingkungan development saat menjalankan **TicketWave Mobile (Expo Go)** pada **iPhone fisik** dan **Android fisik** menggunakan topologi **Personal Hotspot dari HP** (di mana laptop tersambung ke hotspot HP melalui interface Wi-Fi Windows), beserta bukti teknis, hasil diagnosis terpisah antara **Flask (`5000`)** dan **Metro (`8081`)**, perbaikan auto-deteksi URL API Mobile, dan panduan singkat bagi pengembang.

Pada penggunaan normal (mode LAN), cukup jalankan Backend dengan `python run.py` dan Mobile dengan:

```powershell
cd C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\Mobile
npx expo start
```

Mobile secara otomatis membentuk URL API `http://<IP-laptop>:5000/api` dari host dev server Metro yang benar-benar dipakai perangkat di Expo Go (tanpa hardcode `192.168.1.4`, tanpa perlu menyetel `EXPO_PUBLIC_API_URL` manual, dan tanpa `--tunnel` pada penggunaan normal setelah blocker Windows Firewall `node.exe` pada bagian 5 dibersihkan).

---

## 2. Quick Start Mobile Fisik

### Prasyarat Sekali Jalan (Wajib — PowerShell Administrator)

Audit aturan Windows Defender Firewall menemukan terdapat **2 aturan `Inbound Block` aktif pada profil `Private`** untuk `C:\program files\nodejs\node.exe`. Dalam Windows Firewall, aturan `Block` eksplisit **selalu mengalahkan** aturan `Allow` (termasuk `TicketWave Expo Metro 8081`). Jalankan perintah berikut **satu kali** di **PowerShell (Run as Administrator)** untuk mengubah blokir `node.exe` di profil `Private` menjadi `Allow`:

```powershell
Get-NetFirewallRule | Where-Object {
  $_.Action -eq 'Block' -and $_.Profile -match 'Private' -and
  ($_ | Get-NetFirewallApplicationFilter).Program -like '*\nodejs\node.exe'
} | Set-NetFirewallRule -Action Allow
```

Setelah aturan di atas diperbarui, buka **dua terminal PowerShell biasa** dan biarkan keduanya **tetap terbuka** selama development.

### Terminal 1 — Backend

```powershell
cd C:\Users\LOQ\Documents\TicketWave\TicketWave-BE
.\venv\Scripts\Activate.ps1
python run.py
```
*Terminal ini harus tetap terbuka (`0.0.0.0:5000`).*

### Terminal 2 — Mobile iPhone/Android Fisik (Mode Normal LAN)

```powershell
cd C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\Mobile
npx expo start
```
*(Tidak perlu menyetel `EXPO_PUBLIC_API_URL` dan tidak perlu `--tunnel` pada mode LAN normal. Aplikasi Mobile otomatis mendeteksi `<IP-laptop>` dari koneksi dev server Expo Go dan mengarahkan API ke `http://<IP-laptop>:5000/api`).*

**Verifikasi Cepat dari Browser HP (Safari/Chrome) Sebelum Scan QR:**
1. Buka `http://<IP-laptop>:5000/health` -> harus tampil `{"service":"TicketWave Backend","status":"ok"}`.
2. Buka `http://<IP-laptop>:8081/status` -> harus tampil `packager-status:running`.
3. Buka **Expo Go** di HP, tekan **Go back** / **Go home** jika masih di layar lama, lalu **pindai QR terbaru** dari terminal `npx expo start` (jangan membuka entri lama dari daftar *Recent*).

### Opsi Cadangan (Fallback Tunnel — Hanya Jika Personal Hotspot Mengisolasi Port 8081)

Apabila setelah aturan `Block Private` Windows Firewall pada `node.exe` diubah menjadi `Allow` ternyata Personal Hotspot HP masih memblokir koneksi klien-ke-klien pada port `8081`, gunakan `--tunnel` disertai override `EXPO_PUBLIC_API_URL` (karena domain tunnel `*.exp.direct` hanya meneruskan Metro `8081`, bukan Flask `5000`):

```powershell
cd C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\Mobile
$env:EXPO_PUBLIC_API_URL="http://<IP-laptop>:5000/api"
npx expo start --tunnel
```

---

## 3. Ringkasan Status Issue

| ID | Judul Issue | Klasifikasi | Prioritas | Status |
|---|---|---|:---:|:---:|
| **MOBILE-ISSUE-01** | Request API Mobile ke Backend lokal mengalami timeout | Local Backend Binding / Windows Firewall / LAN Networking | **P1** *(dev lokal)* | **RESOLVED** |
| **MOBILE-ISSUE-02** | `npx expo start` mode LAN timeout di HP fisik & ketergantungan pada `EXPO_PUBLIC_API_URL` manual | Windows Firewall `Block` Precedence (`node.exe`) / Expo Go LAN Host Resolution | **P1** *(dev lokal)* | **CODE RESOLVED — FIREWALL BLOCKER IDENTIFIED (PHYSICAL DEVICES NOT TESTED)** |
| **MOBILE-ISSUE-03** | Alur pembayaran Mobile belum mengikuti integrasi Midtrans Sandbox Backend | Mobile Checkout / Midtrans Sandbox / Order Sync | **P1** | **PARTIALLY VERIFIED — ANDROID EMULATOR & EXPO WEB PASS, PHYSICAL ANDROID/IOS NOT TESTED** |
| **MOBILE-ISSUE-04** | Gap integrasi Guest, User, Officer, Admin, Expo Web SSR hydration, serta aturan acara selesai | Auth Role Isolation / Officer QR / Admin CRUD / Midtrans Return / Backend Parity | **P1** | **MOBILE RESOLVED & EXPO WEB E2E PASS — PHYSICAL DEVICES NOT TESTED & BE BLOCKERS OPEN** |

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

## 5. MOBILE-ISSUE-02 — `npx expo start` Mode LAN Timeout di HP Fisik & Auto-Deteksi URL API dari Host Dev Server

- **Status:** `CODE RESOLVED — FIREWALL BLOCKER IDENTIFIED (PHYSICAL DEVICES NOT TESTED)`
- **Klasifikasi:** Windows Defender Firewall Explicit `Block` Precedence (`node.exe`) / Expo Go LAN Host Auto-Resolution

### Gejala
Ketika menjalankan `npx expo start` dalam mode LAN (`exp://192.168.1.4:8081`), Expo Go pada HP fisik menampilkan:
- `"There was a problem running the requested project."`
- `"The request timed out."`
- Sementara itu, pada saat yang sama HP fisik (`192.168.1.6`) **berhasil** mengakses Backend Flask pada `http://192.168.1.4:5000/health` dan `GET /api/events` (`HTTP 200`).

### Diagnosis Terpisah: Flask (`5000`) vs Metro (`8081`)

Pemeriksaan terpisah terhadap jaringan, listener socket, manifest Metro, dan aturan Windows Defender Firewall pada laptop (`Wi-Fi`, SSID `Mulia_Sihaan`, IP `192.168.1.4/24`, `NetworkCategory: Private`) membuktikan:

1. **Pemeriksaan Listener (Bukan Masalah Listener):**
   - **Flask (`PID 9956`, `python3.11.exe run.py`):** Listen pada `0.0.0.0:5000`. Probe lokal `GET http://192.168.1.4:5000/health` -> `HTTP 200 {"service":"TicketWave Backend","status":"ok"}` dan `GET http://192.168.1.4:5000/api/public/events` -> `HTTP 200` (`total_items: 11`).
   - **Metro (`PID 26096`, `C:\Program Files\nodejs\node.exe`, `npx expo start`):** Listen pada `:::8081` (dual-stack IPv4 + IPv6). Probe lokal pada IP LAN `192.168.1.4`:
     - `GET http://192.168.1.4:8081/status` -> `HTTP 200 packager-status:running`.
     - `GET http://192.168.1.4:8081` (`expo-platform: ios` & `expo-platform: android`) -> `HTTP 200` dengan `extra.expoClient.hostUri = "192.168.1.4:8081"` dan `launchAsset.url = "http://192.168.1.4:8081/node_modules/expo-router/entry.bundle?..."`.
     - Kompilasi bundel `entry.bundle` untuk `platform=ios` (`14.29 MB`) dan `platform=android` (`14.42 MB`) keduanya menghasilkan `HTTP 200`.

2. **Akar Masalah Sebenarnya pada Port `8081` (Blocker Windows Defender Firewall pada `node.exe`):**
   - Meskipun aturan port `TicketWave Expo Metro 8081` (`Action: Allow`, `Profile: Private`, `Protocol: TCP`, `LocalPort: 8081`) sudah ada, audit seluruh aturan inbound Windows Firewall menemukan **dua aturan `Block` aktif pada profil `Private`** yang menargetkan program `C:\program files\nodejs\node.exe` (proses yang menjalankan Metro `8081`):
     ```text
     Action=Block | Profile=Private | Enabled=True | DisplayName=Node.js JavaScript Runtime | Proto=TCP | Port=Any | Prog=C:\program files\nodejs\node.exe | Name=TCP Query User{06B0E63A-3D56-4C18-ADDA-2370B3C51B59}C:\program files\nodejs\node.exe
     Action=Block | Profile=Private | Enabled=True | DisplayName=Node.js JavaScript Runtime | Proto=UDP | Port=Any | Prog=C:\program files\nodejs\node.exe | Name=UDP Query User{4B2C884F-FDB3-4B74-9490-1234B5A96B9F}C:\program files\nodejs\node.exe
     ```
   - Sebaliknya, `python3.11.exe` hanya memiliki aturan `Block` pada profil `Public` dan **tidak memiliki aturan `Block` pada profil `Private`**.
   - Dalam urutan evaluasi Windows Defender Firewall, **aturan `Block` eksplisit selalu dievaluasi sebelum dan mengalahkan aturan `Allow`**. Akibatnya, setiap paket TCP masuk dari HP fisik ke `192.168.1.4:8081` (`node.exe`) langsung dijatuhkan oleh Windows Firewall meskipun port `8081` sudah di-`Allow` dan profil Wi-Fi sudah `Private`, sedangkan trafik ke `192.168.1.4:5000` (`python3.11.exe`) diizinkan masuk.

3. **Perbaikan Firewall (Menghapus Blocker `node.exe` di Profil `Private`):**
   - Karena sesi terminal agen tidak berjalan dengan elevasi Administrator (`IS_ADMIN=False`), jalankan perintah berikut pada **PowerShell (Run as Administrator)**:
     ```powershell
     Get-NetFirewallRule | Where-Object {
       $_.Action -eq 'Block' -and $_.Profile -match 'Private' -and
       ($_ | Get-NetFirewallApplicationFilter).Program -like '*\nodejs\node.exe'
     } | Set-NetFirewallRule -Action Allow
     ```

### Perbaikan Kode Mobile: Auto-Deteksi URL API dari Host Dev Server (`npx expo start` Tanpa Override Manual)

Agar `npx expo start` cukup dijalankan tanpa menyetel `EXPO_PUBLIC_API_URL` manual dan tanpa hardcode `192.168.1.4`, konfigurasi API Mobile telah diperbarui pada:

1. **`mobile/src/constants/apiUrlResolver.ts` *(baru)*:**
   - Fungsi murni `extractLanDevHost(rawUri)` dan `resolveDefaultApiBaseUrl(input)` yang mengekstrak hostname/IP LAN dari URI dev server (`http://...`, `exp://...`, `host:port`, maupun IPv6 `[...]`) tanpa bergantung pada `new URL()` (yang terbatas pada custom scheme di Hermes).
   - Mengabaikan host loopback (`localhost`, `127.0.0.1`, `::1`, `0.0.0.0`), skema `file://`, serta domain proxy tunnel (`*.exp.direct`, `*.expo.direct`, `*.ngrok.io`, `*.ngrok-free.app`, `*.trycloudflare.com`, `*.loca.lt`) agar mode tunnel tanpa env override tidak membentuk URL tidak valid `http://<tunnel>:5000/api`.
   - Urutan prioritas ketat:
     1. Override eksplisit `EXPO_PUBLIC_API_URL` (untuk build produksi, `--tunnel`, atau server kustom).
     2. Host LAN dev server aktual saat development (`__DEV__ === true`) -> membentuk `http://<IP-laptop>:5000/api` secara dinamis.
     3. Fallback Android Emulator (`http://10.0.2.2:5000/api`).
     4. Fallback iOS Simulator / Web lokal (`http://127.0.0.1:5000/api`).
2. **`mobile/src/constants/Config.ts`:**
   - Mengumpulkan sumber URI dev server secara berurutan mulai dari host bundle aktual yang dipakai perangkat:
     1. `NativeModules.SourceCode.scriptURL` (URL bundle JS yang benar-benar diunduh perangkat dari Metro).
     2. `Constants.expoConfig?.hostUri`
     3. `Constants.manifest2?.extra?.expoClient?.hostUri`
     4. `Constants.manifest2?.launchAsset?.url`
     5. `Constants.expoGoConfig?.debuggerHost`
     6. `Constants.manifest?.debuggerHost`
     7. `Constants.experienceUrl` & `Constants.linkingUri`
   - Mengekspor `isExplicitEnvApiUrlConfigured()` dan `getApiBaseUrlSourceLabel()`.
   - Bebas dari hardcode `192.168.1.4` (`0` kemunculan di seluruh `mobile/src` dan `mobile/app`).
3. **`mobile/src/api/client.ts` & `mobile/app/settings.tsx`:**
   - `MobileApiClient.init()` selalu menghitung ulang `getDefaultApiBaseUrl()` dan memastikan `EXPO_PUBLIC_API_URL` yang disetel eksplisit tidak tertimpa oleh URL lama di `AsyncStorage`, sambil tetap mendukung override manual dari layar Pengaturan ketika `EXPO_PUBLIC_API_URL` tidak disetel.
   - Layar `app/settings.tsx` menyinkronkan URL aktif beserta label sumbernya setelah `api.init()` selesai.

### Hasil Verifikasi

- **Unit Test Resolver (`11/11 PASS`, exit code `0`):**
  - Menguji resolusi LAN iPhone via `SourceCode.scriptURL` (`http://172.20.10.3:8081/...` -> `http://172.20.10.3:5000/api`), LAN Android via `hostUri` (`192.168.43.12:8081` -> `http://192.168.43.12:5000/api`), skema `exp://`, override `EXPO_PUBLIC_API_URL` (dev & prod), penolakan host tunnel `*.exp.direct` / `*.ngrok-free.app`, fallback Android Emulator `10.0.2.2:5000/api`, fallback iOS Simulator `127.0.0.1:5000/api`, build produksi (`isDev: false`), platform Web (`localhost` vs LAN), dan verifikasi `0` hardcode `192.168.1.4`.
- **Pemeriksaan Statis & Bundel Mobile:**
  - `npx tsc --noEmit`: **Exit code `0`** (`0` error).
  - `npm run lint` (`expo lint`): **Exit code `0`** (`0` error, `0` warning).
  - `npx expo export --platform web`: **Exit code `0`**.
  - Live Metro (`http://192.168.1.4:8081`, dijalankan dengan `npx expo start` tanpa `EXPO_PUBLIC_API_URL` dan tanpa `--tunnel`): manifest iOS & Android menyajikan `hostUri: "192.168.1.4:8081"`, dan bundel JS iOS & Android terbukti memuat `extractLanDevHost`, `resolveDefaultApiBaseUrl`, serta `collectDevServerUris`.
- **Status Verifikasi Perangkat Fisik (Dilaporkan Terpisah):**
  - **iPhone fisik:** `NOT TESTED` — Tidak ada perangkat iPhone fisik yang terhubung langsung ke lingkungan eksekusi agen, dan aturan Windows Firewall `Block Private` pada `C:\program files\nodejs\node.exe` memerlukan eksekusi perintah PowerShell Administrator oleh pengguna terlebih dahulu.
  - **Android fisik:** `NOT TESTED` — `adb devices -l` tidak menampilkan perangkat Android fisik yang terhubung, dan aturan Windows Firewall `Block Private` pada `C:\program files\nodejs\node.exe` memerlukan eksekusi perintah PowerShell Administrator oleh pengguna terlebih dahulu.

### Langkah Verifikasi Pengguna pada iPhone & Android Fisik Setelah Fix Firewall

1. Jalankan perintah PowerShell Administrator pada bagian **Prasyarat Sekali Jalan** di atas untuk mengubah 2 aturan `Block Private` pada `C:\program files\nodejs\node.exe` menjadi `Allow`.
2. Pastikan Backend berjalan (`python run.py`) dan dari PowerShell biasa yang baru di folder `C:\Users\LOQ\Documents\TicketWave\TicketWave-FE\Mobile`, jalankan persis:
   ```powershell
   npx expo start
   ```
   *(tanpa menyetel `EXPO_PUBLIC_API_URL` dan tanpa `--tunnel`).*
3. Dari browser di **iPhone fisik** dan **Android fisik**, buka:
   - `http://<IP-laptop>:5000/health` -> pastikan merespons `{"service":"TicketWave Backend","status":"ok"}`.
   - `http://<IP-laptop>:8081/status` -> pastikan merespons `packager-status:running`.
4. Pindai QR terbaru di **Expo Go**, pastikan katalog event dari Backend termuat dan login berhasil, lalu tutup aplikasi Expo Go dan buka kembali dengan memindai QR terbaru sementara kedua server tetap berjalan.
5. Jika setelah langkah 1 dilakukan ternyata `http://<IP-laptop>:8081/status` masih tidak dapat dibuka dari browser HP saat memakai Personal Hotspot (akibat isolasi klien pada firmware hotspot HP), gunakan opsi cadangan `--tunnel` disertai `$env:EXPO_PUBLIC_API_URL="http://<IP-laptop>:5000/api"`.

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
| **iPhone fisik** | Otomatis `http://<IP-laptop>:5000/api` dari host LAN Expo Go | `npx expo start` *(normal LAN)*; `--tunnel` + `EXPO_PUBLIC_API_URL` sebagai cadangan |
| **Android fisik** | Otomatis `http://<IP-laptop>:5000/api` dari host LAN Expo Go | `npx expo start` *(normal LAN)*; `--tunnel` + `EXPO_PUBLIC_API_URL` sebagai cadangan |
| **Android Emulator** | `http://10.0.2.2:5000/api` (fallback otomatis jika loopback) atau IP LAN | `npx expo start` |
| **iOS Simulator** | `http://127.0.0.1:5000/api` (memerlukan macOS) | `npx expo start` |

**Catatan:**
- Pada mode LAN normal (`npx expo start`), iPhone dan Android fisik otomatis membentuk URL API `http://<IP-laptop>:5000/api` dari alamat host Metro yang dipakai perangkat tanpa hardcode `192.168.1.4` dan tanpa perlu menyetel `EXPO_PUBLIC_API_URL`.
- Jika memakai mode cadangan `--tunnel`, barulah `EXPO_PUBLIC_API_URL` wajib diisi (`http://<IP-laptop>:5000/api`) karena host tunnel `*.exp.direct` hanya meneruskan port Metro (`8081`).
- Windows tidak menyediakan iOS Simulator.

---

## 8. Checklist Diagnosis Singkat

- [ ] **1. Pastikan aturan `Block Private` Windows Firewall pada `node.exe` sudah diubah ke `Allow`:** Jalankan perintah PowerShell Administrator pada Bagian 2 jika port `8081` timeout dari HP.
- [ ] **2. Pastikan kedua terminal tetap terbuka:** Terminal Backend (`python run.py`) dan terminal Metro (`npx expo start`) harus tetap berjalan.
- [ ] **3. Uji `/health` (port 5000) dan `/status` (port 8081) secara terpisah dari browser HP:**
  - `http://<IP-LAPTOP>:5000/health` -> `{"service":"TicketWave Backend","status":"ok"}`
  - `http://<IP-LAPTOP>:8081/status` -> `packager-status:running`
- [ ] **4. Hindari daftar Recent di Expo Go:** Tekan *Go back* / *Go home* di Expo Go dan pindai QR terbaru.
- [ ] **5. Pastikan izin Local Network di iPhone aktif:** Aktifkan **iOS Settings -> Privacy & Security -> Local Network -> Expo Go**.
- [ ] **6. Jangan gunakan `127.0.0.1` atau `localhost` pada HP fisik:** Gunakan auto-deteksi LAN (`http://<IP-laptop>:5000/api`) untuk HP fisik dan `10.0.2.2` untuk Android Emulator.

---

## 9. Catatan Production

- Expo Go merupakan lingkungan development.
- Aplikasi production tidak membutuhkan Metro, QR, atau terminal Expo.
- Backend production nantinya harus menggunakan URL server online.

---

## 10. MOBILE-ISSUE-04 — Penyelarasan Integrasi Mobile dengan Next.js & Backend Flask Aktual

- **Status:** `MOBILE RESOLVED & EXPO WEB E2E PASS — PHYSICAL DEVICES NOT TESTED & BE BLOCKERS OPEN`
- **Terakhir Diverifikasi:** `21 November 2026`

### Gap Mobile yang Diselesaikan
1. **Expo Web Hydration (`Mobile/app/+html.tsx`) & Render Warning (`Mobile/app/(tabs)/events.tsx`):**
   - Menambahkan `useServerDocumentContext()` (`htmlAttributes`, `bodyAttributes`, `headNodes`, `bodyNodes`) pada `app/+html.tsx` agar stylesheet React Native Web dan skrip bundel klien terinjeksi saat rendering server Expo (`web.output: "server"`).
   - Membungkus kondisi string kosong menjadi `Boolean(...)` pada `app/(tabs)/events.tsx` sehingga peringatan SSR `Unexpected text node: . A text node cannot be a child of a <View>.` hilang.
2. **Autentikasi, Pemisahan Sesi Role, & Registrasi (`storage.ts`, `client.ts`, `AuthContext.tsx`, `login.tsx`, `register.tsx`, `admin/_layout.tsx`, `(tabs)/_layout.tsx`):**
   - Pemisahan penyimpanan sesi (`sessionStorage` web saat *Ingat saya* nonaktif vs `AsyncStorage` saat aktif), `sessionVersion` + single-flight `refreshToken()` untuk mencegah balapan sesi lintas role, pembersihan sesi lama sebelum login baru, dukungan internal `?next=` redirect, serta validasi nomor telepon numerik ketat `10–20` digit di `register.tsx` agar selaras dengan `RegisterSchema` Backend.
   - Proteksi role aktif di UI: `/(tabs)` mengarahkan `officer` ke `/officer`; `/order/[id]` dan `/payment/*` menampilkan guard `"Sesi Role Tidak Sesuai"` jika dibuka `officer`; `/admin` dan `/officer` menolak `user` dengan tampilan `403`.
3. **Katalog Single/Festival, Checkout Anti-Duplikat, & Callback Midtrans (`events.tsx`, `EventCard.tsx`, `event/[id].tsx`, `checkout.tsx`, `PaymentReturnHandler.tsx`, `app/payment/{finish,unfinish,error}.tsx`):**
   - Sinkronisasi query kategori/tipe dari Landing -> `/(tabs)/events`, toggle filter tanggal `date_from`/`date_to`, pengurutan konser tunggal bertanggal sebelum festival tanpa `event_date`, detail festival + lineup per hari, perhitungan fallback diskon `effectiveTicketPrice()` ketika API katalog mengembalikan `final_price: null` (`ISSUE-08`), serta guard event berakhir.
   - Lock anti-duplikat booking pada `checkout.tsx`, dukungan route callback `/payment/finish`, `/payment/unfinish`, dan `/payment/error`, countdown `expired_at` real-time pada `/order/[id]`, dan gating QR ketat berbasis kelayakan Backend (`isTicketQrEligible` pada `order/[id].tsx` & `TicketCard.tsx`).
4. **Officer Scanner, Validasi, & Check-In (`officer/{scan,validation,index,history,events}.tsx`):**
   - Menghapus konversi `.toUpperCase()` dan `autoCapitalize="characters"` agar token QR peka huruf besar-kecil (`qr_token`) utuh.
   - Memperbaiki helper badge status (`getOfficerStatusBadgeVariant`) sehingga `TIDAK VALID` tampil sebagai badge merah (`danger`), bukan hijau.
   - Konfirmasi check-in aman pada Web & Native, format waktu Asia/Jakarta (`WIB`), penanganan konflik `HTTP 409` (`SUDAH DIGUNAKAN`) dengan waktu check-in awal & nama petugas, serta auto-refresh berbasis `useFocusEffect`.
5. **Admin CRUD & Fase Harga (`src/api/endpoints.ts`, `app/admin/*`):**
   - Penambahan `fetchTicketPhaseDetail` (`GET /api/phases/<phase_id>`) untuk hidrasi form Edit fase, daftar event -> detail agensi/event terintegrasi, nested ticket types & phases saat pembuatan event, serta preview harga diskon.

### Ringkasan Hasil Uji Terisolasi (`21 November 2026`)
Seluruh data uji memakai prefiks `[TEST-MOBILE]` dan telah dibersihkan kembali; 5 booking demo eksisting di `TicketWave-BE/instance/dev.db` dipastikan tetap utuh.

| Modul / Skenario | Platform | Hasil | Ringkasan Bukti |
|---|---|---:|---|
| **Flow A — Guest, Katalog Single/Festival, Checkout & Batal** | Expo Web | **PASS** | Filter Festival -> Detail Festival 3 Hari (`/event/12`) -> Single Concert -> Checkout -> URL `app.sandbox.midtrans.com` resmi -> kembali ke booking sama tanpa duplikat (`Menunggu Pembayaran`, timer 15 menit, `QR Nonaktif`) -> Batalkan (`Dibatalkan`). |
| **Flow B — Register, Verifikasi Email, Midtrans Sandbox VA, GET vs Sync, QR Aktif** | Expo Web | **PASS** | Validasi telepon gagal ditolak -> Register + login -> Verifikasi email profil (`Terverifikasi`) -> Checkout `virtual_account` -> bayar nyata di `simulator.sandbox.midtrans.com` (Permata VA) -> `GET` read-only tetap `pending_payment` -> klik `"Periksa Status Pembayaran"` mengubah status ke `Dibayar` (`Virtual Account Permata`), QR aktif di detail pesanan & `Tiket Saya`. |
| **Flow C — Officer Role Isolation, Token Mixed-Case, Badge Merah, Check-In, Duplikat 409, WIB** | Expo Web | **PASS** | `/payment/finish` redirect bersih; `officer` diblokir dari User tabs & `/order/[id]`; input `INVALID-999` berbadge merah (`TIDAK VALID`); input `qr_token` mixed-case utuh -> `VALID` tanpa check-in -> Check-In `CHECK-IN SELESAI` (`... WIB`) -> scan ulang `SUDAH DIGUNAKAN` (`... WIB`); `/officer/history` & `/officer` auto-refresh. |
| **Flow D — Admin Agency/Event/Phases CRUD, `/health`, & Role 403** | Expo Web | **PASS** | Agency Create/Detail/Edit/Delete; Event Create (nested type+phase)/Detail/Edit/Status/Delete; Phase Edit (`GET /api/phases/<id>`) + preview diskon + Add/Delete; `/admin/settings` `/health` ONLINE; `/admin/users` fallback jujur; role `user` ditolak `403` pada `/admin` & `/officer`. |
| **Uji Aturan Acara Selesai (Temp DB Copy Terisolasi)** | Backend Flask (`test_client`) | **BLOCKED (BE)** | Salinan temp DB (`event_id=2` diubah ke `status="finished"`, `event_date` kemarin): `POST /api/scan/validate` tetap mengembalikan HTTP 200 `VALID` dan `POST /api/scan/check-in` tetap HTTP 200 `CHECK-IN SELESAI` (status tiket berubah ke `used`). Validasi penolakan pasca-acara belum diimplementasikan di `scan_routes.py`. |

### Rincian Sub-Fitur Officer
| Sub-Fitur | Status Aktual | Catatan |
|---|---|---|
| **Camera Scan** | `PARTIALLY VERIFIED` (Web UI fallback PASS; kamera fisik `NOT TESTED`) | Di Expo Web headless Chrome menampilkan komponen viewfinder + fallback izin kamera tanpa crash dan langsung dapat memakai input manual; pemindaian optik kamera HP fisik belum diuji. |
| **Manual Input** | **PASS** (Expo Web) | Menerima kode tiket & `qr_token` peka huruf besar-kecil tanpa memaksa huruf kapital. |
| **Validation** | **PASS** (Expo Web) | `POST /api/scan/validate` membaca tiket valid (`VALID`) maupun invalid (`TIDAK VALID` badge merah) tanpa mengubah status menjadi `used`. |
| **Check-In** | **PASS** (Expo Web) | `POST /api/scan/check-in` mencatat waktu check-in & petugas dalam WIB. |
| **Duplicate Check-In** | **PASS** (Expo Web) | Pengiriman ulang QR mengembalikan penolakan konflik (`SUDAH DIGUNAKAN`) dengan waktu check-in awal WIB. |
| **Post-Event Check-In** | **FAIL / BLOCKED AT BACKEND** | Mobile memblokir pembelian event selesai (`isEventPast` / `isEventPurchasable`), namun QR pass (`isTicketQrEligible`) bergantung pada status Backend (`booking.status === 'paid'`, `ticket.status === 'valid'`, & `qr_token`), sementara Backend `POST /api/scan/validate` & `POST /api/scan/check-in` masih meloloskan tiket event `finished` / tanggal lampau (`HTTP 200`). |

### Status Pengujian per Platform
| Platform | Status | Cakupan Bukti |
|---|---|---|
| **Expo Web (`localhost:8081`)** | **PASS** (seluruh flow non-kamera & non-upload Cloudinary) | E2E lengkap Guest, User (Midtrans Sandbox Permata VA), Officer (manual token mixed-case, validation, check-in, 409, WIB), dan Admin CRUD + `/health` (`21 November 2026`). |
| **Android Emulator** | **PARTIALLY VERIFIED (sesi sebelumnya)** | AVD `Medium_Phone_API_36.0` terdeteksi pada `adb devices`; alur checkout & Midtrans Sandbox Chrome Custom Tabs terverifikasi pada pengujian `MOBILE-ISSUE-03` (`20 November 2026`), belum di-retest ulang pasca penyesuaian parity terbaru. |
| **Physical Android** | **NOT TESTED** | Tidak ada perangkat Android fisik yang terhubung saat verifikasi serta aturan Windows Firewall `Block Private` pada `node.exe` (`MOBILE-ISSUE-02`) memblokir port Metro `8081`; manifest LAN `192.168.1.4:8081` (`hostUri`) terverifikasi via HTTP. |
| **Physical iPhone** | **NOT TESTED** | Tidak ada perangkat iPhone fisik / simulator macOS yang terhubung serta blocker Firewall `node.exe` `8081` (`MOBILE-ISSUE-02`); manifest LAN `192.168.1.4:8081` (`hostUri`) terverifikasi via HTTP. |

### Blocker Backend & Lingkungan yang Masih Terbuka
1. **Upload Media (`ISSUE-03`):** `POST /api/agencies/<id>/logo`, `/api/events/<id>/poster`, `/api/events/<id>/banner` masih gagal di Backend tanpa kredensial Cloudinary valid.
2. **Endpoint Akun/Manajemen yang Belum Ada (`ISSUE-04`, `ISSUE-05`, `ISSUE-06`, `ISSUE-07`, `ISSUE-11`, `ISSUE-12`, `ISSUE-14`, `ISSUE-15`):** Tidak ada `GET /api/checkout/my-bookings`, `GET /api/users`, agregasi omzet Admin, penugasan gate Officer, filter kategori event di BE, SMTP email aktif, `PUT /api/auth/me`, maupun `POST /api/auth/logout`.
3. **Kalkulasi Harga Katalog Publik (`ISSUE-08`):** `GET /api/public/events` dan `GET /api/public/events/<id>` masih memanggil `calculate_final_price(float, int)` (`price_from`/`final_price: null` saat fase diskon aktif; Mobile melakukan kalkulasi ulang defensif sementara `POST /api/checkout` di BE sudah memiliki fallback `ticket_type.id`).
4. **Webhook Midtrans Localhost (`ISSUE-10`):** Webhook server-to-server `/api/checkout/payment/notification` terblokir di localhost tanpa HTTPS publik; di Sandbox diverifikasi via `POST .../sync-payment-status`.
5. **Validasi Pasca-Acara pada Officer Scan:** Backend `scan_routes.py` belum menolak validasi dan check-in untuk tiket acara yang sudah `finished` atau tanggalnya telah berakhir.
6. **Windows Firewall Metro Port `8081` (`MOBILE-ISSUE-02`):** Masih memerlukan eksekusi perintah PowerShell Administrator untuk mengubah `Block Private` `node.exe` menjadi `Allow` sebelum uji langsung di Android/iPhone fisik.
