"use client";

import Link from "next/link";
import { Music2, ArrowRight, AlertTriangle } from "lucide-react";
import { useLandingEvents } from "@/app/components/landingPage/useLandingEvents";
import { posterOf, handleImageError } from "@/app/components/landingPage/eventDisplay";

/** Kelompokkan event on_sale berdasarkan artist_name dari backend. */
function buildArtists(events) {
  const map = new Map();
  events.forEach((event) => {
    const name = (event.artist_name || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { name, events: [], cities: new Set(), types: new Set() });
    }
    const entry = map.get(key);
    entry.events.push(event);
    if (event.city) entry.cities.add(event.city);
    entry.types.add(event.event_type === "festival" ? "Festival" : "Konser");
  });
  return Array.from(map.values()).slice(0, 4);
}

export default function ArtistSection() {
  const { events, loading, error, retry } = useLandingEvents();
  const artists = buildArtists(events);

  return (
    <section className="py-28 bg-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Artists On Sale
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Featured Artists
          </h2>

          <p className="text-slate-500 mt-2 text-sm max-w-2xl mx-auto">
            Artis yang sedang tampil di event TicketWave yang dibuka penjualannya.
          </p>

        </div>

        {loading && (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl h-[420px] bg-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-xl border border-slate-200 p-8 text-center shadow-xs">
            <AlertTriangle className="mx-auto text-slate-400" size={32} />
            <p className="mt-3 font-semibold text-slate-900">Daftar artis gagal dimuat</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button type="button" onClick={retry} className="mt-3 underline">Coba Lagi</button>
          </div>
        )}

        {!loading && !error && artists.length === 0 && (
          <div className="mx-auto max-w-xl rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Belum ada artis dari event yang sedang dijual.
          </div>
        )}

        {!loading && !error && artists.length > 0 && (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

            {artists.map((artist) => (

              <div
                key={artist.name}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200/80 h-[420px] transition duration-300"
              >

                <img
                  src={posterOf(artist.events[0])}
                  alt={artist.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-4 left-4">

                  <span className="bg-white/95 text-slate-900 px-3 py-1 rounded-full text-xs font-medium shadow-xs backdrop-blur-xs">
                    ON SALE
                  </span>

                </div>

                <div className="absolute bottom-0 p-5 text-white w-full">

                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3">

                    <Music2 size={18} />

                  </div>

                  <h3 className="text-xl font-bold line-clamp-2">
                    {artist.name}
                  </h3>

                  <p className="text-slate-300 text-xs mt-1">
                    {Array.from(artist.types).join(" • ")}
                    {artist.cities.size > 0 ? ` • ${Array.from(artist.cities).join(", ")}` : ""}
                  </p>

                  <p className="text-slate-300 text-xs mt-1">
                    {artist.events.length} event dalam pilihan ini
                  </p>

                  <Link
                    href={
                      artist.events.length === 1
                        ? `/user/event/${artist.events[0].id}`
                        : `/user/event?search=${encodeURIComponent(artist.name)}`
                    }
                    className="mt-4 inline-flex items-center gap-1.5 bg-white text-slate-900 rounded-xl px-4 py-2 text-xs font-medium hover:bg-slate-900 hover:text-white transition shadow-xs"
                  >
                    View Events
                    <ArrowRight size={14} />
                  </Link>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </section>
  );
}
