"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { getOfficerStatsAsync, getScanHistoryWithMeta } from "@/app/lib/officerService";
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Calendar,
} from "lucide-react";

export default function OfficerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [reload, setReload] = useState(0);
  const retry = () => {
    setStats(null);
    setRecentActivities([]);
    setStatsError("");
    setHistoryError("");
    setStatsLoading(true);
    setHistoryLoading(true);
    setReload((value) => value + 1);
  };
  useEffect(() => {
    let active = true;
    getOfficerStatsAsync().then((data) => { if (active) setStats(data); })
      .catch((error) => { if (active) setStatsError(error.message); })
      .finally(() => { if (active) setStatsLoading(false); });
    getScanHistoryWithMeta().then((response) => {
      if (!active) return;
      if (response.success) setRecentActivities(response.data.slice(0, 5));
      else setHistoryError(response.error);
    }).finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [reload]);

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("berhasil") || s.includes("valid") || s.includes("sukses")) {
      return "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300";
    }
    if (s.includes("sudah") || s.includes("used") || s.includes("duplikat")) {
      return "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300";
    }
    if (s.includes("ditolak") || s.includes("invalid") || s.includes("tidak")) {
      return "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300";
    }
    return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  const statCards = [
    {
      name: "Total Diperiksa",
      value: "—",
      subtext: "Jumlah pemeriksaan belum tersedia",
      icon: ScanLine,
      iconColor: "text-[#0080f2] dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      name: "Check-in Berhasil",
      value: statsLoading ? "..." : stats?.checked_in ?? "—",
      subtext: "Seluruh event dan petugas, semua waktu",
      icon: CheckCircle2,
      iconColor: "text-emerald-700 dark:text-emerald-300",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      name: "Tiket Ditolak",
      value: "—",
      subtext: "Jumlah penolakan belum tersedia",
      icon: XCircle,
      iconColor: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-50 dark:bg-red-950/40",
    },
    {
      name: "Tiket Valid + Digunakan",
      value: statsLoading ? "..." : stats?.valid_or_used ?? "—",
      subtext: "Seluruh event; bukan kapasitas gate",
      icon: ShieldCheck,
      iconColor: "text-slate-700 dark:text-slate-300",
      bgColor: "bg-slate-100 dark:bg-slate-800",
    },
  ];

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header Sambutan Clean & Understated */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Selamat Bertugas, {user?.name || "Petugas Scanner"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
            Panel operasional pemantauan dan validasi tiket pengunjung di gate masuk.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/officer/scan#manual"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#0080f2] dark:hover:text-[#0080f2] transition"
          >
            <Search size={16} />
            <span>Input Manual</span>
          </Link>
          <Link
            href="/officer/scan"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0080f2] px-4 py-2 text-sm font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
          >
            <ScanLine size={16} />
            <span>Mulai Scan QR</span>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <Calendar size={18} className="text-[#0080f2]" />
        <h2 className="mt-2 font-semibold text-slate-900 dark:text-white">Penugasan belum dapat diverifikasi</h2>
        <p className="mt-1 text-sm text-slate-500">Data event, gate, shift, dan kapasitas penugasan belum tersedia. Hubungi koordinator untuk instruksi operasional.</p>
        <Link href="/officer/events" className="mt-3 inline-block text-sm text-[#0080f2]">Lihat status penugasan</Link>
      </div>
      {statsError && <p role="alert" className="text-sm text-red-600">Gagal memuat statistik: {statsError}</p>}
      {(statsError || historyError) && <button type="button" onClick={retry} disabled={statsLoading || historyLoading} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Coba Lagi</button>}

      {/* 4 Komponen Kartu Statistik Konsisten */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bgColor} ${stat.iconColor}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-3 text-xs font-normal text-slate-400 dark:text-slate-500">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Grid: Aktivitas Terbaru & SOP Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Aktivitas Check-in Terbaru (2/3 width) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Aktivitas Check-in Terbaru
              </h2>
              <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                5 check-in berhasil terbaru, seluruh event dan petugas (dari maksimal 50 catatan)
              </p>
            </div>
            <Link
              href="/officer/history"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0080f2] hover:text-[#0070d4] dark:text-blue-400 dark:hover:text-blue-300 transition"
            >
              <span>Semua Riwayat</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {(historyLoading || historyError || recentActivities.length === 0) && <p role="status" className="p-5 text-sm text-slate-500">{historyLoading ? "Memuat riwayat..." : historyError || "Belum ada check-in tercatat."}</p>}
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                  <th className="px-4 py-2.5">Waktu</th>
                  <th className="px-4 py-2.5">Kode Tiket</th>
                  <th className="px-4 py-2.5">Pemegang</th>
                  <th className="px-4 py-2.5">Kategori</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentActivities.map((act) => {
                  return (
                    <tr
                      key={act.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={12} className="text-slate-400" />
                          {new Date(act.timestamp).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {act.ticket_code}
                      </td>

                      <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {act.attendee_name || "Pemegang Tiket"}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {act.ticket_type}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${getStatusBadge(
                            act.status
                          )}`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< md) */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
            {recentActivities.map((act) => {
              return (
                <div key={act.id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                      {act.ticket_code}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border ${getStatusBadge(
                        act.status
                      )}`}
                    >
                      {act.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {act.attendee_name || "Pemegang Tiket"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {act.ticket_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <Clock size={11} />
                    <span>
                      {new Date(act.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel SOP Validasi Gate Sederhana (1/3 width) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                SOP Validasi Gate
              </h2>
            </div>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mb-4">
              Panduan ringkas prosedur pemeriksaan penonton di gate masuk
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  1
                </span>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Pindai QR E-Tiket</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                    Arahkan scanner ke layar HP pengunjung. Pastikan kecerahan layar ponsel mencukupi.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  2
                </span>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Verifikasi Status</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                    Periksa kesesuaian kategori tiket. Pastikan indikator menunjukkan status valid.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  3
                </span>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Pasang Gelang Wristband</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                    Konfirmasi check-in dan tunggu CHECK-IN SELESAI dari server sebelum memasang gelang atau mempersilakan masuk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/30">
            <span className="font-medium text-slate-700 dark:text-slate-300 block">
              Bantuan Supervisor Lapangan
            </span>
            <span className="text-slate-500 dark:text-slate-400 mt-0.5 block font-normal">
              Hubungi koordinator lapangan melalui saluran resmi penyelenggara jika terjadi kendala identitas atau tiket rusak.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
