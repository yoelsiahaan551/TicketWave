"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  CheckCircle2,
  LogIn,
} from "lucide-react";
import api from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { saveBookingEntry } from "@/app/lib/bookingStorage";
import { getOfficialPaymentUrl, getTicketDisplayStatus } from "@/app/lib/payment";
import {
  clearPaymentReturnContext,
  isBookingOwnedByUser,
  isPendingSessionExpired,
  normalizeUtcIso,
  readPaymentReturnContext,
  savePaymentReturnContext,
} from "@/app/lib/paymentContext";
import TicketQr from "@/app/components/user/TicketQr";
import TicketQrModal from "@/app/components/user/TicketQrModal";

const statusStyles = {
  paid: "border border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending_payment: "border border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  cancelled: "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
  expired: "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
  denied: "border border-rose-200/60 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
  refunded: "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const statusLabels = {
  paid: "Dibayar",
  pending_payment: "Menunggu Pembayaran",
  cancelled: "Dibatalkan",
  expired: "Kadaluarsa",
  denied: "Ditolak",
  refunded: "Dikembalikan",
};

const isSandboxSyncAllowed = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION !== "true";

function PesananDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingCode = params?.id;
  const isPaymentReturn = searchParams.get("payment_return") === "1";

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [syncingStatus, setSyncingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedQrTicket, setSelectedQrTicket] = useState(null);
  const [returnedViaBack, setReturnedViaBack] = useState(false);
  const [detailReloadKey, setDetailReloadKey] = useState(0);
  const syncLockRef = useRef(false);

  useEffect(() => {
    const handlePageShow = (event) => {
      if (!event.persisted) return;
      setReturnedViaBack(true);
      setDetailReloadKey((n) => n + 1);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    if (authLoading || !bookingCode) return;

    const matchingContext = readPaymentReturnContext(String(bookingCode));
    const requiresAuthCheck =
      isPaymentReturn ||
      Boolean(matchingContext) ||
      bookingData?.booking?.user_id != null;

    if (requiresAuthCheck && (!isAuthenticated || !user)) {
      const nextPath = `/user/pesanan/${encodeURIComponent(String(bookingCode))}${
        isPaymentReturn ? "?payment_return=1" : ""
      }`;
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const fetchedBooking = bookingData?.booking;
    const canSaveBookmark =
      Boolean(fetchedBooking) &&
      user?.role !== "officer" &&
      ((!fetchedBooking.user_id && !isPaymentReturn) ||
        Boolean(user && isBookingOwnedByUser(fetchedBooking, user)));

    if (canSaveBookmark) {
      saveBookingEntry({
        booking_code: fetchedBooking.booking_code,
        payment_url: fetchedBooking.payment_url || null,
        recipient_email:
          fetchedBooking.recipient_email || fetchedBooking.buyer_email,
        event_name: bookingData.event?.name,
      });
    }

    if (
      fetchedBooking &&
      ["paid", "cancelled", "expired"].includes(fetchedBooking.status)
    ) {
      clearPaymentReturnContext();
    }
  }, [
    authLoading,
    bookingCode,
    bookingData,
    isAuthenticated,
    isPaymentReturn,
    router,
    user,
  ]);

  useEffect(() => {
    let isMounted = true;
    if (!bookingCode) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const res = await api.get(`/checkout/${encodeURIComponent(bookingCode)}`);
        if (isMounted) {
          if (res.success && res.data?.booking) {
            setBookingData(res.data);
          } else {
            setError(res.message || "Pesanan tidak ditemukan");
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.status === 404) {
            setNotFound(true);
            setError(
              `Kode pesanan '${bookingCode}' tidak ditemukan dalam basis data sistem. Pastikan kode booking yang Anda masukkan benar atau lakukan pemesanan baru.`
            );
          } else {
            setError(err.message || "Gagal memuat detail pesanan");
          }
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
  }, [bookingCode, detailReloadKey]);

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
      if (res?.success === true && res.data?.booking?.status === "cancelled") {
        setBookingData((prev) => ({
          ...prev,
          booking: res.data.booking,
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

  const handleSyncPaymentStatus = async () => {
    if (
      syncLockRef.current ||
      syncingStatus ||
      bookingData?.booking?.status !== "pending_payment"
    ) {
      return;
    }

    syncLockRef.current = true;
    setSyncingStatus(true);
    setActionMessage(null);

    try {
      await api.syncPaymentStatus(bookingCode);
      const detailRes = await api.get(`/checkout/${encodeURIComponent(bookingCode)}`);
      if (!detailRes.success || !detailRes.data?.booking) {
        throw new Error("Respons pesanan tidak valid.");
      }
      setBookingData(detailRes.data);

      const updatedStatus = detailRes.data.booking.status;
      if (updatedStatus === "paid") {
        setActionMessage({
          tipe: "sukses",
          teks: "Pembayaran terverifikasi lunas. E-Ticket dan QR Code Anda kini aktif.",
        });
      } else {
        setActionMessage({
          tipe: "sukses",
          teks: "Status pembayaran terbaru berhasil diperiksa dari server.",
        });
      }
    } catch (err) {
      setActionMessage({
        tipe: "error",
        teks:
          err.status === 401
            ? "Silakan masuk ke akun pemilik pesanan atau admin untuk memeriksa status pembayaran."
            : err.message || "Gagal memeriksa status pembayaran dari server.",
      });
    } finally {
      syncLockRef.current = false;
      setSyncingStatus(false);
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

  const booking = bookingData?.booking;
  const requiresAuth =
    isPaymentReturn || Boolean(booking && booking.user_id != null);

  if (loading || (requiresAuth && (authLoading || !isAuthenticated || !user))) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-slate-600" />
        <p className="font-medium text-slate-600 dark:text-slate-400">
          {authLoading || !loading
            ? "Memverifikasi sesi autentikasi..."
            : "Memuat data pesanan dari server..."}
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <h2 className="mb-1.5 text-base font-semibold text-slate-900 dark:text-white">
            {notFound ? "Pesanan Tidak Ditemukan" : "Gagal Memuat Pesanan"}
          </h2>
          <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
            {error || "Data pesanan dengan kode tersebut tidak ditemukan di database."}
          </p>
          <Link
            href="/user/pesanan"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const shouldEnforceOwnership = Boolean(user) && (booking.user_id != null || isPaymentReturn);
  if (shouldEnforceOwnership && !isBookingOwnedByUser(booking, user)) {
    const loginNext = `/login?next=${encodeURIComponent(
      `/user/pesanan/${booking.booking_code}${isPaymentReturn ? "?payment_return=1" : ""}`
    )}`;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="mb-1.5 text-base font-semibold text-slate-900 dark:text-white">
            Akses Pesanan Ditolak
          </h2>
          <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
            Pesanan <strong>{booking.booking_code}</strong> bukan milik akun yang sedang aktif ({user.email}).
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={loginNext}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0080f2] px-4 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
            >
              <LogIn size={14} />
              Masuk dengan Akun Pemilik Pesanan
            </Link>
            <Link
              href="/user/pesanan"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Kembali ke Pesanan Saya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event, ticket_type, tickets = [] } = bookingData;
  const resolvedPaymentUrl = getOfficialPaymentUrl(booking);
  const paymentSessionExpired = isPendingSessionExpired(booking);
  const normalizedExpiredAt = normalizeUtcIso(booking.expired_at) || booking.expired_at;

  const handleContinuePayment = () => {
    if (!resolvedPaymentUrl || !booking?.booking_code || paymentSessionExpired) return;
    savePaymentReturnContext({
      booking_code: booking.booking_code,
      return_path: `/user/pesanan/${encodeURIComponent(booking.booking_code)}?payment_return=1`,
      owner_user_id: user?.id ?? booking.user_id ?? null,
      owner_email: user?.email || booking.buyer_email || null,
    });
    window.location.assign(resolvedPaymentUrl);
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/user/pesanan"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Daftar Pesanan
        </Link>

        {/* Payment Return Banner (Status murni dibaca dari Backend, bukan query string) */}
        {(isPaymentReturn || returnedViaBack) && (
          <div
            role="status"
            className={`mb-5 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${
              booking.status === "paid"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                : booking.status === "pending_payment"
                ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                : "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <p>
              {booking.status === "paid"
                ? "Pembayaran Berhasil — e-ticket dan QR Code Anda telah aktif."
                : booking.status === "pending_payment"
                ? "Anda kembali dari halaman pembayaran Midtrans. Pembayaran belum tercatat lunas (Menunggu Pembayaran). Anda dapat melanjutkan pembayaran yang sama atau memeriksa status pembayaran."
                : `Anda kembali dari halaman pembayaran Midtrans. Status pesanan saat ini: ${
                    statusLabels[booking.status] || booking.status
                  }.`}
            </p>
          </div>
        )}

        {/* Action / Error Banner */}
        {actionMessage && (
          <div
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-slate-300 bg-slate-100 p-3.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-400" />
            <p>{actionMessage.teks}</p>
          </div>
        )}

        {/* Booking Code Tracking Banner */}
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kode Booking Resmi
            </p>
            <p className="mt-0.5 font-mono text-base font-bold text-slate-900 dark:text-white">
              {booking.booking_code}
            </p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Gunakan kode ini di menu <strong>Pesanan Saya</strong> atau <strong>Tiket Saya</strong> untuk melacak tiket kapan saja.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyBookingCode}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {copiedCode ? (
              <>
                <Check size={14} />
                Kode Tersalin!
              </>
            ) : (
              <>
                <Copy size={14} />
                Salin Kode Booking
              </>
            )}
          </button>
        </div>

        {/* Pending Payment Notice */}
        {booking.status === "pending_payment" && booking.expired_at && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Clock className="h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <span className="font-semibold">Batas Waktu Pembayaran: </span>
              Selesaikan sebelum{" "}
              <strong>
                {new Date(normalizedExpiredAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB ({formatTanggal(normalizedExpiredAt)})
              </strong>
              . Melewati batas waktu, kuota otomatis dikembalikan.
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Bukti Reservasi Resmi
              </span>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Detail Pesanan
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-200">
                  <span>{booking.booking_code}</span>
                  <button
                    type="button"
                    onClick={handleCopyBookingCode}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    title="Salin kode booking"
                  >
                    {copiedCode ? <Check size={12} className="text-slate-900 dark:text-white" /> : <Copy size={12} />}
                  </button>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    statusStyles[booking.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Total Pembayaran
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {formatRupiah(booking.total_price)}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Informasi Event
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {event?.name || "Event TicketWave"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {event?.artist_name ||
                    (event?.event_type === "festival"
                      ? `Festival ${event?.days_count || 1} Hari`
                      : "Konser Resmi")}
                </p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {formatTanggal(event?.event_date)}{" "}
                    {event?.event_time ? `• ${event.event_time.slice(0, 5)} WIB` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {event?.venue || "-"}, {event?.city || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            Informasi Pembeli &amp; Penerima
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Nama Pembeli
                </p>
                <p className="text-xs font-medium text-slate-900 dark:text-white">
                  {booking.buyer_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Email Pembeli
                </p>
                <p className="text-xs font-medium text-slate-900 dark:text-white">
                  {booking.buyer_email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Nomor Telepon
                </p>
                <p className="text-xs font-medium text-slate-900 dark:text-white">
                  {booking.buyer_phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Email Penerima E-Ticket
                </p>
                <p className="text-xs font-medium text-slate-900 dark:text-white">
                  {booking.recipient_email || booking.buyer_email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daftar E-Ticket ({tickets.length > 0 ? tickets.length : booking.quantity})
            </h2>
            <Link
              href="/user/ticket"
              className="text-xs font-medium text-[#0080f2] hover:underline"
            >
              Buka Halaman Tiket Saya &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {tickets.length > 0 ? (
              tickets.map((rawTicket, idx) => {
                const ticket = {
                  ...rawTicket,
                  status: getTicketDisplayStatus(booking, rawTicket),
                  booking_code: booking.booking_code,
                  booking_status: booking.status,
                  buyer_name: booking.buyer_name,
                  event_name: event?.name || "Event TicketWave",
                  ticket_type_name: ticket_type?.name || "Standard",
                };
                const canShowActiveQr =
                  booking.status === "paid" &&
                  ticket.status === "valid" &&
                  Boolean(ticket.qr_token);
                const isUsedTicket = ticket.status === "used";

                return (
                <div
                  key={ticket.id || idx}
                  className="rounded-xl border border-slate-100 p-4 transition-colors dark:border-slate-800"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-400">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          {ticket.ticket_code}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Kategori: <span className="font-medium text-slate-700 dark:text-slate-300">{ticket.ticket_type_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          ticket.status === "valid"
                            ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : isUsedTicket
                            ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                            : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {ticket.status === "valid"
                          ? "Valid / Aktif"
                          : isUsedTicket
                          ? "Sudah Digunakan"
                          : ticket.status === "pending_payment"
                          ? "Menunggu Pembayaran"
                          : ticket.status === "expired"
                          ? "Kedaluwarsa"
                          : "Dibatalkan"}
                      </span>

                      {canShowActiveQr && (
                        <button
                          type="button"
                          onClick={() => setSelectedQrTicket(ticket)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0080f2] px-3 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          Tampilkan QR
                        </button>
                      )}

                      {booking.status === "paid" && isUsedTicket && (
                        <button
                          type="button"
                          onClick={() => setSelectedQrTicket(ticket)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          Detail Tiket
                        </button>
                      )}
                    </div>
                  </div>

                  {canShowActiveQr && (
                    <div className="mt-4 flex flex-col items-center rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                      <TicketQr
                        value={ticket.qr_token}
                        ticketCode={ticket.ticket_code}
                        size={220}
                        showCode
                      />
                      <p className="mt-2.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
                        Tunjukkan QR resmi ini kepada petugas di pintu masuk (gate).
                      </p>
                    </div>
                  )}

                  {booking.status === "paid" && isUsedTicket && (
                    <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                      Status: <strong>Sudah Digunakan</strong>
                      {ticket.checked_in_at
                        ? ` pada ${new Date(
                            /Z$|[+-]\d{2}:?\d{2}$/.test(ticket.checked_in_at)
                              ? ticket.checked_in_at
                              : `${ticket.checked_in_at}Z`
                          ).toLocaleString("id-ID")}`
                        : ""}
                      . Tiket tidak lagi valid untuk masuk kembali.
                    </div>
                  )}

                  {booking.status !== "paid" && (
                    <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {booking.status === "pending_payment"
                        ? "QR tiket akan aktif otomatis setelah pembayaran selesai diverifikasi."
                        : "QR tiket tidak aktif karena pesanan tidak berstatus dibayar."}
                    </p>
                  )}
                </div>
              ); })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Tidak ada data tiket spesifik untuk pesanan ini.
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            Rincian Harga
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>
                {ticket_type?.name || "Tiket"} ({booking.quantity} ×{" "}
                {formatRupiah(booking.unit_price)})
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatRupiah(Number(booking.unit_price || 0) * Number(booking.quantity || 0))}
              </span>
            </div>
            {Number(booking.discount_percent) > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Diskon Fase Aktif ({booking.discount_percent}%)</span>
                <span>Termasuk dalam harga satuan</span>
              </div>
            )}
            <div className="border-t border-slate-100 pt-2.5 dark:border-slate-800">
              <div className="flex justify-between text-sm font-semibold text-slate-900 dark:text-white">
                <span>Total Pembayaran</span>
                <span className="text-[#0080f2] font-bold">
                  {formatRupiah(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {booking.status === "pending_payment" && (
            <>
              {isSandboxSyncAllowed && (
                <button
                  type="button"
                  onClick={handleSyncPaymentStatus}
                  disabled={syncingStatus || cancelling}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-xs font-semibold text-[#0080f2] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  {syncingStatus ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {syncingStatus
                      ? "Memeriksa Status..."
                      : "Periksa Status Pembayaran"}
                  </span>
                </button>
              )}

              {paymentSessionExpired ? (
                <p
                  role="alert"
                  className="flex-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  Sesi pembayaran untuk pesanan ini telah kedaluwarsa. Klik <strong>Periksa Status Pembayaran</strong> untuk memperbarui status terbaru dari server.
                </p>
              ) : resolvedPaymentUrl ? (
                <button
                  type="button"
                  onClick={handleContinuePayment}
                  disabled={cancelling || syncingStatus}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0080f2] px-4 py-2.5 text-center text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lanjutkan Pembayaran
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              ) : (
                <p role="alert" className="rounded-xl border border-amber-200 p-3 text-xs text-slate-700 dark:text-slate-300">
                  Tautan pembayaran resmi belum tersedia. Pembayaran belum dikonfirmasi; hubungi penyelenggara atau periksa kembali status.
                </p>
              )}

              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling || syncingStatus}
                className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
              </button>
            </>
          )}

          {booking.status === "paid" && (
            <Link
              href="/user/ticket"
              className="flex-1 rounded-xl bg-[#0080f2] px-4 py-2.5 text-center text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
            >
              Lihat E-Ticket &amp; QR Code Saya
            </Link>
          )}

          {booking.status === "cancelled" && (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 text-center text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Pesanan ini telah dibatalkan.
            </div>
          )}

          {booking.status === "expired" && (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 text-center text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Waktu pembayaran untuk pesanan ini telah habis (kadaluarsa).
            </div>
          )}

          {booking.status === "denied" && (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 text-center text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Pembayaran untuk pesanan ini ditolak oleh penyedia pembayaran.
            </div>
          )}

          {booking.status === "refunded" && (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 text-center text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Dana untuk pesanan ini telah dikembalikan.
            </div>
          )}
        </div>

        <TicketQrModal
          isOpen={Boolean(selectedQrTicket)}
          tickets={selectedQrTicket ? [selectedQrTicket] : []}
          initialTicketCode={selectedQrTicket?.ticket_code}
          showOrderLink={false}
          onClose={() => setSelectedQrTicket(null)}
        />
      </div>
    </div>
  );
}

export default function PesananDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-slate-600" />
          <p className="font-medium text-slate-600 dark:text-slate-400">
            Memuat detail pesanan...
          </p>
        </div>
      }
    >
      <PesananDetailContent />
    </Suspense>
  );
}
