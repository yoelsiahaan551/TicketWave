"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  inspectTicketCode,
  executeCheckIn,
} from "@/app/lib/officerService";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ban,
  ScanLine,
  User,
  MapPin,
  Clock,
  Ticket,
  FileCheck2,
  Loader2,
  Calendar,
  Sparkles,
  Shield,
  Info,
  Search,
} from "lucide-react";

function ValidationContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialCode = searchParams.get("code") || "TWV-JKT-001889";
  const [ticketCode, setTicketCode] = useState(initialCode);
  const [checkedInSuccess, setCheckedInSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const result = useMemo(() => {
    return ticketCode ? inspectTicketCode(ticketCode) : null;
  }, [ticketCode]);

  const handleSelectCode = (code) => {
    setCheckedInSuccess(false);
    setIsValidating(true);
    setTimeout(() => {
      setTicketCode(code);
      setIsValidating(false);
    }, 300);
  };

  const handleConfirmCheckIn = () => {
    if (!result?.ticket) return;
    const officerName = user?.name || "Petugas Scanner";
    const gate = user?.assigned_gate || "Gate A - VIP & Early Bird";

    const outcome = executeCheckIn(result.ticket, officerName, gate);
    if (outcome.success) {
      setCheckedInSuccess(true);
    }
  };

  const status = result?.status || "VALID";
  const ticket = result?.ticket;

  const isValid = status === "VALID";
  const isUsed = status === "SUDAH DIGUNAKAN";
  const isCancelled = status === "DIBATALKAN";

  const assignedGate = user?.assigned_gate || "Gate A - VIP & Early Bird";
  const shiftText = user?.shift || "Shift Sore (15:00 - 23:00 WIB)";

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Hasil Validasi E-Tiket
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
            Verifikasi status keaslian dan izin masuk penonton di gate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/officer/scan"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0080f2] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
          >
            <ScanLine size={14} />
            <span>Scan Baru</span>
          </Link>
          <Link
            href="/officer/history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <span>Riwayat Log</span>
          </Link>
        </div>
      </div>

      {/* Multi-Column Workstation Grid: Fills 100% of available width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-none">
        {/* Left Column: Hasil Pemeriksaan & Detail Tiket (lg:col-span-7 xl:col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
          {/* Loading state indicator */}
          {isValidating ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <Loader2 className="h-7 w-7 animate-spin text-[#0080f2]" />
              <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                Memverifikasi data tiket...
              </p>
              <p className="mt-1 text-xs text-slate-400 font-mono">
                Kode: {ticketCode}
              </p>
            </div>
          ) : (
            /* Main Validation Card */
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              {/* Status Header */}
              <div className="text-center">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
                    checkedInSuccess || isValid
                      ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : isUsed
                      ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                      : isCancelled
                      ? "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                  }`}
                >
                  {checkedInSuccess || isValid ? (
                    <CheckCircle2 size={34} />
                  ) : isUsed ? (
                    <AlertTriangle size={34} />
                  ) : isCancelled ? (
                    <Ban size={34} />
                  ) : (
                    <XCircle size={34} />
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <span
                    className={`inline-block rounded-full px-3.5 py-1 text-xs font-medium uppercase tracking-wider border ${
                      checkedInSuccess || isValid
                        ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : isUsed
                        ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                        : isCancelled
                        ? "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                    }`}
                  >
                    {checkedInSuccess ? "CHECK-IN SELESAI" : status}
                  </span>
                </div>

                <h2 className="mt-2.5 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                  {checkedInSuccess
                    ? "Pengunjung Berhasil Check-in"
                    : isValid
                    ? "Tiket Valid — Silakan Masuk"
                    : isUsed
                    ? "Peringatan: Tiket Sudah Digunakan"
                    : isCancelled
                    ? "Tiket Dibatalkan — Tidak Berlaku"
                    : "Tiket Tidak Valid / Tidak Terdaftar"}
                </h2>

                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-normal">
                  {checkedInSuccess
                    ? "Data check-in telah dicatat ke audit log gate dan gelang wristband dapat diserahkan."
                    : result?.message}
                </p>
              </div>

              {/* Ticket Details Box */}
              {ticket && (
                <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-800/30 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 mb-4 dark:border-slate-700/60">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Rincian E-Tiket Penonton
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      {ticket.ticket_code}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Nama Pemegang:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 flex items-center gap-1.5">
                        <User size={15} className="text-slate-400" />
                        {ticket.attendee_name || "Pemegang Tiket"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Kategori Tiket:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 flex items-center gap-1.5">
                        <Ticket size={15} className="text-slate-400" />
                        {ticket.ticket_type || "Reguler"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Nama Event:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm">
                        <Calendar size={14} className="text-slate-400" />
                        {ticket.event_name || "Soundfest Jakarta 2026"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Pintu Masuk (Gate):
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm">
                        <MapPin size={14} className="text-slate-400" />
                        {ticket.gate || "Gate A - VIP & Early Bird"}
                      </span>
                    </div>

                    {ticket.seat_section && (
                      <div>
                        <span className="text-[11px] text-slate-400 block font-normal">
                          Zona / Tempat Duduk:
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block text-xs sm:text-sm">
                          {ticket.seat_section}
                        </span>
                      </div>
                    )}

                    {ticket.booking_code && (
                      <div>
                        <span className="text-[11px] text-slate-400 block font-normal">
                          Kode Booking:
                        </span>
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 mt-0.5 block">
                          {ticket.booking_code}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Box Keterangan Dibatalkan */}
                  {isCancelled && (
                    <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-100/70 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-normal">
                      <span className="font-medium block">Status Pembatalan:</span>
                      <span className="mt-0.5 block">
                        {ticket.cancelled_reason ||
                          "Transaksi tiket telah dibatalkan secara resmi (refund). Tiket tidak memiliki izin masuk."}
                      </span>
                    </div>
                  )}

                  {/* Box Keterangan Sudah Digunakan */}
                  {isUsed && result?.first_checked_in_at && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-100 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-normal">
                      <span className="font-medium flex items-center gap-1.5">
                        <Clock size={13} /> Waktu Check-in Sebelumnya:
                      </span>
                      <span className="mt-1 block">
                        Tiket pertama kali masuk pada{" "}
                        <span className="font-semibold">
                          {new Date(result.first_checked_in_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          WIB
                        </span>{" "}
                        oleh {result.first_checked_in_by || "Petugas Gate"}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                {isValid && !checkedInSuccess && (
                  <button
                    type="button"
                    onClick={handleConfirmCheckIn}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0080f2] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
                  >
                    <FileCheck2 size={16} />
                    <span>Konfirmasi Masuk (Check-in)</span>
                  </button>
                )}

                <Link
                  href="/officer/scan"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#0080f2] bg-white px-6 py-2.5 text-sm font-medium text-[#0080f2] hover:bg-blue-50/50 dark:border-blue-500/60 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-blue-950/30 transition shadow-xs"
                >
                  <ScanLine size={16} />
                  <span>Scan Tiket Berikutnya</span>
                </Link>

                <Link
                  href="/officer/history"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <span>Lihat Riwayat Gate</span>
                </Link>
              </div>
            </div>
          )}

          {/* Backend Integration Note */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Status Integrasi Server: Endpoint Check-in Belum Tersedia (Blocker)</span>
            </div>
            <p className="leading-relaxed font-normal">
              Sistem ini memverifikasi format tiket dan mencatat sesi audit gate lokal. Karena backend <code>TicketWave-BE</code> saat ini belum mengimplementasikan endpoint API check-in tiket (<code>POST /api/scan</code> atau <code>/api/tickets/check-in</code>), status check-in belum tersimpan ke basis data terpusat server.
            </p>
          </div>
        </div>

        {/* Right Column: Penelusuran Kode Manual, Konteks Gate, & SOP (lg:col-span-5 xl:col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
          {/* Manual Ticket Lookup Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
              <Search size={15} className="text-[#0080f2]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pemeriksaan Kode Tiket
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Ketik kode tiket penonton untuk memverifikasi formatnya:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = e.currentTarget.lookupCode.value.trim().toUpperCase();
                if (code) handleSelectCode(code);
              }}
              className="space-y-2 pt-1"
            >
              <input
                name="lookupCode"
                type="text"
                placeholder="Masukkan kode tiket..."
                defaultValue={ticketCode}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-[#0080f2] py-2 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
              >
                Muat Rincian Tiket
              </button>
            </form>
          </div>

          {/* Konteks Posisi Gate Petugas */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-3 dark:border-slate-800/80">
              <MapPin size={13} className="text-slate-400" /> Parameter Posisi Penugasan
            </span>
            <div className="space-y-2 text-xs">
              <p className="flex justify-between">
                <span className="text-slate-400">Gate Aktif:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {assignedGate}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Shift Waktu:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {shiftText}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Petugas Jaga:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {user?.name || "Petugas Scanner"}
                </span>
              </p>
            </div>
          </div>

          {/* SOP Protokol Status Tiket */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info size={14} className="text-slate-400" /> Protokol Penanganan Status
            </span>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-start gap-2">
                <span className="font-bold text-slate-400">&bull;</span>
                <span><strong>VALID:</strong> Serahkan gelang festival &amp; persilakan masuk.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-slate-400">&bull;</span>
                <span><strong>SUDAH DIGUNAKAN:</strong> Tahan penonton, periksa bukti identitas pembeli.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-slate-400">&bull;</span>
                <span><strong>TIDAK VALID:</strong> Arahkan ke meja Customer Service / Help Desk tiket.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OfficerValidationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center text-slate-400 text-sm font-normal">
          Memuat hasil validasi...
        </div>
      }
    >
      <ValidationContent />
    </Suspense>
  );
}
