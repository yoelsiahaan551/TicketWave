"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Ticket,
  QrCode,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import api from "@/app/lib/api";
import TicketQr from "@/app/components/user/TicketQr";
import { getTicketDisplayStatus } from "@/app/lib/payment";
import {
  fetchAllSavedBookings,
  saveBookingEntry,
} from "@/app/lib/bookingStorage";

const statusStyles = {
  valid:
    "border border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  used: "border border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  cancelled:
    "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const statusLabels = {
  pending_payment: "Menunggu Pembayaran",
  expired: "Kedaluwarsa",
  valid: "Valid / Aktif",
  used: "Sudah Check-In",
  cancelled: "Dibatalkan",
};

export default function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [bookingCodeInput, setBookingCodeInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  const loadAllTickets = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setLoadError(null);
    setSelectedTicket(null);
    try {
      const { bookings, errors, total } = await fetchAllSavedBookings();
      setLoadError(errors.length ? `${errors.length} dari ${total} kode gagal dimuat. Daftar dan jumlah hanya mencakup hasil yang berhasil dimuat. ${errors.map((error) => `${error.booking_code}: ${error.message}${error.status ? ` (HTTP ${error.status})` : ""}`).join("; ")} Gunakan Muat Ulang Tiket untuk mencoba lagi.` : null);
      const aggregated = [];

      bookings.forEach(({ booking, event, ticket_type, tickets: tList }) => {
        (tList || []).forEach((t) => {
          aggregated.push({
            ...t,
            status: getTicketDisplayStatus(booking, t),
            booking_code: booking?.booking_code,
            booking_status: booking?.status,
            buyer_name: booking?.buyer_name,
            recipient_email: booking?.recipient_email || booking?.buyer_email,
            event_id: event?.id,
            event_name: event?.name || "Event TicketWave",
            artist_name:
              event?.artist_name ||
              (event?.event_type === "festival"
                ? `Festival ${event?.days_count || 1} Hari`
                : "Penampil Utama"),
            venue: event?.venue ? `${event.venue}, ${event.city || ""}` : event?.city || "-",
            event_date: event?.event_date,
            event_time: event?.event_time,
            ticket_type_name: ticket_type?.name || "Regular",
          });
        });
      });

      setTickets(aggregated);
    } catch (err) {
      setTickets([]);
      setLoadError(err.message || "Gagal memuat tiket dari server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadAllTickets();
    }, 0);
    return () => clearTimeout(t);
  }, [loadAllTickets]);

  const handleImportBooking = async (e) => {
    e.preventDefault();
    const code = bookingCodeInput.trim().toUpperCase();
    if (!code) return;

    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await api.get(`/checkout/${encodeURIComponent(code)}`);
      if (!res.success || !res.data?.booking) throw new Error(res.message || "Respons pesanan tidak valid.");
      if (res.data?.booking) {
        saveBookingEntry({
          booking_code: res.data.booking.booking_code,
          payment_url: res.data.booking.payment_url || null,
          recipient_email:
            res.data.booking.recipient_email || res.data.booking.buyer_email,
          event_name: res.data.event?.name,
        });
        setBookingCodeInput("");
        await loadAllTickets();
      }
    } catch (err) {
      setLookupError(err.message || `Kode booking "${code}" tidak ditemukan.`);
    } finally {
      setLookupLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === "all") return true;
    return t.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
              E-Ticket &amp; QR Pass
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Tiket Saya
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Tiket dari kode booking yang disimpan pada perangkat ini. Status dibaca dari server; daftar ini bukan seluruh riwayat akun Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAllTickets}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Muat Ulang Tiket
          </button>
        </div>

        {/* Quick Booking Code Import */}
        <div className="mt-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <form
            onSubmit={handleImportBooking}
            className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Impor Tiket dengan Kode Booking
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Punya kode booking dari transaksi sebelumnya? Masukkan di sini untuk mengambil seluruh e-ticket dari server.
              </p>
            </div>

            <div className="flex w-full max-w-md flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={bookingCodeInput}
                  onChange={(e) => setBookingCodeInput(e.target.value)}
                  placeholder="TKTW-YYYYMMDD-XXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 font-mono text-xs uppercase text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="shrink-0 rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4] disabled:opacity-60"
              >
                {lookupLoading ? "Memuat..." : "Tampilkan Tiket"}
              </button>
            </div>
          </form>

          {lookupError && (
            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400">
              {lookupError}
            </p>
          )}
        </div>

        {loadError && <p role="alert" className="mt-4 rounded-xl border border-red-200 p-4 text-sm text-red-700 dark:text-red-300">{loadError}</p>}
        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: `Semua Tiket (${tickets.length})` },
            {
              id: "valid",
              label: `Valid (${tickets.filter((t) => t.status === "valid").length})`,
            },
            {
              id: "used",
              label: `Sudah Check-In (${tickets.filter((t) => t.status === "used").length})`,
            },
            {
              id: "cancelled",
              label: `Dibatalkan (${
                tickets.filter((t) => t.status === "cancelled").length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                statusFilter === tab.id
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
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 animate-pulse rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && filteredTickets.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.ticket_code}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              >
                {/* QR Code Area */}
                <div className="relative flex flex-col items-center justify-center bg-slate-900 p-6 dark:bg-slate-800">
                  <span className="mb-2.5 rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[10px] font-medium text-white backdrop-blur">
                    Booking: {ticket.booking_code}
                  </span>
                  <div className="rounded-xl bg-white p-4 shadow-xs">
                    <QrCode className="h-24 w-24 text-slate-900" />
                  </div>
                </div>

                {/* Ticket Info */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {ticket.event_name}
                      </h3>
                      <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {ticket.artist_name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        statusStyles[ticket.status] || statusStyles.used
                      }`}
                    >
                      {statusLabels[ticket.status] || ticket.status}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>
                        {ticket.event_date
                          ? new Date(ticket.event_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Jadwal Festival"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{ticket.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Ticket className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-medium">{ticket.ticket_type_name}</span>
                    </div>
                  </div>

                  <div className="mb-4 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Kode Tiket Unik
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {ticket.ticket_code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    disabled={ticket.booking_status !== "paid" || ticket.status !== "valid"}
                    className="mt-auto w-full rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-3.5 py-2 text-xs font-medium text-white shadow-xs transition"
                  >
                    Tampilkan QR &amp; Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !loadError && filteredTickets.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Ticket className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Belum Ada E-Ticket
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              E-Ticket otomatis diterbitkan saat Anda melakukan checkout event. Masukkan kode booking di atas atau pesan tiket event sekarang.
            </p>
            <Link
              href="/user/event"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
            >
              Cari Event Sekarang
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* QR Code Detail Modal */}
        {!loading && selectedTicket && selectedTicket.booking_status === "paid" && selectedTicket.status === "valid" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            onClick={() => setSelectedTicket(null)}
          >
            <div
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-slate-900 px-5 py-3.5 text-white dark:bg-slate-800">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    TicketWave Official Pass
                  </p>
                  <h3 className="text-sm font-semibold">{selectedTicket.ticket_code}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                <div className="mx-auto flex w-fit flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <TicketQr value={selectedTicket.qr_token || selectedTicket.ticket_code} />
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                    <span className="text-slate-500">Event</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedTicket.event_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                    <span className="text-slate-500">Kategori Tiket</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedTicket.ticket_type_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                    <span className="text-slate-500">Pemegang / Pembeli</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedTicket.buyer_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                    <span className="text-slate-500">Status Tiket</span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                      {selectedTicket.status === "valid" ? (
                        <CheckCircle2 size={13} className="text-slate-700 dark:text-slate-300" />
                      ) : (
                        <Clock size={13} className="text-slate-500 dark:text-slate-400" />
                      )}
                      {statusLabels[selectedTicket.status] || selectedTicket.status}
                    </span>
                  </div>
                  {selectedTicket.checked_in_at && (
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                      <span className="text-slate-500">Waktu Check-In</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(selectedTicket.checked_in_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  <Link
                    href={`/user/pesanan/${selectedTicket.booking_code}`}
                    className="flex-1 rounded-xl border border-slate-200/80 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    Lihat Pesanan
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 rounded-xl bg-[#0080f2] py-2 text-xs font-medium text-white hover:bg-[#0070d4] transition-colors shadow-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
