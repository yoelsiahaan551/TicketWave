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
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="h-56 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <div className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <LogIn size={24} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Anda Belum Masuk
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Halaman Pengaturan Akun memerlukan autentikasi. Mengarahkan ke halaman login...
          </p>
          <div className="mt-6 flex justify-center gap-2.5">
            <Link
              href="/login?redirect=/user/settings"
              className="rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#0070d4] transition-colors"
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
            Preferensi &amp; Keamanan
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Pengaturan Akun
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Kelola tema antarmuka dan pengaturan ulang kata sandi melalui endpoint autentikasi resmi.
          </p>
        </div>

        {/* Theme / Appearance Card */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-3 flex items-center gap-2.5">
            <Palette className="h-4 w-4 text-[#0080f2]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Tema Tampilan (Light &amp; Dark Mode)
            </h2>
          </div>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Pilih tema antarmuka untuk seluruh halaman User dan Admin. Halaman Landing Page tetap terkunci pada Mode Terang.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                !isDark
                  ? "border-[#0080f2] ring-1 ring-[#0080f2] bg-blue-50/50 text-slate-900 dark:border-[#0080f2] dark:bg-blue-950/40 dark:text-white"
                  : "border-slate-200/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0080f2] shadow-xs">
                <Sun size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold">Mode Terang (Light)</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Latar belakang slate cerah dan bersih
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                isDark
                  ? "border-[#0080f2] ring-1 ring-[#0080f2] bg-slate-800 text-white"
                  : "border-slate-200/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 shadow-xs">
                <Moon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold">Mode Gelap (Dark)</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Latar belakang slate gelap yang nyaman di mata
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Account Info Card */}
        {isAuthenticated && user && (
          <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Akun yang Sedang Aktif
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Nama</p>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Email</p>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Role</p>
                  <p className="text-xs font-semibold uppercase text-slate-900 dark:text-white">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security - 2-Step Password Reset Supported by Backend */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-1.5 flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Atur Ulang Kata Sandi (Password Reset)
            </h2>
          </div>
          <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
            Terhubung langsung dengan endpoint <code className="font-mono text-[11px]">POST /api/auth/request-password-reset</code> dan <code className="font-mono text-[11px]">POST /api/auth/reset-password</code>.
          </p>

          {/* Step 1: Request Reset Token */}
          <form
            onSubmit={handleRequestResetToken}
            className="mb-5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Langkah 1: Minta Token Reset Password
            </h3>
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={resetEmail || user?.email || ""}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Masukkan email akun Anda"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>
              <button
                type="submit"
                disabled={requestingToken}
                className="rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#0070d4] disabled:opacity-50 shadow-xs"
              >
                {requestingToken ? "Memproses..." : "Dapatkan Token Reset"}
              </button>
            </div>

            {requestMsg && (
              <div
                className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300"
              >
                {requestMsg.type === "error" ? (
                  <AlertCircle size={13} />
                ) : (
                  <CheckCircle2 size={13} />
                )}
                <span>{requestMsg.text}</span>
              </div>
            )}
          </form>

          {/* Step 2: Submit Reset Token + New Password */}
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Langkah 2: Konfirmasi Token &amp; Password Baru
            </h3>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Reset Token *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Token dari langkah 1"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 font-mono text-xs text-slate-900 outline-none focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password Baru * (Min. 8 karakter, huruf besar, huruf kecil, dan angka)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Contoh: PasswordBaru123"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>
            </div>

            {resetMsg && (
              <div
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 p-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {resetMsg.type === "error" ? (
                  <AlertCircle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>{resetMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={resettingPassword || !resetToken.trim() || !newPassword}
              className="w-full rounded-xl bg-[#0080f2] px-4 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4] disabled:opacity-50"
            >
              {resettingPassword ? "Menyimpan Password Baru..." : "Simpan Password Baru"}
            </button>
          </form>
        </div>

        {/* Logout Card */}
        {isAuthenticated && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Keluar dari Akun TicketWave
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
