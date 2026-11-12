"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Shield,
  LogOut,
  User,
  Mail,
  Calendar,
  Palette,
  Sun,
  Moon,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme, isDark } = useTheme();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      router.replace("/login?redirect=/user/settings");
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Step 1: POST /api/auth/request-password-reset
  const [resetEmail, setResetEmail] = useState(user?.email || "");
  const [requestingToken, setRequestingToken] = useState(false);
  const [requestMsg, setRequestMsg] = useState(null);

  // Step 2: POST /api/auth/reset-password
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);

  const handleRequestResetToken = async (e) => {
    e.preventDefault();
    const targetEmail = (resetEmail || user?.email || "").trim();
    if (!targetEmail) return;

    setRequestingToken(true);
    setRequestMsg(null);
    try {
      const res = await api.post("/auth/request-password-reset", {
        email: targetEmail,
      });
      const returnedToken = res.data?.reset_token;
      if (returnedToken) {
        setResetToken(returnedToken);
      }
      setRequestMsg({
        type: "success",
        text: returnedToken
          ? "Token reset berhasil dibuat dan telah diisi otomatis pada formulir di bawah."
          : res.message || "Permintaan reset password berhasil dikirim.",
      });
    } catch (err) {
      setRequestMsg({
        type: "error",
        text: err.message || "Gagal meminta token reset password.",
      });
    } finally {
      setRequestingToken(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) return;

    setResettingPassword(true);
    setResetMsg(null);
    try {
      const res = await api.post("/auth/reset-password", {
        token: resetToken.trim(),
        new_password: newPassword,
      });
      setResetMsg({
        type: "success",
        text: res.message || "Password berhasil diperbarui! Silakan gunakan password baru saat login berikutnya.",
      });
      setResetToken("");
      setNewPassword("");
    } catch (err) {
      setResetMsg({
        type: "error",
        text: err.message || "Gagal mereset password. Pastikan password memenuhi syarat huruf besar, huruf kecil, dan angka.",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0080f2]/10 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]">
            <LogIn size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
            Anda Belum Masuk
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Halaman Pengaturan Akun memerlukan autentikasi. Mengarahkan ke halaman login...
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/login?redirect=/user/settings"
              className="rounded-2xl bg-[#0080f2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20"
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
            Preferensi &amp; Keamanan
          </span>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            Pengaturan Akun
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola tema antarmuka dan pengaturan ulang kata sandi melalui endpoint autentikasi resmi.
          </p>
        </div>

        {/* Theme / Appearance Card */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <Palette className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Tema Tampilan (Light &amp; Dark Mode)
            </h2>
          </div>
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
            Pilih tema antarmuka untuk seluruh halaman User dan Admin. Halaman Landing Page tetap dikunci pada Mode Terang sesuai spesifikasi sistem.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                !isDark
                  ? "border-[#0080f2] bg-[#0080f2]/10 text-[#0080f2] ring-2 ring-[#0080f2]/20 dark:border-[#0080f2]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-500 shadow-sm">
                <Sun size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Mode Terang (Light)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latar belakang slate cerah dan bersih
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                isDark
                  ? "border-[#0080f2] bg-[#0080f2]/15 text-white ring-2 ring-[#0080f2]/20"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-[#0080f2] shadow-sm">
                <Moon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Mode Gelap (Dark)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latar belakang slate gelap yang nyaman di mata
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Account Info Card */}
        {isAuthenticated && user && (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
              Akun yang Sedang Aktif
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nama</p>
                  <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-bold text-slate-900 dark:text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
                  <p className="font-bold uppercase text-[#0080f2] dark:text-[#0080f2]">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security - 2-Step Password Reset Supported by Backend */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Atur Ulang Kata Sandi (Password Reset)
            </h2>
          </div>
          <p className="mb-6 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Terhubung langsung dengan endpoint <code className="font-mono">POST /api/auth/request-password-reset</code> dan <code className="font-mono">POST /api/auth/reset-password</code>.
          </p>

          {/* Step 1: Request Reset Token */}
          <form
            onSubmit={handleRequestResetToken}
            className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Langkah 1: Minta Token Reset Password
            </h3>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={resetEmail || user?.email || ""}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Masukkan email akun Anda"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={requestingToken}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-[#0080f2] dark:hover:bg-[#0070d4]"
              >
                {requestingToken ? "Memproses..." : "Dapatkan Token Reset"}
              </button>
            </div>

            {requestMsg && (
              <div
                className={`mt-3 flex items-center gap-2 text-xs font-semibold ${
                  requestMsg.type === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {requestMsg.type === "error" ? (
                  <AlertCircle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>{requestMsg.text}</span>
              </div>
            )}
          </form>

          {/* Step 2: Submit Reset Token + New Password */}
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Langkah 2: Konfirmasi Token &amp; Password Baru
            </h3>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reset Token *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Token dari langkah 1"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 font-mono text-xs text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password Baru * (Min. 8 karakter, huruf besar, huruf kecil, dan angka)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Contoh: PasswordBaru123"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {resetMsg && (
              <div
                className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold ${
                  resetMsg.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                }`}
              >
                {resetMsg.type === "error" ? (
                  <AlertCircle size={15} />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                <span>{resetMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={resettingPassword || !resetToken.trim() || !newPassword}
              className="w-full rounded-2xl bg-[#0080f2] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-[1.01] disabled:opacity-50"
            >
              {resettingPassword ? "Menyimpan Password Baru..." : "Simpan Password Baru"}
            </button>
          </form>
        </div>

        {/* Logout Card */}
        {isAuthenticated && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-300 px-6 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-5 w-5" />
              Keluar dari Akun TicketWave
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
