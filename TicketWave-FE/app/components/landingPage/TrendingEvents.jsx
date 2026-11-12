"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Ticket, AlertTriangle, RefreshCw, CalendarX, Info, X } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-cyan-600 font-semibold uppercase tracking-widest">
              Trending
            </p>
            <h2 className="text-4xl md:text-5xl font-black mt-2 text-slate-900">
              Popular Events
            </h2>
            <p className="text-slate-500 mt-4">
              Event yang sedang dijual di TicketWave — langsung dari sistem kami.
            </p>
          </div>

          <Link
            href={city ? `/user/event?city=${encodeURIComponent(city)}` : "/user/event"}
            className="hidden md:flex items-center gap-2 rounded-full border px-6 py-3 hover:bg-slate-900 hover:text-white transition"
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* City filter (GET /api/public/events/cities) */}
        {cities.length > 0 && (
          <div className="mb-10 flex gap-3 overflow-x-auto pb-2">
            {["", ...cities].map((c) => (
              <button
                key={c || "all"}
                type="button"
                onClick={() => selectCity(c)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  city === c
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-600"
                }`}
              >
                {c ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} />
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true">
            {[0, 1, 2].map((n) => (
              <div key={n} className="bg-white rounded-[30px] overflow-hidden shadow-md animate-pulse">
                <div className="h-72 bg-slate-200" />
                <div className="p-7 space-y-4">
                  <div className="h-6 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                  <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                  <div className="h-10 w-full rounded-full bg-slate-200 mt-6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[30px] border border-red-200 bg-white p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto text-red-500" size={36} />
            <h3 className="mt-4 text-xl font-bold text-slate-900">Gagal memuat event</h3>
            <p className="mt-2 text-slate-500">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white hover:scale-105 transition"
            >
              <RefreshCw size={16} />
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <CalendarX className="mx-auto text-slate-400" size={36} />
            <h3 className="mt-4 text-xl font-bold text-slate-900">Belum ada event yang dijual</h3>
            <p className="mt-2 text-slate-500">
              {city
                ? `Belum ada event on sale di ${city}. Coba pilih kota lain.`
                : "Event baru akan tampil di sini segera setelah penjualan dibuka."}
            </p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const price = priceFromOf(event);
              const purchasable = isPurchasable(event);
              const past = isEventPast(event);
              const time = formatEventTime(event);
              return (
                <div
                  key={event.id}
                  className="group flex flex-col bg-white rounded-[30px] overflow-hidden shadow-md hover:shadow-2xl transition duration-500"
                >
                  <Link href={`/user/event/${event.id}`} className="relative block overflow-hidden">
                    <img
                      src={posterOf(event)}
                      alt={event.name}
                      onError={handleImageError}
                      className="h-72 w-full object-cover group-hover:scale-110 transition duration-700"
                    />

                    <div className="absolute top-5 left-5 bg-white rounded-full px-4 py-2 font-semibold shadow">
                      {past ? "⏳ Sudah Berakhir" : "🔥 Trending"}
                    </div>

                    <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold">
                      <Ticket size={16} className="text-cyan-300" />
                      {eventTypeLabel(event)}
                    </div>
                  </Link>

                  <div className="p-7 flex flex-1 flex-col">
                    <Link href={`/user/event/${event.id}`}>
                      <h3 className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition line-clamp-2">
                        {event.name}
                      </h3>
                    </Link>
                    {event.artist_name && (
                      <p className="mt-1 text-sm text-slate-500">{event.artist_name}</p>
                    )}

                    <div className="flex items-center gap-2 text-slate-500 mt-4">
                      <MapPin size={18} className="shrink-0" />
                      <span className="line-clamp-1">
                        {[event.venue, event.city].filter(Boolean).join(", ") || "Lokasi menyusul"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 mt-2">
                      <Calendar size={18} className="shrink-0" />
                      {formatEventDate(event)}
                      {time ? ` • ${time}` : ""}
                    </div>

                    <div className="mt-8">
                      <p className="text-slate-400 text-sm">Mulai dari</p>
                      <h2 className="text-2xl md:text-3xl font-black text-blue-600">
                        {price !== null ? formatRupiah(price) : "Lihat di detail"}
                      </h2>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Link
                        href={`/user/event/${event.id}`}
                        className="rounded-full border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 hover:bg-slate-900 hover:text-white transition"
                      >
                        Lihat Detail
                      </Link>
                      {purchasable ? (
                        <button
                          type="button"
                          onClick={handleUnavailableBooking}
                          className="cursor-pointer rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center font-semibold text-white hover:scale-105 transition"
                        >
                          Beli Tiket
                        </button>
                      ) : (
                        <span className="cursor-not-allowed rounded-full bg-slate-200 px-4 py-3 text-center font-semibold text-slate-500">
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
          className="md:hidden mt-10 flex items-center justify-center gap-2 rounded-full border px-6 py-3 hover:bg-slate-900 hover:text-white transition"
        >
          View All
          <ArrowRight size={18} />
        </Link>
      </div>

      {bookingNotice && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-amber-200 bg-slate-900 px-5 py-4 text-sm font-medium text-white shadow-2xl"
        >
          <Info size={18} className="shrink-0 text-amber-400" />
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
