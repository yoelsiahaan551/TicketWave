"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Music2, MapPin, CalendarDays } from "lucide-react";
import api from "@/app/lib/api";

const FALLBACK_ARTIST_IMAGE =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80";

export default function FavoriteArtist() {
  const [lineupItems, setLineupItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistLineups = async () => {
      setLoading(true);
      try {
        const response = await api.get("/public/events", {
          page: 1,
          per_page: 8,
        });
        const events = response.data?.items || [];
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
        setLineupItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistLineups();
  }, []);

  return (
    <section className="bg-slate-50 py-20 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
              <Music2 size={17} />
              Featured Lineup &amp; Performers
            </div>

            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
              Penampil &amp; Lineup Event Aktif
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-slate-500 dark:text-slate-400">
              Artis dan penampil utama dari event yang sedang membuka penjualan tiket di TicketWave.
            </p>
          </div>

          <Link
            href="/user/event"
            className="flex w-fit items-center gap-2 font-bold text-[#0080f2] transition hover:text-[#0080f2] dark:text-[#0080f2]"
          >
            Lihat Katalog Lengkap
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : lineupItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Music2 size={28} className="mx-auto text-[#0080f2] dark:text-[#0080f2]" />
            <p className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Belum ada lineup artis dari event yang aktif
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Lineup otomatis ditampilkan saat ada event berstatus <code className="font-semibold">on_sale</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {lineupItems.map((item) => (
              <Link
                key={item.id}
                href={`/user/event/${item.id}`}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.artistName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow backdrop-blur">
                    {item.eventType}
                  </span>

                  <div className="absolute bottom-0 left-0 w-full p-5">
                    <p className="text-lg font-black text-white transition group-hover:text-white/90">
                      {item.artistName}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-200">
                      {item.eventName}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-[#0080f2]" />
                        {item.city}
                      </span>
                      {item.eventDate && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} className="text-[#0080f2]" />
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
