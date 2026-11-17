"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  LogOut,
  Radio,
  Calendar,
  ShieldCheck,
  Info,
} from "lucide-react";

export default function OfficerProfilePage() {
  const { user, logout } = useAuth();
  const currentGate = user?.assigned_gate || "Belum dapat diverifikasi";

  const displayName = user?.name || "Petugas Scanner";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OP";

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Profil Petugas Lapangan
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
          Informasi identitas, penugasan gate operasional, dan parameter akun scanner Anda.
        </p>
      </div>

      {/* Multi-Column Responsive Grid Layout: fills 100% width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-none">
        {/* Left Column: Identitas Petugas & Alih Penugasan Gate (lg:col-span-5 xl:col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
          {/* Main ID Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/80">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0080f2] text-white text-xl font-semibold shadow-xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Petugas Scanner
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0080f2]" />
                    Aktif
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                  {displayName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-normal">
                  Badge: {user?.badge_id || "Belum tersedia"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Peran Sistem:</span>
                <span className="font-medium text-slate-900 dark:text-white uppercase">
                  {user?.role || "OFFICER"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Shift Penugasan:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {user?.shift || "Belum tersedia"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Gate Saat Ini:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {currentGate.split(" - ")[0]}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition shadow-xs"
              >
                <LogOut size={15} />
                <span>Keluar dari Akun Petugas</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Alih penugasan belum tersedia</h2>
            <p className="mt-2 text-xs text-slate-500">Penugasan gate belum dapat dimuat atau diubah dari portal ini. Hubungi koordinator lapangan.</p>
          </div>
        </div>

        {/* Right Column: Operasional, Kontak & SOP Gate (lg:col-span-7 xl:col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
          {/* Penugasan & Shift Operasional Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#0080f2]" /> Status Operasional Shift Hari Ini
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0080f2]" /> Belum dapat diverifikasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <MapPin size={13} /> Penugasan Gate Aktif
                </span>
                <span className="text-base font-semibold text-slate-900 dark:text-white block">
                  {currentGate}
                </span>
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Event:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Belum tersedia
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Lokasi Venue:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Belum tersedia
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Target Kapasitas:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Belum tersedia
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Clock size={13} className="text-slate-400" /> Jadwal Shift &amp; Tim
                </span>
                <span className="text-base font-semibold text-slate-900 dark:text-white block">
                  {user?.shift || "Belum tersedia"}
                </span>
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Koordinator Lapangan:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Belum tersedia
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Saluran Radio HT:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Belum tersedia
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Status Alat Scan:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Belum tersedia
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Informasi Kontak & Hak Akses Petugas */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block border-b border-slate-100 pb-3 dark:border-slate-800/80">
              Informasi Operasional Petugas
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1 font-normal">
                  <Mail size={13} className="text-slate-400" /> Alamat Email Resmi
                </span>
                <p className="font-medium text-slate-900 dark:text-white truncate">
                  {user?.email || "Belum tersedia"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1 font-normal">
                  <Phone size={13} className="text-slate-400" /> Kontak Darurat Lapangan
                </span>
                <p className="font-medium text-slate-900 dark:text-white">
                  {user?.phone || "Belum tersedia"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1 font-normal">
                  <ShieldCheck
                    size={13}
                    className="text-slate-400"
                  />{" "}
                  Lingkup Hak Akses
                </span>
                <p className="font-medium text-slate-900 dark:text-white">
                  Scan QR, Validasi Manual, &amp; Check-in Log
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1 font-normal">
                  <Radio size={13} className="text-slate-400" />{" "}
                  Komunikasi HT Koordinator
                </span>
                <p className="font-medium text-slate-900 dark:text-white">
                  Belum tersedia
                </p>
              </div>
            </div>
          </div>

          {/* SOP Validasi & Penanganan Masalah Lapangan */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info size={14} className="text-slate-400" /> Ringkasan Protokol Standar Pemeriksaan Gate (SOP)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] mb-2">
                  1
                </span>
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">
                  Pindai QR E-Tiket
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal text-[11px]">
                  Arahkan scanner ke layar ponsel penonton. Bila kode fisik rusak, gunakan fitur input kode manual.
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] mb-2">
                  2
                </span>
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">
                  Verifikasi Kategori
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal text-[11px]">
                  Pastikan warna &amp; kategori tiket sesuai pintu gate. Periksa apakah tiket masih berstatus valid.
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] mb-2">
                  3
                </span>
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">
                  Pasang Gelang Resmi
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal text-[11px]">
                  Klik tombol konfirmasi check-in lalu pasangkan gelang wristband pada pergelangan tangan penonton.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
