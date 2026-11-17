"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Music2, MapPin, CalendarDays } from "lucide-react";
import api from "@/app/lib/api";
import { readEventList } from "@/app/components/landingPage/eventDisplay";

const FALLBACK_ARTIST_IMAGE =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80";

export default function FavoriteArtist() {
  const [lineupItems, setLineupItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchArtistLineups = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get("/public/events", {
          page: 1,
          per_page: 8,
        });
        const events = readEventList(response).items;
        if (ignore) return;
        const mapped = events.map((ev) => ({
          id: ev.id,
          artistName:
            ev.artist_name ||
            (ev.event_type === "festival"
              ? `Festival Lineup (${ev.days_count || 1} Hari)`
              : ev.name),
          eventName: ev.name,
          city: ev.city,
          eventType: ev.event_type === "festival" ? "Festival" : "Single Concert",
          image: ev.poster_url || ev.banner_url || FALLBACK_ARTIST_IMAGE,
          eventDate: ev.event_date,
        }));
        setLineupItems(mapped.slice(0, 4));
      } catch {
        if (ignore) return;
        setError(true);
        setLineupItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    const timer = setTimeout(fetchArtistLineups, 0);
    return () => { ignore = true; clearTimeout(timer); };
  }, [reloadKey]);

  return (
    <section className="bg-slate-50 py-20 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
              <Music2 size={15} />
              Featured Lineup &amp; Performers
            </div>

            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Penampil &amp; Lineup Event Aktif
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Artis dan penampil utama dari event yang sedang membuka penjualan tiket di TicketWave.
            </p>
          </div>

          <Link
            href="/user/event"
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-900 transition hover:text-[#0080f2] dark:text-slate-200 dark:hover:text-[#0080f2]"
          >
            Lihat Katalog Lengkap
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[4/5] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-slate-200 p-8 text-center">
            <p>Daftar penampil gagal dimuat.</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-3 text-[#0080f2] underline">Coba Lagi</button>
          </div>
        ) : lineupItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Music2 size={24} className="mx-auto text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              Belum ada lineup artis dari event yang aktif
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Lineup otomatis ditampilkan saat ada event berstatus <code className="font-semibold">on_sale</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {lineupItems.map((item) => (
              <Link
                key={item.id}
                href={`/user/event/${item.id}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.artistName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  <span className="absolute left-3.5 top-3.5 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-medium text-slate-900 shadow-xs backdrop-blur-xs">
                    {item.eventType}
                  </span>

                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <p className="text-base font-semibold text-white transition group-hover:text-white/90">
                      {item.artistName}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-300">
                      {item.eventName}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        {item.city}
                      </span>
                      {item.eventDate && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} className="text-slate-400" />
                          {new Date(item.eventDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
