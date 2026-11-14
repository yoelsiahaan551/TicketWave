"use client";

import Link from "next/link";

export default function RegisterForm() {
  return (
    <form className="space-y-4">

      {/* Name */}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-700">
          Full Name
        </label>
        <input
          type="text"
          placeholder="John Doe"
          className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2]"
        />
      </div>

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

      {/* Confirm Password */}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-700">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2]"
        />
      </div>

      {/* Terms */}

      <div className="flex items-center text-xs">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-[#0080f2] focus:ring-[#0080f2]"
          />
          I agree to the{" "}
          <Link href="#" className="font-medium text-[#0080f2] underline hover:text-[#0070d4]">
            Terms &amp; Conditions
          </Link>
        </label>
      </div>

      {/* Register */}

      <button
        className="h-11 w-full rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-sm font-medium text-white shadow-xs transition"
      >
        Register
      </button>

      {/* Login */}

      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#0080f2] underline hover:text-[#0070d4]"
        >
          Login
        </Link>
      </p>

    </form>
  );
}