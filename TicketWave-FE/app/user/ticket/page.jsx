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
import {
  fetchAllSavedBookings,
  saveBookingEntry,
} from "@/app/lib/bookingStorage";

const statusStyles = {
  valid:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  used: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

const statusLabels = {
  valid: "Valid / Aktif",
  used: "Sudah Check-In",
  cancelled: "Dibatalkan",
};

export default function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [bookingCodeInput, setBookingCodeInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  const loadAllTickets = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const bookings = await fetchAllSavedBookings(api);
      const aggregated = [];

      bookings.forEach(({ booking, event, ticket_type, tickets: tList }) => {
        (tList || []).forEach((t) => {
          aggregated.push({
            ...t,
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
    } catch {
      setTickets([]);
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
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
              E-Ticket &amp; QR Pass
            </span>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
              Tiket Saya
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Daftar e-ticket resmi dari seluruh pesanan Anda beserta kode QR unik (<code className="font-mono">qr_token</code>) untuk check-in di lokasi event.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAllTickets}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Muat Ulang Tiket
          </button>
        </div>

        {/* Quick Booking Code Import */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form
            onSubmit={handleImportBooking}
            className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
          >
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Impor Tiket dengan Kode Booking
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Punya kode booking dari transaksi sebelumnya? Masukkan di sini untuk mengambil seluruh e-ticket dari server.
              </p>
            </div>

            <div className="flex w-full max-w-md items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={bookingCodeInput}
                  onChange={(e) => setBookingCodeInput(e.target.value)}
                  placeholder="TKTW-YYYYMMDD-XXXXXX"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 font-mono text-sm uppercase text-slate-900 outline-none transition focus:border-[#0080f2] focus:bg-white focus:ring-2 focus:ring-[#0080f2]/25 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="shrink-0 rounded-xl bg-[#0080f2] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#0070d4] disabled:opacity-60"
              >
                {lookupLoading ? "Memuat..." : "Tampilkan Tiket"}
              </button>
            </div>
          </form>

          {lookupError && (
            <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">
              {lookupError}
            </p>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
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
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-[#0080f2] text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && filteredTickets.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.ticket_code}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                {/* QR Code Area */}
                <div className="relative flex flex-col items-center justify-center bg-[#0080f2] p-7">
                  <span className="mb-3 rounded-full bg-white/20 px-3 py-1 font-mono text-[11px] font-bold text-white backdrop-blur">
                    Booking: {ticket.booking_code}
                  </span>
                  <div className="rounded-2xl bg-white p-5 shadow-md">
                    <QrCode className="h-28 w-28 text-slate-900" />
                  </div>
                </div>

                {/* Ticket Info */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="line-clamp-1 text-lg font-black text-slate-900 dark:text-white">
                        {ticket.event_name}
                      </h3>
                      <p className="line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {ticket.artist_name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[ticket.status] || statusStyles.used
                      }`}
                    >
                      {statusLabels[ticket.status] || ticket.status}
                    </span>
                  </div>

                  <div className="mb-5 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="h-4 w-4 shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
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
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                      <MapPin className="h-4 w-4 shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
                      <span className="line-clamp-1">{ticket.venue}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <Ticket className="h-4 w-4 shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
                      <span className="font-bold">{ticket.ticket_type_name}</span>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/70">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Kode Tiket Unik
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-black text-slate-900 dark:text-[#0080f2]">
                      {ticket.ticket_code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="mt-auto w-full rounded-2xl bg-[#0080f2] px-4 py-3 text-sm font-bold text-white shadow transition hover:scale-[1.01]"
                  >
                    Tampilkan QR &amp; Detail Tiket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTickets.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Ticket className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
              Belum Ada E-Ticket
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              E-Ticket otomatis diterbitkan saat Anda melakukan checkout event. Masukkan kode booking di atas atau pesan tiket event sekarang.
            </p>
            <Link
              href="/user/event"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105"
            >
              Cari Event Sekarang
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* QR Code Detail Modal */}
        {selectedTicket && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedTicket(null)}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-[#0080f2] px-6 py-4 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/90">
                    TicketWave Official Pass
                  </p>
                  <h3 className="text-lg font-black">{selectedTicket.ticket_code}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl bg-white/15 p-2 text-white hover:bg-white/25"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <div className="mx-auto flex w-fit flex-col items-center rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
                  <QrCode className="h-40 w-40 text-slate-900 dark:text-white" />
                  <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    QR Token: {selectedTicket.qr_token}
                  </p>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-slate-500">Event</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedTicket.event_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-slate-500">Kategori Tiket</span>
                    <span className="font-bold text-[#0080f2] dark:text-[#0080f2]">
                      {selectedTicket.ticket_type_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-slate-500">Pemegang / Pembeli</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedTicket.buyer_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-slate-500">Status Tiket</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                      {selectedTicket.status === "valid" ? (
                        <CheckCircle2 size={15} className="text-emerald-500" />
                      ) : (
                        <Clock size={15} className="text-amber-500" />
                      )}
                      {statusLabels[selectedTicket.status] || selectedTicket.status}
                    </span>
                  </div>
                  {selectedTicket.checked_in_at && (
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <span className="text-slate-500">Waktu Check-In</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(selectedTicket.checked_in_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/user/pesanan/${selectedTicket.booking_code}`}
                    className="flex-1 rounded-xl border border-slate-300 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Lihat Pesanan
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 rounded-xl bg-[#0080f2] py-3 text-sm font-bold text-white"
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
