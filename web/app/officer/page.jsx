"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  getOfficerStats,
  getOfficerHistory,
} from "@/app/lib/officerService";
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Search,
  Calendar,
  Radio,
  FileCheck2,
  Receipt,
} from "lucide-react";

export default function OfficerDashboardPage() {
  const { user } = useAuth();
  const [stats] = useState(() => getOfficerStats());
  const [recentActivities] = useState(() => getOfficerHistory().slice(0, 5));

  const progressPercentage = Math.min(
    100,
    Math.round((stats.success_count / (stats.gate_quota || 500)) * 100)
  );

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
      value: stats.total_inspected,
      subtext: "Akumulasi shift hari ini",
      icon: ScanLine,
      iconColor: "text-[#0080f2] dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      name: "Check-in Berhasil",
      value: stats.success_count,
      subtext: "Tiket sah & gelang diserahkan",
      icon: CheckCircle2,
      iconColor: "text-emerald-700 dark:text-emerald-300",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      name: "Tiket Ditolak",
      value: stats.rejected_count,
      subtext: "Duplikat atau tidak valid",
      icon: XCircle,
      iconColor: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-50 dark:bg-red-950/40",
    },
    {
      name: "Kapasitas Gate",
      value: `${progressPercentage}%`,
      subtext: `${stats.success_count} dari ${stats.gate_quota} kuota`,
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
            href="/officer/kasir"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#0080f2] dark:hover:text-[#0080f2] transition"
          >
            <Receipt size={16} />
            <span>Kasir OTS</span>
          </Link>
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

      {/* Card Informasi Event & Shift yang Rapi */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-300">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Penugasan Aktif Hari Ini
              </span>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {stats.active_event}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0080f2]" />
              Operasional Gate Aktif
            </span>
            <span className="rounded-full border border-slate-200/80 bg-slate-50/70 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              {stats.shift_hours}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <MapPin size={16} className="text-slate-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Lokasi &amp; Pintu:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {user?.assigned_gate || stats.assigned_gate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <Radio size={16} className="text-slate-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Saluran Komunikasi:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                HT Channel 03 (Gate Team)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <FileCheck2 size={16} className="text-slate-400 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Total Masuk Gate:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats.success_count} / {stats.gate_quota} Pengunjung ({progressPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Kuota */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-[#0080f2] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

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
                5 pemeriksaan tiket terakhir di gate penugasan Anda
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
                    Konfirmasi check-in lalu pasangkan gelang resmi pada pergelangan tangan pengunjung.
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
              Hubungi Dani Prasetyo melalui radio HT Channel 03 jika terjadi kendala identitas atau tiket rusak.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
