"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Ticket, AlertTriangle, RefreshCw, CalendarX, Info, X, Clock, Flame } from "lucide-react";
import api from "@/app/lib/api";
import { useLandingCities } from "@/app/components/landingPage/useLandingEvents";
import {
  posterOf,
  handleImageError,
  formatRupiah,
  priceFromOf,
  formatEventDate,
  formatEventTime,
  isPurchasable,
  isEventPast,
  eventTypeLabel,
} from "@/app/components/landingPage/eventDisplay";

export default function TrendingEvents() {
  const { cities } = useLandingCities();
  const [city, setCity] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [bookingNotice, setBookingNotice] = useState(false);
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const handleUnavailableBooking = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookingNotice(true);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setBookingNotice(false);
    }, 4500);
  };

  useEffect(() => {
    let ignore = false;
    api
      .get("/public/events", { per_page: 6, city })
      .then((response) => {
        if (ignore) return;
        setEvents(response?.data?.items || []);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        setEvents([]);
        setError(err?.message || "Tidak dapat terhubung ke server TicketWave.");
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [city, reloadKey]);

  const selectCity = (value) => {
    if (value === city) return;
    setLoading(true);
    setCity(value);
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <section id="events" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
              Trending
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-slate-900">
              Popular Events
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Event yang sedang dijual di TicketWave — langsung dari sistem kami.
            </p>
          </div>

          <Link
            href={city ? `/user/event?city=${encodeURIComponent(city)}` : "/user/event"}
            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* City filter (GET /api/public/events/cities) */}
        {cities.length > 0 && (
          <div className="mb-8 flex gap-2.5 overflow-x-auto pb-2">
            {["", ...cities].map((c) => (
              <button
                key={c || "all"}
                type="button"
                onClick={() => selectCity(c)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition ${
                  city === c
                    ? "bg-[#0080f2] text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {c ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} />
                    {c}
                  </span>
                ) : (
                  "Semua Kota"
                )}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[0, 1, 2].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse">
                <div className="h-60 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                  <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                  <div className="h-9 w-full rounded-xl bg-slate-200 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <AlertTriangle className="mx-auto text-slate-400" size={32} />
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Gagal memuat event</h3>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-xs transition"
            >
              <RefreshCw size={14} />
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <CalendarX className="mx-auto text-slate-400" size={32} />
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Belum ada event yang dijual</h3>
            <p className="mt-1 text-sm text-slate-500">
              {city
                ? `Belum ada event on sale di ${city}. Coba pilih kota lain.`
                : "Event baru akan tampil di sini segera setelah penjualan dibuka."}
            </p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const price = priceFromOf(event);
              const purchasable = isPurchasable(event);
              const past = isEventPast(event);
              const time = formatEventTime(event);
              return (
                <div
                  key={event.id}
                  className="group flex flex-col bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <Link href={`/user/event/${event.id}`} className="relative block overflow-hidden">
                    <img
                      src={posterOf(event)}
                      alt={event.name}
                      onError={handleImageError}
                      className="h-60 w-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-xs rounded-full px-3 py-1 font-medium shadow-xs flex items-center gap-1.5 text-xs text-slate-800">
                      {past ? (
                        <>
                          <Clock size={13} className="text-slate-500" />
                          <span>Sudah Berakhir</span>
                        </>
                      ) : (
                        <>
                          <Flame size={13} className="text-[#0080f2]" />
                          <span>Trending</span>
                        </>
                      )}
                    </div>

                    <div className="absolute bottom-3.5 right-3.5 bg-slate-900/80 backdrop-blur-xs text-white rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-medium">
                      <Ticket size={13} className="text-slate-400" />
                      {eventTypeLabel(event)}
                    </div>
                  </Link>

                  <div className="p-5 flex flex-1 flex-col">
                    <Link href={`/user/event/${event.id}`}>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 hover:text-[#0080f2] transition line-clamp-2">
                        {event.name}
                      </h3>
                    </Link>
                    {event.artist_name && (
                      <p className="mt-1 text-xs text-slate-500">{event.artist_name}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                      <MapPin size={15} className="shrink-0 text-slate-400" />
                      <span className="line-clamp-1">
                        {[event.venue, event.city].filter(Boolean).join(", ") || "Lokasi menyusul"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                      <Calendar size={15} className="shrink-0 text-slate-400" />
                      {formatEventDate(event)}
                      {time ? ` • ${time}` : ""}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400">Mulai dari</p>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0080f2]">
                        {price !== null ? formatRupiah(price) : "Lihat di detail"}
                      </h2>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <Link
                        href={`/user/event/${event.id}`}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-center text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        Lihat Detail
                      </Link>
                      {purchasable ? (
                        <button
                          type="button"
                          onClick={handleUnavailableBooking}
                          className="cursor-pointer rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-3 py-2 text-center text-xs sm:text-sm font-medium text-white shadow-xs transition"
                        >
                          Beli Tiket
                        </button>
                      ) : (
                        <span className="cursor-not-allowed rounded-xl bg-slate-100 px-3 py-2 text-center text-xs sm:text-sm font-medium text-slate-400">
                          Tidak Tersedia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/user/event"
          className="md:hidden mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {bookingNotice && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-medium text-white shadow-2xl"
        >
          <Info size={18} className="shrink-0 text-slate-400" />
          <span>Fitur pemesanan tiket belum tersedia saat ini.</span>
          <button
            type="button"
            onClick={() => setBookingNotice(false)}
            aria-label="Tutup notifikasi"
            className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
