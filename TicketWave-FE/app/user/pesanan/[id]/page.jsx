"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  ExternalLink,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Clock,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import api from "@/app/lib/api";
import {
  saveBookingEntry,
  getSavedPaymentUrl,
} from "@/app/lib/bookingStorage";

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  pending_payment:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
  expired: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const statusLabels = {
  paid: "Dibayar",
  pending_payment: "Menunggu Pembayaran",
  cancelled: "Dibatalkan",
  expired: "Kadaluarsa",
};

export default function PesananDetailPage() {
  const params = useParams();
  const bookingCode = params?.id;

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!bookingCode) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/checkout/${encodeURIComponent(bookingCode)}`);
        if (isMounted) {
          if (res.success && res.data?.booking) {
            setBookingData(res.data);
            saveBookingEntry({
              booking_code: res.data.booking.booking_code,
              payment_url: res.data.booking.payment_url || null,
              recipient_email:
                res.data.booking.recipient_email || res.data.booking.buyer_email,
              event_name: res.data.event?.name,
            });
          } else {
            setError(res.message || "Pesanan tidak ditemukan");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Gagal memuat detail pesanan");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [bookingCode]);

  const handleCopyBookingCode = () => {
    if (!bookingData?.booking?.booking_code) return;
    navigator.clipboard?.writeText(bookingData.booking.booking_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCancel = async () => {
    if (!bookingData?.booking?.booking_code) return;
    const confirmCancel = window.confirm(
      "Apakah Anda yakin ingin membatalkan pesanan ini? Kuota tiket yang dipesan akan dikembalikan ke sistem."
    );
    if (!confirmCancel) return;

    setCancelling(true);
    setActionMessage(null);

    try {
      const res = await api.post(
        `/checkout/${encodeURIComponent(bookingData.booking.booking_code)}/cancel`
      );
      if (res.success && res.data?.booking) {
        setBookingData((prev) => ({
          ...prev,
          booking: res.data.booking,
          tickets: (prev.tickets || []).map((t) => ({
            ...t,
            status: "cancelled",
          })),
        }));
        setActionMessage({
          tipe: "sukses",
          teks: "Pesanan berhasil dibatalkan dan stok tiket telah dikembalikan.",
        });
      } else {
        setActionMessage({
          tipe: "error",
          teks: res.message || "Gagal membatalkan pesanan.",
        });
      }
    } catch (err) {
      setActionMessage({
        tipe: "error",
        teks: err.message || "Terjadi kesalahan saat membatalkan pesanan.",
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatTanggal = (d) => {
    if (!d) return "Jadwal Menyusul";
    try {
      return new Date(d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0080f2]" />
        <p className="font-medium text-slate-600 dark:text-slate-400">
          Memuat data pesanan dari server...
        </p>
      </div>
    );
  }

  if (error || !bookingData?.booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            {error || "Data pesanan dengan kode tersebut tidak ditemukan di database."}
          </p>
          <Link
            href="/user/pesanan"
            className="inline-flex items-center justify-center rounded-xl bg-[#0080f2] px-6 py-3 font-bold text-white shadow-md shadow-[#0080f2]/20 transition hover:scale-[1.02]"
          >
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const { booking, event, ticket_type, tickets = [] } = bookingData;
  const resolvedPaymentUrl =
    booking.payment_url ||
    getSavedPaymentUrl(booking.booking_code) ||
    `https://app.midtrans.com/snap/v2/vtweb/${booking.booking_code}`;

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Back Button */}
        <Link
          href="/user/pesanan"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-[#0080f2] dark:text-slate-400 dark:hover:text-[#0080f2]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Pesanan
        </Link>

        {/* Action / Error Banner */}
        {actionMessage && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
              actionMessage.tipe === "error"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
            }`}
          >
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <p>{actionMessage.teks}</p>
          </div>
        )}

        {/* Booking Code Tracking Banner */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-[#0080f2]/30 bg-[#0080f2]/10 p-5 sm:flex-row sm:items-center dark:border-[#0080f2]/50 dark:bg-[#0080f2]/15">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
              Kode Booking Resmi (Simpan untuk Pelacakan Tanpa Akun)
            </p>
            <p className="mt-1 font-mono text-xl font-black text-slate-900 dark:text-white">
              {booking.booking_code}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Gunakan kode booking ini kapan saja di menu <strong>Pesanan Saya</strong> atau <strong>Tiket Saya</strong> untuk melacak status pembayaran dan e-ticket tanpa perlu login.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyBookingCode}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#0080f2] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#0080f2]/20 transition hover:scale-[1.02]"
          >
            {copiedCode ? (
              <>
                <Check size={15} />
                Kode Tersalin!
              </>
            ) : (
              <>
                <Copy size={15} />
                Salin Kode Booking
              </>
            )}
          </button>
        </div>

        {/* Pending Payment Notice */}
        {booking.status === "pending_payment" && booking.expired_at && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold">Batas Waktu Pembayaran (15 Menit): </span>
              Selesaikan pembayaran sebelum{" "}
              <strong>
                {new Date(booking.expired_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB ({formatTanggal(booking.expired_at)})
              </strong>
              . Jika melewati batas waktu, kuota tiket akan otomatis dikembalikan.
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
                Bukti Reservasi Resmi
              </span>
              <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                Detail Pesanan
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 font-mono text-sm font-bold text-slate-900 dark:bg-slate-800 dark:text-[#0080f2]">
                  <span>{booking.booking_code}</span>
                  <button
                    type="button"
                    onClick={handleCopyBookingCode}
                    className="text-slate-400 hover:text-[#0080f2]"
                    title="Salin kode booking"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    statusStyles[booking.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Pembayaran
              </p>
              <p className="text-2xl font-black text-[#0080f2] dark:text-[#0080f2] sm:text-3xl">
                {formatRupiah(booking.total_price)}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="mb-4 text-base font-black text-slate-900 dark:text-white">
              Informasi Event
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {event?.name || "Event TicketWave"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {event?.artist_name ||
                    (event?.event_type === "festival"
                      ? `Festival ${event?.days_count || 1} Hari`
                      : "Konser Resmi")}
                </p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-[#0080f2] dark:text-[#0080f2]" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatTanggal(event?.event_date)}{" "}
                    {event?.event_time ? `• ${event.event_time.slice(0, 5)} WIB` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-[#0080f2] dark:text-[#0080f2]" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {event?.venue || "-"}, {event?.city || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            Informasi Pembeli &amp; Penerima
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nama Pembeli
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {booking.buyer_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email Pembeli
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {booking.buyer_email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nomor Telepon
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {booking.buyer_phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#0080f2] dark:text-[#0080f2]" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email Penerima E-Ticket
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {booking.recipient_email || booking.buyer_email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Daftar E-Ticket ({tickets.length > 0 ? tickets.length : booking.quantity})
            </h2>
            <Link
              href="/user/ticket"
              className="text-xs font-bold text-[#0080f2] hover:underline dark:text-[#0080f2]"
            >
              Buka Halaman Tiket Saya &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {tickets.length > 0 ? (
              tickets.map((ticket, idx) => (
                <div
                  key={ticket.id || idx}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0080f2]/10 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-black text-slate-900 dark:text-white">
                        {ticket.ticket_code}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kategori: <strong>{ticket_type?.name || "Standard"}</strong>
                        {ticket.qr_token ? ` • QR Token: ${ticket.qr_token.slice(0, 12)}...` : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                      ticket.status === "valid"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : ticket.status === "cancelled"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {ticket.status === "valid"
                      ? "Valid"
                      : ticket.status === "used"
                      ? "Sudah Check-In"
                      : "Dibatalkan"}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Tidak ada data tiket spesifik untuk pesanan ini.
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            Rincian Harga
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>
                {ticket_type?.name || "Tiket"} ({booking.quantity} ×{" "}
                {formatRupiah(booking.unit_price)})
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatRupiah(Number(booking.unit_price || 0) * Number(booking.quantity || 0))}
              </span>
            </div>
            {Number(booking.discount_percent) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Diskon Fase Aktif ({booking.discount_percent}%)</span>
                <span>Termasuk dalam harga satuan</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total Pembayaran</span>
                <span className="text-[#0080f2] dark:text-[#0080f2]">
                  {formatRupiah(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {booking.status === "pending_payment" && (
            <>
              <a
                href={resolvedPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-4 text-center font-bold text-white shadow-lg shadow-[#0080f2]/20 transition-transform hover:scale-[1.01]"
              >
                Lanjutkan Pembayaran (Midtrans Snap)
                <ExternalLink className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-2xl border border-red-300 px-6 py-4 text-center font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
              </button>
            </>
          )}

          {booking.status === "paid" && (
            <Link
              href="/user/ticket"
              className="flex-1 rounded-2xl bg-[#0080f2] px-6 py-4 text-center font-bold text-white shadow-lg shadow-[#0080f2]/20 transition-transform hover:scale-[1.01]"
            >
              Lihat E-Ticket &amp; QR Code Saya
            </Link>
          )}

          {booking.status === "cancelled" && (
            <div className="w-full rounded-2xl border border-red-200 bg-red-50/60 py-4 text-center text-sm font-bold text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              Pesanan ini telah dibatalkan.
            </div>
          )}

          {booking.status === "expired" && (
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-4 text-center text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Waktu pembayaran untuk pesanan ini telah habis (kadaluarsa).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
