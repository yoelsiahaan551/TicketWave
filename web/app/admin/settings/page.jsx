"use client";

import { useEffect, useState, useCallback } from "react";
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
    setHealth(null);
    setTotalEvents(null);
    setTotalAgencies(null);
    try {
      const [healthRes, evRes, agRes] = await Promise.allSettled([
        api.checkHealth(),
        api.get("/events", { page: 1, per_page: 1 }),
        api.get("/agencies", { page: 1, per_page: 1 }),
      ]);

      if (healthRes.status === "fulfilled") {
        const hData = healthRes.value?.data || healthRes.value;
        setHealth(hData || { status: "unknown" });
      } else {
        setHealth({ status: "unreachable", error: healthRes.reason?.message });
      }

      if (evRes.status === "fulfilled") {
        setTotalEvents(evRes.value?.data?.total_items ?? null);
      }
      if (agRes.status === "fulfilled") {
        setTotalAgencies(agRes.value?.data?.total_items ?? null);
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
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
            Konfigurasi &amp; Diagnostik
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Pengaturan Admin &amp; Status Server
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Kelola tema antarmuka panel admin dan pantau konektivitas server secara langsung.
          </p>
        </div>

        <button
          type="button"
          onClick={checkSystemStatus}
          disabled={checking}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw size={13} className={checking ? "animate-spin" : ""} />
          Cek Ulang Koneksi
        </button>
      </div>

      {/* Appearance / Theme Settings */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-3 flex items-center gap-2.5">
          <Palette className="h-4 w-4 text-[#0080f2]" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Tema Tampilan Panel Admin
          </h2>
        </div>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Sesuaikan mode tampilan terang atau gelap untuk ruang kerja administrasi Anda.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
              !isDark
                ? "border-[#0080f2] ring-1 ring-[#0080f2] bg-blue-50/50 text-[#0080f2] dark:border-[#0080f2]"
                : "border-slate-200/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0080f2] shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <Sun size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold">Mode Terang (Light)</p>
              <p className="text-[11px] opacity-80">
                Latar cerah dengan kontras tinggi
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
              <p className="text-[11px] opacity-80">
                Latar slate gelap yang nyaman di mata
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <User className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Profil Administrator Aktif
          </h2>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0080f2] text-base font-semibold text-white shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || "Belum Login"}
              </h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email || "-"}
                </span>
                {user?.role && (
                  <span className="rounded-full bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10px] font-medium uppercase text-[#0080f2] dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Live System Health & Database Counts */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <Database className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Diagnostik Sistem &amp; Koneksi Backend
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Status Endpoint GET /health
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {health?.status === "ok" || health?.status === "healthy" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Online ({String(health.status).toUpperCase()})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    {checking ? "Memeriksa..." : "Tidak dapat diverifikasi"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Event di Database
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {checking ? "..." : totalEvents ?? "—"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Agency di Database
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {checking ? "..." : totalAgencies ?? "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Server size={13} className="text-slate-400" />
            API Base URL:{" "}
            <code className="font-mono text-[10px] text-slate-700 dark:text-slate-300">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}
            </code>
          </span>
          <span>Service: {health?.service || "ticketwave-api"}</span>
        </div>
      </div>
    </div>
  );
}
