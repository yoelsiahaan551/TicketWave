"use client";

import Link from "next/link";

export default function LoginForm() {
  return (
    <form className="space-y-4">

      {/* Email */}

      <div>

        <label className="mb-1.5 block text-xs font-medium text-slate-700">
          Email Address
        </label>

        <input
          type="email"
          placeholder="you@example.com"
          className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2]"
        />

      </div>

      {/* Password */}

      <div>

        <label className="mb-1.5 block text-xs font-medium text-slate-700">
          Password
        </label>

        <input
          type="password"
          placeholder="••••••••"
          className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2]"
        />

      </div>

      {/* Remember */}

      <div className="flex items-center justify-between text-xs">

        <label className="flex items-center gap-2 text-slate-600">

          <input
            type="checkbox"
            className="rounded border-slate-300 text-[#0080f2] focus:ring-[#0080f2]"
          />

          Remember me

        </label>

        <Link
          href="#"
          className="font-medium text-[#0080f2] hover:underline"
        >
          Forgot Password?
        </Link>

      </div>

      {/* Login */}

      <button
        className="h-11 w-full rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-sm font-medium text-white shadow-xs transition"
      >
        Login
      </button>

      {/* Register */}

      <p className="text-center text-xs text-slate-500">

        Don&apos;t have an account?{" "}

        <Link
          href="/register"
          className="font-medium text-[#0080f2] hover:underline"
        >
          Register
        </Link>

      </p>

    </form>
  );
}