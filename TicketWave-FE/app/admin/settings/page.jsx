"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Database,
  Palette,
  Sun,
  Moon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Server,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/api";

export default function AdminSettingsPage() {
  const { setTheme, isDark } = useTheme();
  const { user } = useAuth();

  const [health, setHealth] = useState(null);
  const [totalEvents, setTotalEvents] = useState(null);
  const [totalAgencies, setTotalAgencies] = useState(null);
  const [checking, setChecking] = useState(true);

  const checkSystemStatus = useCallback(async () => {
    await Promise.resolve();
    setChecking(true);
    try {
      const [healthRes, evRes, agRes] = await Promise.allSettled([
        api.checkHealth(),
        api.get("/events", { page: 1, per_page: 1 }),
        api.get("/agencies", { page: 1, per_page: 1 }),
      ]);

      if (healthRes.status === "fulfilled") {
        const hData = healthRes.value?.data || healthRes.value;
        setHealth(hData || { status: "ok", service: "TicketWave Backend" });
      } else {
        setHealth({ status: "unreachable", error: healthRes.reason?.message });
      }

      if (evRes.status === "fulfilled") {
        setTotalEvents(evRes.value?.data?.total_items ?? 0);
      }
      if (agRes.status === "fulfilled") {
        setTotalAgencies(agRes.value?.data?.total_items ?? 0);
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      checkSystemStatus();
    }, 0);
    return () => clearTimeout(t);
  }, [checkSystemStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
            Konfigurasi &amp; Diagnostik
          </span>
          <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
            Pengaturan Admin &amp; Status Server
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola tema antarmuka panel admin dan pantau konektivitas endpoint <code className="font-mono">GET /health</code> secara langsung.
          </p>
        </div>

        <button
          type="button"
          onClick={checkSystemStatus}
          disabled={checking}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
          Cek Ulang Koneksi
        </button>
      </div>

      {/* Appearance / Theme Settings */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <Palette className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Tema Tampilan Panel Admin
          </h2>
        </div>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Sesuaikan mode tampilan terang atau gelap untuk ruang kerja administrasi Anda.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
              !isDark
                ? "border-[#0080f2] bg-[#0080f2]/10 text-[#0080f2] ring-2 ring-[#0080f2]/20"
                : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-500 shadow-sm">
              <Sun size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Mode Terang (Light)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latar cerah dengan kontras tinggi
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
                Latar slate gelap yang nyaman di mata
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <User className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Profil Administrator Aktif
          </h2>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0080f2] text-2xl font-black text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {user?.name || "Belum Login"}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-[#0080f2]" />
                  {user?.email || "-"}
                </span>
                {user?.role && (
                  <span className="rounded-full bg-[#0080f2]/15 px-3 py-0.5 text-xs font-bold uppercase text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/user/settings"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-[#0080f2] dark:border-slate-700 dark:text-slate-200"
          >
            Reset Password Akun &rarr;
          </Link>
        </div>
      </div>

      {/* Live System Health & Database Counts */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Database className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Diagnostik Sistem &amp; Koneksi Backend
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Status Endpoint GET /health
            </p>
            <div className="mt-2 flex items-center gap-2">
              {health?.status === "ok" || health?.status === "healthy" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    Online ({String(health.status).toUpperCase()})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-black text-red-600 dark:text-red-400">
                    {checking ? "Memeriksa..." : "Offline / Unreachable"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Event di Database
            </p>
            <p className="mt-2 text-2xl font-black text-[#0080f2] dark:text-[#0080f2]">
              {totalEvents !== null ? totalEvents : "-"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Agency di Database
            </p>
            <p className="mt-2 text-2xl font-black text-[#0080f2] dark:text-[#0080f2]">
              {totalAgencies !== null ? totalAgencies : "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <Server size={14} className="text-[#0080f2]" />
            API Base URL:{" "}
            <code className="font-mono font-bold text-slate-700 dark:text-slate-200">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}
            </code>
          </span>
          <span>Service: {health?.service || "ticketwave-api"}</span>
        </div>
      </div>
    </div>
  );
}
