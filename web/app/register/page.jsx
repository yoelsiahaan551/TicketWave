"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthLayout from "@/app/components/auth/AuthLayout";

// ============================================================================
// LOGO
// - Dibiarkan "" => memakai logo "TW" (SVG) bawaan di file ini, SELALU muncul.
// - Kalau mau pakai file logo asli: simpan di folder /public lalu isi path-nya,
//   contoh: public/logo.png -> const LOGO_SRC = "/logo.png";
//   (kalau file tidak ketemu, otomatis balik ke logo SVG bawaan, tidak kosong)
// ============================================================================
const LOGO_SRC = "";

/* ------------------------------------------------------------------ */
/*  Animasi (CSS murni, tanpa dependency tambahan)                     */
/* ------------------------------------------------------------------ */
const animationStyles = `
@keyframes tw-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tw-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes tw-float {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(0, -28px, 0) scale(1.08); }
}
@keyframes tw-float-alt {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(24px, 20px, 0) scale(0.94); }
}
@keyframes tw-glow {
  0%   { transform: scale(0.8); opacity: 0.7; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes tw-logo-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes tw-wave {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes tw-progress {
  from { width: 0%; }
  to   { width: 100%; }
}
@keyframes tw-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes tw-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
@keyframes tw-spin {
  to { transform: rotate(360deg); }
}
@keyframes tw-splash-out {
  to { opacity: 0; visibility: hidden; transform: scale(1.04); }
}
@keyframes tw-pop {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
@keyframes tw-expand {
  from { opacity: 0; transform: translateY(-8px) scaleY(0.96); }
  to   { opacity: 1; transform: translateY(0) scaleY(1); }
}
@keyframes tw-draw {
  from { stroke-dashoffset: 260; }
  to   { stroke-dashoffset: 0; }
}
@keyframes tw-reveal {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes tw-logo-part {
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.tw-fade-up   { opacity: 0; animation: tw-fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.tw-fade-in   { opacity: 0; animation: tw-fade-in 0.6s ease forwards; }
.tw-float     { animation: tw-float 9s ease-in-out infinite; }
.tw-float-alt { animation: tw-float-alt 11s ease-in-out infinite; }
.tw-logo-bob  { animation: tw-logo-bob 3.2s ease-in-out infinite; }
.tw-shake     { animation: tw-shake 0.45s ease; }
.tw-pop       { animation: tw-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.tw-expand    { transform-origin: top; animation: tw-expand 0.35s ease forwards; }
.tw-splash-out { animation: tw-splash-out 0.6s ease forwards; }
.tw-draw-path {
  stroke-dasharray: 260;
  stroke-dashoffset: 260;
  animation: tw-draw 1.1s ease forwards 0.5s;
}
.tw-reveal {
  transform-box: fill-box;
  transform-origin: left center;
  animation: tw-reveal 1s cubic-bezier(0.65, 0, 0.35, 1) 0.15s both;
}
.tw-logo-part {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: tw-logo-part 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.tw-btn-shine {
  background-image: linear-gradient(110deg, #0080f2 0%, #06b6d4 45%, #22d3ee 55%, #0080f2 100%);
  background-size: 200% 100%;
}
.tw-btn-shine:hover:not(:disabled) { animation: tw-shimmer 1.6s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .tw-fade-up, .tw-fade-in, .tw-float, .tw-float-alt, .tw-logo-bob, .tw-shake,
  .tw-pop, .tw-expand, .tw-splash-out, .tw-btn-shine, .tw-draw-path, .tw-logo-part, .tw-reveal {
    animation: none !important;
    opacity: 1 !important;
    stroke-dashoffset: 0 !important;
  }
}
`;

/* Helper delay untuk stagger animasi */
const delay = (ms) => ({ animationDelay: `${ms}ms` });

/* ------------------------------------------------------------------ */
/*  Komponen kecil                                                     */
/* ------------------------------------------------------------------ */

/**
 * Logo TicketWave (huruf T bergelombang + W) — hasil trace dari logo asli,
 * jadi bentuknya sama persis. SVG satu bentuk (single path), tidak butuh file gambar.
 */
const LOGO_PATH =
  "M12.77 10.30C10.98 11.48 9.51 12.76 8.25 14.20C6.98 15.63 5.89 17.45 5.18 18.93C4.48 20.40 4.17 22.00 4.00 23.03C3.83 24.07 3.94 24.61 4.14 25.12C4.34 25.63 4.71 25.96 5.18 26.10C5.66 26.23 6.11 26.32 6.99 25.96C7.87 25.60 8.93 24.66 10.47 23.94C12.01 23.22 13.87 22.26 16.25 21.64C18.63 21.03 22.38 20.47 24.74 20.25C27.09 20.03 28.11 20.12 30.38 20.32C32.64 20.52 36.22 21.03 38.31 21.43C40.40 21.84 42.00 22.41 42.90 22.75C43.81 23.10 43.85 22.40 43.74 23.52C43.62 24.65 42.59 27.50 42.21 29.51C41.82 31.51 41.57 33.96 41.44 35.56C41.31 37.16 41.25 37.23 41.44 39.11C41.63 40.99 41.75 43.76 42.55 46.83C43.35 49.91 45.63 55.63 46.24 57.55C46.86 59.48 46.68 57.52 46.24 58.39C45.80 59.26 44.41 61.16 43.60 62.77C42.79 64.38 41.96 66.46 41.37 68.06C40.78 69.66 40.51 70.39 40.05 72.37C39.58 74.36 39.10 78.01 38.59 79.96C38.08 81.91 37.35 83.42 36.99 84.07C36.63 84.71 36.57 84.22 36.43 83.86C36.29 83.50 36.29 85.17 36.15 81.91C36.01 78.65 36.07 68.70 35.59 64.30C35.12 59.91 34.11 57.88 33.30 55.53C32.49 53.19 31.58 51.74 30.72 50.24C29.86 48.75 29.31 47.88 28.15 46.56C26.99 45.23 25.06 43.34 23.76 42.31C22.46 41.28 21.41 40.86 20.35 40.36C19.30 39.86 18.58 39.51 17.43 39.32C16.28 39.12 14.44 39.11 13.46 39.18C12.49 39.25 12.05 39.43 11.59 39.74C11.12 40.04 10.75 40.54 10.68 40.99C10.61 41.44 10.23 41.42 11.17 42.45C12.11 43.48 15.11 45.92 16.32 47.18C17.52 48.45 17.62 48.67 18.41 50.03C19.19 51.40 20.21 53.06 21.05 55.39C21.89 57.72 22.74 59.92 23.42 64.02C24.09 68.13 24.43 75.96 25.09 80.03C25.75 84.10 26.70 86.43 27.38 88.45C28.07 90.47 28.74 91.31 29.19 92.14C29.64 92.96 29.66 92.95 30.10 93.39C30.54 93.83 31.13 94.42 31.84 94.78C32.54 95.14 33.36 95.48 34.34 95.55C35.33 95.62 36.59 95.69 37.75 95.20C38.91 94.71 40.33 93.58 41.30 92.62C42.28 91.67 42.76 90.95 43.60 89.49C44.43 88.03 45.52 85.94 46.31 83.86C47.10 81.77 47.75 79.48 48.33 76.97C48.91 74.45 49.47 70.22 49.79 68.75C50.12 67.29 50.01 67.91 50.28 68.20C50.55 68.49 50.78 68.21 51.39 70.49C52.01 72.78 53.26 79.23 53.97 81.91C54.67 84.59 55.05 85.21 55.64 86.57C56.23 87.93 56.83 88.97 57.52 90.05C58.20 91.13 58.86 92.18 59.74 93.04C60.62 93.90 61.78 94.79 62.80 95.20C63.83 95.61 65.07 95.51 65.87 95.48C66.67 95.44 66.95 95.35 67.61 94.99C68.27 94.63 69.24 93.85 69.83 93.32C70.43 92.79 70.48 92.90 71.16 91.79C71.83 90.68 72.26 90.93 73.87 86.64C75.48 82.35 79.48 70.22 80.83 66.04C82.17 61.87 81.63 63.40 81.94 61.59C82.26 59.78 82.57 56.75 82.71 55.18C82.85 53.62 82.88 53.47 82.78 52.19C82.67 50.92 82.39 48.86 82.08 47.53C81.77 46.20 81.29 45.06 80.90 44.19C80.50 43.32 80.34 43.01 79.72 42.31C79.09 41.61 77.69 40.44 77.14 40.01C76.60 39.58 76.76 39.75 76.44 39.74C76.13 39.72 75.53 39.80 75.26 39.94C74.99 40.08 74.93 40.27 74.84 40.57C74.76 40.87 74.69 41.12 74.77 41.75C74.86 42.39 75.23 43.42 75.33 44.40C75.44 45.37 75.55 45.95 75.40 47.60C75.25 49.25 75.49 50.77 74.43 54.28C73.36 57.79 70.07 65.67 69.00 68.69C67.93 71.70 68.46 69.90 68.02 72.37C67.58 74.84 66.77 81.17 66.35 83.51C65.94 85.85 65.74 85.86 65.52 86.43C65.30 87.00 65.26 87.13 65.03 86.92C64.80 86.71 64.37 85.93 64.13 85.18C63.88 84.42 63.91 85.89 63.57 82.39C63.23 78.90 62.53 68.06 62.11 64.23C61.69 60.40 61.59 61.26 61.07 59.43C60.54 57.60 60.06 55.79 58.98 53.24C57.90 50.68 55.52 46.18 54.59 44.12C53.67 42.05 53.83 42.45 53.41 40.85C52.99 39.25 52.30 36.85 52.09 34.52C51.88 32.18 52.08 28.23 52.16 26.86C52.24 25.49 52.39 26.41 52.57 26.30C52.76 26.20 51.83 25.93 53.27 26.23C54.71 26.54 58.25 27.70 61.20 28.11C64.16 28.53 68.23 28.75 71.02 28.74C73.80 28.73 75.95 28.38 77.91 28.04C79.87 27.71 81.51 27.14 82.78 26.72C84.04 26.30 84.40 26.13 85.49 25.54C86.58 24.95 88.16 24.08 89.32 23.17C90.48 22.27 91.62 21.11 92.45 20.11C93.29 19.11 93.75 18.43 94.33 17.19C94.91 15.95 95.71 13.66 95.93 12.66C96.15 11.67 95.79 11.53 95.65 11.20C95.51 10.88 95.35 10.81 95.10 10.72C94.84 10.62 95.20 10.18 94.12 10.65C93.04 11.11 90.41 12.79 88.62 13.50C86.84 14.21 84.80 14.61 83.40 14.89C82.01 15.17 81.99 15.16 80.27 15.17C78.56 15.18 75.48 15.26 73.10 14.96C70.73 14.66 67.71 13.80 66.01 13.36C64.30 12.92 65.02 13.20 62.87 12.32C60.73 11.43 55.94 9.15 53.13 8.07C50.32 6.99 48.30 6.41 46.03 5.84C43.77 5.28 41.31 4.90 39.56 4.66C37.81 4.42 37.21 4.39 35.52 4.38C33.84 4.37 31.54 4.36 29.47 4.59C27.41 4.82 24.89 5.36 23.14 5.77C21.39 6.19 20.69 6.34 18.96 7.10C17.23 7.85 14.55 9.11 12.77 10.30Z";

function TicketWaveMark() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" role="img" aria-label="TicketWave">
      <defs>
        <linearGradient id="tw-grad" x1="22" y1="6" x2="72" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6ff0ff" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0080f2" />
        </linearGradient>
        {/* Efek "terungkap" dari kiri ke kanan saat logo muncul */}
        <clipPath id="tw-logo-clip">
          <rect className="tw-reveal" x="0" y="0" width="100" height="100" />
        </clipPath>
      </defs>

      <g clipPath="url(#tw-logo-clip)">
        <path d={LOGO_PATH} fill="url(#tw-grad)" />
      </g>
    </svg>
  );
}

/** Logo utama: pakai gambar kalau LOGO_SRC diisi & ada, selain itu SVG bawaan */
function Logo({ size = "h-28 w-28" }) {
  const [failed, setFailed] = useState(false);
  const useImage = Boolean(LOGO_SRC) && !failed;

  return (
    <div className={`relative ${size}`}>
      {/* glow berdenyut di belakang logo */}
      <span className="absolute inset-0 rounded-full bg-[#0080f2]/20 blur-xl" style={{ animation: "tw-glow 2.2s ease-out infinite" }} />
      <div className="tw-logo-bob relative h-full w-full drop-shadow-[0_4px_12px_rgba(0,128,242,0.25)]">
        {useImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={LOGO_SRC}
            alt="TicketWave"
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <TicketWaveMark />
        )}
      </div>
    </div>
  );
}

function SplashScreen({ leaving }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-slate-950 ${
        leaving ? "tw-splash-out" : ""
      }`}
    >
      <div className="tw-float pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-slate-800/20 blur-3xl" />
      <div className="tw-float-alt pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-slate-800/15 blur-3xl" />

      <div className="tw-pop relative z-10">
        <Logo size="h-28 w-28" />
      </div>

      <h1 className="tw-fade-up relative z-10 mt-8 text-4xl font-extrabold tracking-tight text-white" style={delay(250)}>
        TicketWave
      </h1>
      <p className="tw-fade-up relative z-10 mt-1 text-sm text-slate-400" style={delay(400)}>
        Discover Amazing Events
      </p>

      <div className="tw-fade-up relative z-10 mt-5 flex items-end gap-1.5" style={delay(550)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-[#0080f2]"
            style={{ animation: `tw-wave 1s ease-in-out ${i * 0.12}s infinite` }}
          />
        ))}
      </div>

      <div className="tw-fade-in relative z-10 mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-white/10" style={delay(300)}>
        <div
          className="h-full rounded-full bg-[#0080f2]"
          style={{ animation: "tw-progress 1.5s cubic-bezier(0.65, 0, 0.35, 1) forwards" }}
        />
      </div>
      <p className="tw-fade-in relative z-10 mt-3 text-xs tracking-widest text-slate-400" style={delay(500)}>
        MEMUAT HALAMAN…
      </p>
    </div>
  );
}

function RedirectOverlay({ title = "Berhasil!", subtitle = "Mengalihkan…" }) {
  return (
    <div className="tw-fade-in fixed inset-0 z-[90] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0080f2] border-r-cyan-400"
          style={{ animation: "tw-spin 0.9s linear infinite" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="tw-pop h-8 w-8 text-[#0080f2]" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <p className="tw-fade-up mt-6 text-lg font-semibold text-white" style={delay(150)}>
        {title}
      </p>
      <p className="tw-fade-up mt-1 text-sm text-slate-300" style={delay(300)}>
        {subtitle}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Komponen field (ikon + input)                                      */
/* ------------------------------------------------------------------ */
const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] disabled:cursor-not-allowed disabled:bg-slate-100";

const iconClass =
  "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0080f2]";

const ICONS = {
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  mail: "M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4",
  shield: "M9 12l2 2 4-4m5.62-4.02A11.96 11.96 0 0112 2.94a11.96 11.96 0 01-8.62 3.04A12 12 0 003 9c0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.05-.13-2.07-.38-3.02z",
};

function FieldIcon({ name }) {
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Halaman Register                                                   */
/* ------------------------------------------------------------------ */
export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorKey, setErrorKey] = useState(0); // untuk memicu ulang animasi shake
  const [registeredNotice, setRegisteredNotice] = useState(null);

  // Splash / pre-render animation
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashLeaving, setSplashLeaving] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Splash tampil ~1.6 detik, lalu keluar dengan animasi, lalu halaman register muncul
  useEffect(() => {
    const leaveTimer = setTimeout(() => setSplashLeaving(true), 1600);
    const removeTimer = setTimeout(() => setSplashVisible(false), 2200);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const showError = (msg) => {
    setError(msg);
    setErrorKey((k) => k + 1);
  };

  // Catatan: auto-redirect dihilangkan agar pengguna/penguji dapat mengakses dan melihat halaman register
  // secara terpisah kapan pun diperlukan (termasuk untuk pengujian atau multi-role), tanpa dipaksa redirect otomatis.
  // Navigasi setelah submit pendaftaran ditangani langsung oleh handleRegister.

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRegisteredNotice(null);

    // Validation
    if (!name || name.trim().length < 2 || name.trim().length > 120) {
      showError("Nama lengkap harus terdiri dari 2 hingga 120 karakter");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      showError("Format email tidak valid");
      setLoading(false);
      return;
    }

    const cleanedPhone = phone ? phone.replace(/\D/g, "") : "";
    if (!phone || cleanedPhone.length < 10 || cleanedPhone.length > 20) {
      showError("Nomor telepon harus terdiri dari 10 hingga 20 digit angka");
      setLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      showError("Password minimal harus 8 karakter");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showError("Password dan Confirm Password tidak sama");
      setLoading(false);
      return;
    }

    if (!terms) {
      showError("Kamu harus menyetujui Terms & Conditions");
      setLoading(false);
      return;
    }

    try {
      const result = await register(name, email, phone, password);

      if (result.success) {
        // After successful register + auto login, redirect
        setRedirecting(true);
        setTimeout(() => router.push("/user/home"), 1000);
      } else if (result.registered) {
        setRegisteredNotice(result.message);
        setLoading(false);
      } else {
        showError(result.message);
        setLoading(false);
      }
    } catch (err) {
      showError(err?.message || "Terjadi kesalahan saat pendaftaran");
      setLoading(false);
    }
  };

  // Petunjuk kecocokan password (hanya tampil setelah konfirmasi mulai diisi)
  const showMatchHint = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {splashVisible && <SplashScreen leaving={splashLeaving} />}
      {redirecting && (
        <RedirectOverlay
          title="Akun berhasil dibuat!"
          subtitle="Selamat datang di TicketWave, mengalihkan ke beranda…"
        />
      )}

      {/* Dekorasi background melayang */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="tw-float absolute -left-20 top-10 h-72 w-72 rounded-full bg-slate-500/5 blur-3xl" />
        <div className="tw-float-alt absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-slate-500/5 blur-3xl" />
      </div>

      <AuthLayout
        title="Create Your Account"
        subtitle="Daftar sekarang dan mulai temukan konser favoritmu."
      >
        <form onSubmit={handleRegister} className="relative z-10 space-y-3.5">
          {registeredNotice && (
            <div className="tw-expand rounded-xl border border-blue-200/60 bg-blue-50/80 px-4 py-3 text-sm text-slate-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-slate-200">
              <p className="font-semibold text-slate-900 dark:text-white">Akun Berhasil Didaftarkan</p>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{registeredNotice}</p>
              <Link href="/login" className="mt-2 inline-block font-medium text-[#0080f2] underline hover:text-[#0070d4]">
                Buka Halaman Login &rarr;
              </Link>
            </div>
          )}

          {error && (
            <div
              key={errorKey}
              className="tw-shake rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <div className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="flex-1 text-left">{error}</p>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className="tw-fade-up" style={delay(2400)}>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Full Name</label>
            <div className="group relative">
              <FieldIcon name="user" />
              <input
                type="text"
                placeholder="Your full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className={`${inputBase} pl-10`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="tw-fade-up" style={delay(2500)}>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Email</label>
            <div className="group relative">
              <FieldIcon name="mail" />
              <input
                type="email"
                placeholder="nama@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={`${inputBase} pl-10`}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="tw-fade-up" style={delay(2600)}>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Phone Number</label>
            <div className="group relative">
              <FieldIcon name="phone" />
              <input
                type="tel"
                placeholder="081234567890"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className={`${inputBase} pl-10`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="tw-fade-up" style={delay(2700)}>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Password</label>
            <div className="group relative">
              <FieldIcon name="lock" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`${inputBase} pl-10 pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="tw-fade-up" style={delay(2800)}>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Confirm Password</label>
            <div className="group relative">
              <FieldIcon name="shield" />
              <input
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className={`${inputBase} pl-10`}
              />
            </div>
            {showMatchHint && (
              <p
                key={passwordsMatch ? "match" : "nomatch"}
                className={`tw-fade-in mt-1.5 text-xs ${passwordsMatch ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-500"}`}
              >
                {passwordsMatch ? "✓ Password cocok" : "Password belum cocok"}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="tw-fade-up" style={delay(2900)}>
            <label className="flex cursor-pointer items-start gap-2 pt-1 text-xs leading-5 text-slate-600">
              <input
                type="checkbox"
                required
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                disabled={loading}
                className="mt-1 rounded border-slate-300 text-[#0080f2] transition focus:ring-[#0080f2] disabled:cursor-not-allowed"
              />

              <span>
                I agree to the{" "}
                <Link href="#" className="font-medium text-[#0080f2] underline hover:text-[#0070d4]">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-medium text-[#0080f2] underline hover:text-[#0070d4]">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Register Button */}
          <div className="tw-fade-up" style={delay(3000)}>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] py-3 text-sm font-medium text-white shadow-xs transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span
                    className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                    style={{ animation: "tw-spin 0.7s linear infinite" }}
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Login */}
          <p className="tw-fade-up pt-1 text-center text-xs text-slate-500" style={delay(3100)}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#0080f2] underline hover:text-[#0070d4]">
              Login
            </Link>
          </p>
        </form>
      </AuthLayout>
    </>
  );
}