"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  ArrowLeft,
  Minus,
  Plus,
  Ticket,
  AlertTriangle,
  Music2,
  Tag,
  Info,
} from "lucide-react";
import api from "@/app/lib/api";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [agency, setAgency] = useState(null);
  const [lineup, setLineup] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Backend CheckoutSchema only supports 1 ticket_type_id and max 10 quantity per transaction
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    api
      .get(`/public/events/${id}`)
      .then((response) => {
        if (ignore) return;
        if (response.data) {
          setEvent(response.data.event);
          setAgency(response.data.agency || null);
          setLineup(response.data.lineup || []);
          const types = response.data.ticket_types || [];
          setTicketTypes(types);
          const firstAvailable = types.find(
            (t) => (t.stock_available ?? t.remaining ?? t.quota - t.sold_count) > 0
          );
          if (firstAvailable) {
            setSelectedTicketId(firstAvailable.id);
            setQuantity(1);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        if (!ignore) {
          setErrorMsg(error.message || "Gagal memuat detail event.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  // Tombol "Beli Tiket" di Landing Page mengarah ke #pilih-tiket.
  // Section tiket baru dirender setelah data dimuat, jadi scroll dilakukan manual.
  useEffect(() => {
    if (loading || errorMsg) return;
    if (typeof window === "undefined" || window.location.hash !== "#pilih-tiket") return;
    const t = setTimeout(() => {
      document.getElementById("pilih-tiket")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(t);
  }, [loading, errorMsg]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "TBA";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) {
      return event?.event_type === "festival"
        ? `Festival ${event?.days_count || 1} Hari`
        : "TBA";
    }
    try {
      const date = new Date(dateStr);
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      return date.toLocaleDateString("id-ID", options);
    } catch {
      return dateStr;
    }
  };

  const getEffectivePrice = (t) => {
    if (typeof t.final_price === "number" && !Number.isNaN(t.final_price)) {
      return t.final_price;
    }
    if (
      t.final_price &&
      typeof t.final_price === "object" &&
      t.final_price.final_price !== undefined
    ) {
      return Number(t.final_price.final_price);
    }
    if (t.active_phase && t.active_phase.discount_percent !== undefined) {
      const base = Number(t.base_price || 0);
      const disc = Number(t.active_phase.discount_percent || 0);
      return Math.round(base * (1 - disc / 100));
    }
    return Number(t.base_price || 0);
  };

  const available = (t) =>
    t.stock_available ?? t.remaining ?? Math.max(0, (t.quota || 0) - (t.sold_count || 0));

  const handleSelectTicket = (ticket) => {
    const avail = available(ticket);
    if (avail <= 0) return;
    if (selectedTicketId === ticket.id) return;
    setSelectedTicketId(ticket.id);
    setQuantity(1);
  };

  const handleQuantityChange = (ticket, delta) => {
    const avail = available(ticket);
    const maxAllowed = Math.min(avail, 10);
    if (selectedTicketId !== ticket.id) {
      if (delta > 0 && maxAllowed > 0) {
        setSelectedTicketId(ticket.id);
        setQuantity(1);
      }
      return;
    }
    const next = Math.min(Math.max(quantity + delta, 0), maxAllowed);
    setQuantity(next);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <AlertTriangle size={24} />
          </div>
          <h1 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            Event tidak ditemukan atau tidak sedang dijual
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {errorMsg || "Hanya event dengan status on_sale yang dapat diakses secara publik."}
          </p>
          <Link
            href="/user/event"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Event
          </Link>
        </div>
      </div>
    );
  }

  const selectedTicket = ticketTypes.find((t) => t.id === selectedTicketId);
  const effectiveUnitPrice = selectedTicket ? getEffectivePrice(selectedTicket) : 0;
  const total = selectedTicket && quantity > 0 ? effectiveUnitPrice * quantity : 0;

  const lanjutCheckout = () => {
    if (!selectedTicket || quantity <= 0) return;

    sessionStorage.setItem(
      "ticketwave_checkout",
      JSON.stringify({
        eventId: event.id,
        eventNama: event.name,
        eventTanggal: event.event_date,
        eventWaktu: event.event_time
          ? `${event.event_time.slice(0, 5)} WIB`
          : event.event_type === "festival"
          ? `Festival ${event.days_count || 1} Hari`
          : "TBA",
        lokasi: event.city,
        venue: event.venue,
        gambar: event.poster_url || event.banner_url || FALLBACK_BANNER,
        items: [
          {
            ticket_type_id: selectedTicket.id,
            nama: selectedTicket.name,
            harga: effectiveUnitPrice,
            base_price: Number(selectedTicket.base_price || 0),
            active_phase: selectedTicket.active_phase || null,
            jumlah: quantity,
          },
        ],
      })
    );
    router.push("/user/checkout");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Kembali */}
      <Link
        href="/user/event"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={17} />
        Kembali ke Daftar Event
      </Link>

      {/* Banner */}
      <div className="relative mt-4 h-64 overflow-hidden rounded-2xl md:h-80">
        <img
          src={event.banner_url || event.poster_url || FALLBACK_BANNER}
          alt={event.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-900 shadow-xs">
              {event.event_type === "festival"
                ? `Festival (${event.days_count || 1} Hari)`
                : "Single Event"}
            </span>
            {event.artist_name && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <Music2 size={13} />
                {event.artist_name}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-4xl">
            {event.name}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Info Event */}
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <CalendarDays size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Tanggal Pelaksanaan
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDate(event.event_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Clock size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Waktu / Durasi
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {event.event_time
                    ? `${event.event_time.slice(0, 5)} WIB`
                    : event.event_type === "festival"
                    ? `${event.days_count || 1} Hari Festival`
                    : "TBA"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <MapPin size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Venue Lokasi
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {event.venue}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Building2 size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Kota &amp; Penyelenggara
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {event.city}
                  {agency?.name ? ` • ${agency.name}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Tentang Event
            </h2>
            <p className="mt-2 text-xs sm:text-sm whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
              {event.description || "Deskripsi lengkap event belum ditambahkan oleh penyelenggara."}
            </p>
          </div>

          {/* Lineup Festival (jika ada) */}
          {lineup && lineup.length > 0 && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <Music2 size={18} className="text-slate-400" />
                Lineup Festival
              </h2>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {lineup.map((item) => (
                  <div
                    key={item.id || `${item.day_number}-${item.artist_name}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <span className="text-xs font-medium text-slate-900 dark:text-white">
                      {item.artist_name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Hari ke-{item.day_number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informasi Penyelenggara (Agency) */}
          {agency && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Penyelenggara Resmi (Agency)
              </h3>
              <div className="mt-3 flex items-center gap-3">
                {agency.logo_url ? (
                  <img
                    src={agency.logo_url}
                    alt={agency.name}
                    className="h-11 w-11 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-slate-700">
                    {agency.name?.charAt(0) || "A"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {agency.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PIC: {agency.pic_name} {agency.email ? `• ${agency.email}` : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pilih Tiket */}
        <div
          id="pilih-tiket"
          className="h-fit scroll-mt-28 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-28"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <Ticket size={18} className="text-slate-400" />
              Pilih Kategori Tiket
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Maks. 10 tiket
            </span>
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Info size={13} className="shrink-0 text-slate-400" />
            Pilih 1 kategori tiket untuk setiap transaksi checkout.
          </p>

          <div className="mt-4 space-y-3">
            {ticketTypes.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kategori tiket belum tersedia untuk event ini.
              </p>
            ) : (
              ticketTypes.map((t) => {
                const avail = available(t);
                const habis = avail <= 0;
                const isSelected = selectedTicketId === t.id && quantity > 0;
                const effectivePrice = getEffectivePrice(t);
                const basePrice = Number(t.base_price || 0);
                const hasDiscount =
                  t.active_phase && Number(t.active_phase.discount_percent) > 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => !habis && handleSelectTicket(t)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      habis
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-800/40"
                        : isSelected
                        ? "border-[#0080f2] bg-blue-50/50 ring-1 ring-[#0080f2] dark:border-[#0080f2] dark:bg-blue-950/40 dark:ring-[#0080f2]"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {t.name}
                          </p>
                          {t.active_phase && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[11px] font-medium uppercase text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                              <Tag size={10} />
                              {t.active_phase.phase_name?.replace("_", " ")}{" "}
                              {hasDiscount
                                ? `(-${t.active_phase.discount_percent}%)`
                                : ""}
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {t.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        {hasDiscount && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatPrice(basePrice)}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[#0080f2]">
                          {formatPrice(effectivePrice)}
                        </p>
                      </div>
                    </div>

                    <div
                      className="mt-3 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p
                        className={`text-xs font-medium ${
                          habis
                            ? "text-slate-400 dark:text-slate-500"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {habis ? "Kuota habis" : `Tersedia ${avail} tiket`}
                      </p>

                      {!habis && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(t, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold text-slate-900 dark:text-white">
                            {selectedTicketId === t.id ? quantity : 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(t, 1)}
                            disabled={
                              selectedTicketId === t.id &&
                              quantity >= Math.min(avail, 10)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0080f2] text-white transition hover:bg-[#0070d4] disabled:opacity-40"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ringkasan */}
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estimasi Total
              </span>
              <span className="text-base font-bold text-[#0080f2]">
                {formatPrice(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={lanjutCheckout}
              disabled={!selectedTicket || quantity <= 0}
              className="mt-4 w-full rounded-xl bg-[#0080f2] hover:bg-[#0070d4] py-3 text-xs sm:text-sm font-medium text-white shadow-xs transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedTicket && quantity > 0
                ? `Lanjut ke Checkout (${quantity} × ${selectedTicket.name})`
                : "Pilih Tiket Terlebih Dahulu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
