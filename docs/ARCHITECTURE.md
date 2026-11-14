# TicketWave Architecture Overview

TicketWave merupakan platform manajemen dan pemesanan tiket konser yang memisahkan aplikasi ke dalam tiga domain utama:

```
┌─────────────────────────────────────────────────────────────┐
│                      TICKETWAVE ECOSYSTEM                   │
└─────────────────────────────────────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Web Client  │       │ Mobile App   │       │ Backend API  │
│   (Next.js)  │       │ (React Native│       │   (Flask)    │
│    `web/`    │       │   / Expo)    │       │ Terpisah di  │
│              │       │  `mobile/`   │       │ repository   │
│              │       │              │       │   tersendiri │
└──────┬───────┘       └──────┬───────┘       └──────▲───────┘
       │                      │                      │
       └──────────────────────┴──────────────────────┘
                   REST API & JSON Contract
                    http://127.0.0.1:5000/api
```

---

## 1. Web Application (`web/`)
- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS.
- **Port Default**: `http://localhost:3000`
- **Fitur Utama**:
  - Landing Page publik & eksplorasi event
  - Autentikasi Pengguna & Gate Officer (Hybrid: API Backend + Dummy fallback)
  - Dashboard Admin: Manajemen Event, Agency, User, Analytics
  - Dashboard Gate Officer: Validasi Tiket, Scanner QR Code (kamera), Kasir On-The-Spot
  - Portal Pengguna: Detail Event, Checkout, Riwayat Pesanan, E-Tiket Saya

## 2. Mobile Application (`mobile/`)
- **Framework**: Expo SDK 58, React Native 0.88, Expo Router.
- **Dukungan Platform**: Android & iOS (via Expo Go / Standalone Build), Web preview.
- **Fitur Utama**:
  - Tampilan daftar dan detail konser
  - Riwayat pembelian tiket dan tampilan QR Code tiket
  - Manajemen profil dan daftar favorit
  - Auto-resolusi IP host LAN saat dijalankan pada perangkat fisik via Expo Go.

## 3. Backend API
- **Framework**: Python Flask, SQLAlchemy, SQLite/PostgreSQL.
- **Lokasi**: Dikelola pada repository terpisah (di komputer lokal tersimpan di `TicketWave-BE/`).
- **Endpoint Default**: `http://127.0.0.1:5000/api`
