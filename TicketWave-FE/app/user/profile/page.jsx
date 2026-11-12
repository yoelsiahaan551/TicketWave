"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  KeyRound,
  RefreshCw,
  LogIn,
  Info,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/api";

const roleStyles = {
  admin: "bg-[#0080f2]/15 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]",
  officer: "bg-[#0080f2]/15 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]",
  user: "bg-[#0080f2]/15 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]",
};

const roleLabels = {
  admin: "Administrator",
  officer: "Officer",
  user: "Pengguna Terdaftar",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, fetchCurrentUser } = useAuth();
  const [verificationToken, setVerificationToken] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        sessionStorage.getItem("ticketwave_verification_token") ||
        localStorage.getItem("ticketwave_verification_token") ||
        ""
      );
    }
    return "";
  });
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      router.replace("/login?redirect=/user/profile");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUser();
    } finally {
      setRefreshing(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const token = verificationToken.trim();
    if (!token) return;

    setVerifying(true);
    setVerifyMsg(null);
    try {
      const res = await api.get(`/auth/verify-email/${encodeURIComponent(token)}`);
      setVerifyMsg({
        type: "success",
        text: res.message || "Email Anda berhasil diverifikasi!",
      });
      if (typeof window !== "undefined") {
        localStorage.removeItem("ticketwave_verification_token");
      }
      await fetchCurrentUser();
    } catch (err) {
      setVerifyMsg({
        type: "error",
        text: err.message || "Token verifikasi tidak valid atau sudah digunakan.",
      });
    } finally {
      setVerifying(false);
    }
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
            Silakan masuk menggunakan akun TicketWave Anda untuk melihat profil dan status verifikasi email dari endpoint <code className="font-mono">GET /api/auth/me</code>.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-[#0080f2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20"
            >
              Masuk Sekarang
            </Link>
            <Link
              href="/register"
              className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Daftar Akun
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
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
              Identitas Pengguna
            </span>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              Profil Saya
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Data akun sinkron langsung dari endpoint <code className="font-mono">GET /api/auth/me</code>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshProfile}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Sinkronkan Data
          </button>
        </div>

        {/* Profile Summary Card */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0080f2] text-3xl font-black text-white shadow-md sm:h-24 sm:w-24">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {user.email}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    roleStyles[user.role] || roleStyles.user
                  }`}
                >
                  {roleLabels[user.role] || user.role}
                </span>

                {user.email_verified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Email Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Email Belum Diverifikasi
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">User ID</p>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  #{user.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nomor Telepon</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {user.phone || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Terdaftar Sejak
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Section (GET /api/auth/verify-email/<token>) */}
        {!user.email_verified && (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Verifikasi Alamat Email Anda
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Masukkan <code className="font-mono font-bold">verification_token</code> yang diterima saat registrasi untuk memverifikasi akun melalui endpoint <code className="font-mono">GET /api/auth/verify-email/&lt;token&gt;</code>.
                </p>

                <form
                  onSubmit={handleVerifyEmail}
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    type="text"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    placeholder="Tempel verification_token di sini..."
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/25 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={verifying || !verificationToken.trim()}
                    className="rounded-xl bg-[#0080f2] px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#0070d4] disabled:opacity-50"
                  >
                    {verifying ? "Memverifikasi..." : "Verifikasi Email"}
                  </button>
                </form>

                {verifyMsg && (
                  <p
                    className={`mt-3 text-xs font-bold ${
                      verifyMsg.type === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {verifyMsg.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Read-Only Profile Details */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Detail Informasi Profil
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Read-Only
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={user.name || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={user.phone || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <Info size={16} className="mt-0.5 shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
            <span>
              Endpoint perubahan data profil (<code className="font-mono">PUT/PATCH /api/auth/me</code>) belum tersedia di backend saat ini. Untuk mengatur ulang kata sandi akun, silakan buka halaman{" "}
              <Link
                href="/user/settings"
                className="font-bold text-[#0080f2] hover:underline dark:text-[#0080f2]"
              >
                Pengaturan Akun
              </Link>
              .
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
