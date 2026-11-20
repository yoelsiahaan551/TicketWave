"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  inspectTicketCodeAsync,
  executeCheckIn,
  formatTicketCodeForDisplay,
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
  Info,
  ArrowLeft,
} from "lucide-react";

function normalizeUtcIso(rawIso) {
  if (typeof rawIso !== "string" || !rawIso.trim()) return null;
  const trimmed = rawIso.trim();
  return /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed) ? trimmed : `${trimmed}Z`;
}

function ValidationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const rawCode = (searchParams.get("code") || "").trim();
  const [lookupVersion, setLookupVersion] = useState(0);
  const requestRef = useRef(0);
  const submittingRef = useRef(false);
  const [checkedInSuccess, setCheckedInSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(Boolean(rawCode));
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!rawCode) {
      router.replace("/officer/scan");
      return undefined;
    }

    const request = ++requestRef.current;
    let active = true;
    const timer = setTimeout(async () => {
      setResult(null);
      setCheckedInSuccess(false);
      setIsValidating(true);
      const response = await inspectTicketCodeAsync(rawCode);
      if (!active || request !== requestRef.current) return;
      setResult(response);
      setIsValidating(false);
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [rawCode, lookupVersion, router]);

  if (!rawCode) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <Loader2 className="h-7 w-7 animate-spin text-[#0080f2]" />
        <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">
          Mengalihkan ke Scan &amp; Validasi Tiket...
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Mulai pemeriksaan tiket melalui kamera, upload gambar QR, atau input manual.
        </p>
        <Link
          href="/officer/scan"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0080f2] px-4 py-2 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
        >
          <ScanLine size={14} />
          <span>Kembali ke Scan Tiket</span>
        </Link>
      </div>
    );
  }

  const handleRetryValidation = () => {
    if (submittingRef.current) return;
    requestRef.current++;
    setResult(null);
    setIsValidating(true);
    setCheckedInSuccess(false);
    setLookupVersion((value) => value + 1);
  };

  const handleConfirmCheckIn = async () => {
    if (
      !result?.server_verified ||
      result.status !== "VALID" ||
      !result.ticket ||
      isValidating ||
      submittingRef.current
    ) {
      return;
    }
    submittingRef.current = true;
    setIsSubmittingCheckIn(true);
    const request = requestRef.current;
    try {
      const outcome = await executeCheckIn(result.ticket);
      if (request !== requestRef.current) return;
      if (outcome.success) {
        setCheckedInSuccess(true);
        setResult((prev) => ({
          ...prev,
          message: outcome.message,
          ticket: { ...prev.ticket, ...outcome.ticket, status: "used" },
        }));
      } else {
        setResult((prev) => ({
          ...prev,
          ...outcome,
          ticket: outcome.ticket || prev.ticket,
        }));
      }
    } finally {
      submittingRef.current = false;
      setIsSubmittingCheckIn(false);
    }
  };

  const status = result?.status || "MEMERIKSA";
  const ticket = result?.ticket;

  const isValid = status === "VALID" && result?.server_verified && !isValidating;
  const isUsed = status === "SUDAH DIGUNAKAN";
  const isCancelled = status === "DIBATALKAN";
  const normalizedFirstCheckInAt = normalizeUtcIso(result?.first_checked_in_at);
  const assignedGate = user?.assigned_gate || "Belum dapat diverifikasi";

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Rincian Validasi &amp; Check-in
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Terverifikasi server
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
            Periksa detail tiket sebelum mengonfirmasi check-in pengunjung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/officer/scan"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0080f2] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Scan</span>
          </Link>
          <Link
            href="/officer/history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <span>Riwayat Check-in</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-none">
        {/* Left Column: Ticket Detail & Check-in Confirmation */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
          {isValidating ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <Loader2 className="h-7 w-7 animate-spin text-[#0080f2]" />
              <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                Memuat rincian tiket dari server...
              </p>
              <p className="mt-1 text-xs text-slate-400 font-mono">
                Kode: {formatTicketCodeForDisplay(rawCode, null)}
              </p>
            </div>
          ) : (
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
                    ? "Tiket Valid — Konfirmasi Check-in"
                    : isUsed
                    ? "Peringatan: Tiket Sudah Digunakan"
                    : isCancelled
                    ? "Tiket Dibatalkan — Tidak Berlaku"
                    : "Tiket Tidak Valid"}
                </h2>

                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-normal">
                  {checkedInSuccess
                    ? "Check-in telah dikonfirmasi server. Pengunjung dapat dipersilakan masuk."
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
                        Event
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm">
                        <Calendar size={14} className="text-slate-400" />
                        {ticket.event_name || "—"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Kategori Tiket
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 flex items-center gap-1.5">
                        <Ticket size={15} className="text-slate-400" />
                        {ticket.ticket_type || "—"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Pemilik
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 flex items-center gap-1.5">
                        <User size={15} className="text-slate-400" />
                        {ticket.attendee_name || "Pemegang Tiket"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Status Tiket
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 block">
                        {checkedInSuccess
                          ? "Sudah Check-in (used)"
                          : isValid
                          ? "Valid (Siap Check-in)"
                          : status}
                      </span>
                    </div>

                    {ticket.booking_code && (
                      <div>
                        <span className="text-[11px] text-slate-400 block font-normal">
                          Kode Booking
                        </span>
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 mt-0.5 block">
                          {ticket.booking_code}
                        </span>
                      </div>
                    )}
                  </div>

                  {isCancelled && (
                    <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-100/70 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-normal">
                      <span className="font-medium block">Status Pembatalan:</span>
                      <span className="mt-0.5 block">
                        {ticket.cancelled_reason ||
                          "Transaksi tiket telah dibatalkan. Tiket tidak memiliki izin masuk."}
                      </span>
                    </div>
                  )}

                  {isUsed && normalizedFirstCheckInAt && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 font-normal">
                      <span className="font-medium flex items-center gap-1.5">
                        <Clock size={13} /> Waktu Check-in Sebelumnya:
                      </span>
                      <span className="mt-1 block">
                        Tiket pertama kali masuk pada{" "}
                        <span className="font-semibold">
                          {new Date(normalizedFirstCheckInAt).toLocaleTimeString(
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
                {!result?.server_verified && !isValidating && (
                  <button
                    type="button"
                    onClick={handleRetryValidation}
                    disabled={isSubmittingCheckIn}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    Periksa Ulang Status Tiket
                  </button>
                )}

                {isValid && !checkedInSuccess && (
                  <button
                    type="button"
                    onClick={handleConfirmCheckIn}
                    disabled={
                      isSubmittingCheckIn || isValidating || !result?.server_verified
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0080f2] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0070d4] transition shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingCheckIn ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileCheck2 size={16} />
                    )}
                    <span>
                      {isSubmittingCheckIn
                        ? "Memproses Check-in..."
                        : "Konfirmasi Masuk (Check-in)"}
                    </span>
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
                  <span>Riwayat Check-in</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Officer Context & Protocol */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-3 dark:border-slate-800/80">
              <MapPin size={13} className="text-slate-400" /> Petugas Pemeriksa
            </span>
            <div className="space-y-2 text-xs">
              <p className="flex justify-between">
                <span className="text-slate-400">Petugas Jaga</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {user?.name || "Petugas Scanner"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Gate Aktif</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {assignedGate}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Verifikasi Server</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {isValidating
                    ? "Memeriksa..."
                    : result?.server_verified
                    ? "Diterima"
                    : "Belum terverifikasi"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info size={14} className="text-slate-400" /> Protokol Status Tiket
            </span>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <strong>VALID:</strong> Konfirmasi masuk lalu tunggu status{" "}
                <em>CHECK-IN SELESAI</em> sebelum memasang gelang.
              </p>
              <p>
                <strong>SUDAH DIGUNAKAN:</strong> Tahan pengunjung dan periksa ulang bukti pembelian resmi.
              </p>
              <p>
                <strong>TIDAK VALID:</strong> Arahkan ke meja Help Desk tiket.
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
          Memuat rincian validasi...
        </div>
      }
    >
      <ValidationContent />
    </Suspense>
  );
}
