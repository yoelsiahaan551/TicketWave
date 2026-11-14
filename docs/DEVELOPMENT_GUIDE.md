# Panduan Pengembangan (Development Guide)

Panduan untuk menjalankan dan mengembangkan aplikasi Web dan Mobile pada repository TicketWave-FE.

---

## 1. Menjalankan Web Frontend (`web/`)

### Prasyarat:
- Node.js versi 18+ (disarankan Node.js 20+)
- npm versi 10+

### Langkah-langkah:
1. Pindah ke direktori `web`:
   ```bash
   cd web
   ```
2. Instalasi dependensi (jika belum):
   ```bash
   npm install
   ```
3. Konfigurasi Environment:
   Pastikan file `.env.local` tersedia dengan isi:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
   ```
   (Template tersedia pada `.env.example`).
4. Jalankan development server:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.
5. Verifikasi Lint dan Build:
   ```bash
   npm run lint
   npm run build
   ```

---

## 2. Menjalankan Mobile App (`mobile/`)

### Prasyarat:
- Expo CLI / Node.js
- Aplikasi **Expo Go** pada smartphone Android/iOS atau emulator (Android Studio / Xcode).

### Langkah-langkah:
1. Pindah ke direktori `mobile`:
   ```bash
   cd mobile
   ```
2. Instalasi dependensi (jika belum):
   ```bash
   npm install
   ```
3. Menjalankan Expo development server:
   ```bash
   npm start
   ```
   - Tekan `a` untuk membuka di Android Emulator.
   - Tekan `i` untuk membuka di iOS Simulator.
   - Tekan `w` untuk membuka di web browser.
   - Atau pindai QR Code menggunakan aplikasi **Expo Go** di smartphone fisik Anda (pastikan smartphone berada dalam satu jaringan Wi-Fi dengan komputer host).
4. Verifikasi TypeScript:
   ```bash
   npx tsc --noEmit
   ```

---

## 3. Menjalankan Backend Lokal (`TicketWave-BE/`)

Untuk menguji integrasi end-to-end secara lokal:
1. Buka terminal terpisah di folder `TicketWave-BE`:
   ```bash
   cd TicketWave-BE
   ```
2. Aktifkan virtual environment:
   - Windows PowerShell: `.\venv\Scripts\Activate.ps1`
   - Linux/macOS: `source venv/bin/activate`
3. Jalankan server Flask:
   ```bash
   python run.py
   ```
   Server backend akan aktif di `http://127.0.0.1:5000`.
