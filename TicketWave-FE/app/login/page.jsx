"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthLayout from "@/app/components/auth/AuthLayout";
import api from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inline Forgot Password state (terhubung ke POST /api/auth/request-password-reset & POST /api/auth/reset-password)
  const [showResetBox, setShowResetBox] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const handleRequestReset = async () => {
    const targetEmail = (resetEmail || email || "").trim();
    if (!targetEmail) {
      setResetStatus({ type: "error", text: "Masukkan alamat email terlebih dahulu." });
      return;
    }
    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await api.post("/auth/request-password-reset", { email: targetEmail });
      setResetStatus({
        type: "success",
        text: res.message || "Jika email terdaftar, tautan/token reset telah dikirim (cek log server).",
      });
    } catch (err) {
      setResetStatus({
        type: "error",
        text: err.message || "Gagal mengirim permintaan reset password.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetToken.trim() || !newPassword) {
      setResetStatus({ type: "error", text: "Masukkan token reset dan password baru." });
      return;
    }
    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await api.post("/auth/reset-password", {
        token: resetToken.trim(),
        new_password: newPassword,
      });
      setResetStatus({
        type: "success",
        text: res.message || "Password berhasil direset. Silakan login dengan password baru.",
      });
      setResetToken("");
      setNewPassword("");
    } catch (err) {
      setResetStatus({
        type: "error",
        text: err.message || "Token tidak valid atau password belum memenuhi syarat.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Catatan: auto-redirect dihilangkan agar pengguna/penguji dapat mengakses dan melihat halaman login
  // secara terpisah kapan pun diperlukan (termasuk untuk pengujian atau multi-role), tanpa dipaksa redirect otomatis.
  // Navigasi setelah submit login ditangani langsung oleh handleLogin.

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password, rememberMe);

    if (result.success) {
      // Role-based redirection per specification:
      // - admin -> Admin Area (/admin)
      // - user / officer -> User Area (/user/home); Officer is strictly NOT directed to /admin
      const role = result.user?.role;
      let target = role === "admin" ? "/admin" : "/user/home";

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          if (!redirectParam.startsWith("/admin") || role === "admin") {
            target = redirectParam;
          }
        }
      }

      router.push(target);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Login untuk melanjutkan ke akun TicketWave kamu."
    >
      <form className="space-y-5" onSubmit={handleLogin}>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>

          <input
            type="email"
            placeholder="nama@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-5 py-4 pr-14 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Remember */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-normal text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="rounded border-slate-300 dark:border-slate-700"
            />
            Remember me
          </label>

          <button
            type="button"
            onClick={() => {
              setShowResetBox((prev) => !prev);
              setResetStatus(null);
            }}
            className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Reset Password Panel — POST /api/auth/request-password-reset & POST /api/auth/reset-password */}
        {showResetBox && (
          <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Reset Password
            </p>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetLoading}
                  className="w-full rounded-2xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                />
                <button
                  type="button"
                  onClick={handleRequestReset}
                  disabled={resetLoading}
                  className="shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kirim
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Token Reset
              </label>
              <input
                type="text"
                placeholder="Token dari tautan reset"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                disabled={resetLoading}
                className="w-full rounded-2xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password Baru
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={resetLoading}
                className="w-full rounded-2xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmReset}
              disabled={resetLoading}
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? "Memproses..." : "Reset Password Sekarang"}
            </button>

            {resetStatus && (
              <p
                className={`text-sm ${
                  resetStatus.type === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {resetStatus.text}
              </p>
            )}
          </div>
        )}

        {/* Register */}
        <p className="pt-2 text-center text-sm font-normal text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
