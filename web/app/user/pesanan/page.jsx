"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  CreditCard,
  Search,
  RefreshCw,
  Ticket,
  QrCode,
  Info,
  ArrowRight,
  Clock,
} from "lucide-react";
import api from "@/app/lib/api";
import TicketQrModal from "@/app/components/user/TicketQrModal";
import { getTicketDisplayStatus } from "@/app/lib/payment";
import {
  fetchAllSavedBookings,
  saveBookingEntry,
} from "@/app/lib/bookingStorage";

const statusStyles = {
  paid: "border border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending_payment: "border border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  cancelled: "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
  expired: "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
  failed: "border border-rose-200/60 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
};

const statusLabels = {
  paid: "Dibayar",
  pending_payment: "Menunggu Pembayaran",
  cancelled: "Dibatalkan",
  expired: "Kadaluarsa",
  failed: "Gagal",
};

export default function PesananPage() {
  const [bookings, setBookings] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const [lookupCode, setLookupCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState(null);
  const [cancellingCode, setCancellingCode] = useState(null);
  const [qrModalData, setQrModalData] = useState(null);

  const loadBookings = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setLoadError(null);
    try {
      const results = await fetchAllSavedBookings();
      setBookings(results.bookings);
      setLoadError(results.errors.length ? `${results.errors.length} dari ${results.total} kode gagal dimuat. Daftar dan jumlah hanya mencakup hasil yang berhasil dimuat. ${results.errors.map((error) => `${error.booking_code}: ${error.message}${error.status ? ` (HTTP ${error.status})` : ""}`).join("; ")} Gunakan Segarkan Status untuk mencoba lagi.` : null);
    } catch (err) {
      setBookings([]);
      setLoadError(err.message || "Gagal memuat pesanan dari server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadBookings();
    }, 0);
    return () => clearTimeout(t);
  }, [loadBookings]);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    const code = lookupCode.trim().toUpperCase();
    if (!code) return;

    setLookupLoading(true);
    setLookupMessage(null);
    try {
      const res = await api.get(`/checkout/${encodeURIComponent(code)}`);
      if (!res.success || !res.data?.booking) throw new Error(res.message || "Respons pesanan tidak valid.");
      if (res.data?.booking) {
        saveBookingEntry({
          booking_code: res.data.booking.booking_code,
          payment_url: res.data.booking.payment_url || null,
          recipient_email: res.data.booking.recipient_email || res.data.booking.buyer_email,
          event_name: res.data.event?.name,
        });
        setLookupCode("");
        setLookupMessage({
          type: "success",
          text: `Pesanan ${res.data.booking.booking_code} berhasil ditemukan dan ditambahkan ke daftar Anda.`,
        });
        await loadBookings();
      }
    } catch (err) {
      setLookupMessage({
        type: "error",
        text: err.message || `Kode booking "${code}" tidak ditemukan di server.`,
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCancelOrder = async (bookingCode) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan pesanan ${bookingCode}? Kuota tiket yang direservasi akan dikembalikan ke event.`
    );
    if (!confirmed) return;

    setCancellingCode(bookingCode);
    setLookupMessage(null);
    try {
      const res = await api.post(`/checkout/${encodeURIComponent(bookingCode)}/cancel`);
      if (res?.success !== true || res.data?.booking?.status !== "cancelled") throw new Error("Pembatalan belum dikonfirmasi server.");
      setLookupMessage({
        type: "success",
        text: `Pesanan ${bookingCode} berhasil dibatalkan.`,
      });
      await loadBookings();
    } catch (err) {
      setLookupMessage({
        type: "error",
        text: err.message || `Gagal membatalkan pesanan ${bookingCode}.`,
      });
    } finally {
      setCancellingCode(null);
    }
  };

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);

  const filteredBookings = bookings.filter((item) => {
    if (activeFilter === "all") return true;
    return item.booking?.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
              Manajemen Transaksi
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Pesanan Tersimpan di Perangkat
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Lacak status pembayaran, batas waktu reservasi, dan e-ticket dari kode booking Anda secara real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Segarkan Status
          </button>
        </div>

        {/* Lookup Bar */}
        <div className="mt-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Lacak atau Tambahkan Kode Booking
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Masukkan kode booking resmi (contoh: <code className="font-mono font-medium">TKTW-20260405-ABC123</code>) untuk memuat transaksi.
              </p>
            </div>

            <form
              onSubmit={handleLookupSubmit}
              className="flex w-full max-w-md flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder="TKTW-YYYYMMDD-XXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 font-mono text-xs uppercase text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="shrink-0 rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4] disabled:opacity-60"
              >
                {lookupLoading ? "Mencari..." : "Cek Pesanan"}
              </button>
            </form>
          </div>

          {lookupMessage && (
            <div
              className="mt-3 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {lookupMessage.text}
            </div>
          )}

          <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <span>
              Daftar ini hanya memuat bookmark kode booking di perangkat ini, bukan seluruh riwayat akun. Rincian dan status dibaca dari server. Pesanan akun memerlukan login pemiliknya; kode booking tamu harus dijaga kerahasiaannya.
            </span>
          </div>
        </div>

        {loadError && <p role="alert" className="mt-4 rounded-xl border border-red-200 p-4 text-sm text-red-700 dark:text-red-300">{loadError}</p>}
        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: `Semua (${bookings.length})` },
            {
              id: "pending_payment",
              label: `Menunggu Pembayaran (${
                bookings.filter((b) => b.booking?.status === "pending_payment").length
              })`,
            },
            {
              id: "paid",
              label: `Dibayar (${
                bookings.filter((b) => b.booking?.status === "paid").length
              })`,
            },
            {
              id: "cancelled",
              label: `Dibatalkan (${
                bookings.filter((b) => b.booking?.status === "cancelled").length
              })`,
            },
            {
              id: "expired",
              label: `Kadaluarsa (${
                bookings.filter((b) => b.booking?.status === "expired").length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                activeFilter === tab.id
                  ? "bg-[#0080f2] text-white shadow-xs"
                  : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 space-y-3">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-32 animate-pulse rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div className="mt-6 space-y-3.5">
            {filteredBookings.map(({ booking, event, ticket_type, tickets }) => {
              const modalTickets = (tickets || []).map((t) => ({
                ...t,
                status: getTicketDisplayStatus(booking, t),
                booking_code: booking.booking_code,
                booking_status: booking.status,
                buyer_name: booking.buyer_name,
                event_name: event?.name || "Event TicketWave",
                ticket_type_name: ticket_type?.name || "Standard",
              }));
              const validTicket = modalTickets.find(
                (t) => t.status === "valid" && Boolean(t.qr_token)
              );
              const usedTicket = modalTickets.find((t) => t.status === "used");

              return (
              <div
                key={booking.booking_code}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {booking.booking_code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          statusStyles[booking.status] || statusStyles.expired
                        }`}
                      >
                        {statusLabels[booking.status] || booking.status}
                      </span>
                      {ticket_type?.name && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <Ticket size={12} />
                          {ticket_type.name} ({booking.quantity}x)
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                      {event?.name || "Event TicketWave"}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {event?.event_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(event.event_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                        </span>
                      )}
                      {event?.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400" />
                          {event.venue}, {event.city}
                        </span>
                      )}
                      {booking.status === "pending_payment" && booking.expired_at && (
                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                          <Clock size={13} />
                          Batas bayar:{" "}
                          {new Date(booking.expired_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center lg:flex-col lg:items-end lg:border-t-0 lg:pt-0 dark:border-slate-800">
                    <div className="lg:text-right">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Total ({booking.quantity} Tiket)
                      </p>
                      <p className="text-base font-bold text-[#0080f2]">
                        {formatRupiah(booking.total_price)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {booking.status === "pending_payment" && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(booking.booking_code)}
                          disabled={cancellingCode === booking.booking_code}
                          className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {cancellingCode === booking.booking_code
                            ? "Membatalkan..."
                            : "Batalkan"}
                        </button>
                      )}

                      {booking.status === "paid" && validTicket && (
                        <button
                          type="button"
                          onClick={() =>
                            setQrModalData({
                              tickets: modalTickets,
                              initialTicketCode: validTicket.ticket_code,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#0080f2] bg-blue-50/60 px-3.5 py-1.5 text-xs font-medium text-[#0080f2] transition hover:bg-blue-100/70 dark:border-blue-500/60 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
                        >
                          <QrCode size={13} />
                          Tampilkan QR
                        </button>
                      )}

                      {booking.status === "paid" && !validTicket && usedTicket && (
                        <button
                          type="button"
                          onClick={() =>
                            setQrModalData({
                              tickets: modalTickets,
                              initialTicketCode: usedTicket.ticket_code,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/70 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100/70 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                        >
                          Status: Sudah Digunakan
                        </button>
                      )}

                      <Link
                        href={`/user/pesanan/${booking.booking_code}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition"
                      >
                        Lihat Detail
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !loadError && filteredBookings.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <CreditCard size={24} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Belum Ada Pesanan Tersimpan
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Anda belum memiliki pesanan dengan filter ini di perangkat Anda. Buat pesanan baru dari halaman katalog event atau masukkan kode booking Anda pada kolom pelacakan di atas.
            </p>
            <Link
              href="/user/event"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
            >
              Jelajahi Event Aktif
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <TicketQrModal
          isOpen={Boolean(qrModalData)}
          tickets={qrModalData?.tickets || []}
          initialTicketCode={qrModalData?.initialTicketCode}
          showOrderLink
          onClose={() => setQrModalData(null)}
        />
      </div>
    </div>
  );
}