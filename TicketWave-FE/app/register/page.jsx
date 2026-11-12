"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthLayout from "@/app/components/auth/AuthLayout";

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

  // Catatan: auto-redirect dihilangkan agar pengguna/penguji dapat mengakses dan melihat halaman register
  // secara terpisah kapan pun diperlukan (termasuk untuk pengujian atau multi-role), tanpa dipaksa redirect otomatis.
  // Navigasi setelah submit pendaftaran ditangani langsung oleh handleRegister.

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Password dan Confirm Password tidak sama");
      setLoading(false);
      return;
    }

    if (!terms) {
      setError("Kamu harus menyetujui Terms & Conditions");
      setLoading(false);
      return;
    }

    const result = await register(name, email, phone, password);

    if (result.success) {
      // After successful register + auto login, redirect
      router.push("/user/home");
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account 🚀"
      subtitle="Daftar sekarang dan mulai temukan konser favoritmu."
    >
      <form
        onSubmit={handleRegister}
        className="space-y-3.5"
      >
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Your full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>

          <input
            type="email"
            placeholder="[EMAIL_9]"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Phone Number
          </label>

          <input
            type="tel"
            placeholder="081234567890"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-4 py-3 pr-14 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm your password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 pt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            required
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            disabled={loading}
            className="mt-1 disabled:cursor-not-allowed rounded border-slate-300 dark:border-slate-700"
          />

          <span>
            I agree to the{" "}
            <Link
              href="#"
              className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Login */}
        <p className="pt-1 text-center text-sm font-normal text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}