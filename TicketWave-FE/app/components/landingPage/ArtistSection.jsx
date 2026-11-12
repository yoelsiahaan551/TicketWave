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
  const { events, loading, error } = useLandingEvents();
  const artists = buildArtists(events);

  return (
    <section className="py-28 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <p className="uppercase tracking-[6px] text-cyan-600 font-bold">
            Top Artists
          </p>

          <h2 className="text-4xl md:text-5xl font-black mt-3">
            Featured Artists
          </h2>

          <p className="text-slate-500 mt-5 max-w-2xl mx-auto">
            Artis yang sedang tampil di event TicketWave yang dibuka penjualannya.
          </p>

        </div>

        {loading && (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="rounded-[35px] h-[500px] bg-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-[30px] border border-red-200 p-8 text-center">
            <AlertTriangle className="mx-auto text-red-500" size={32} />
            <p className="mt-3 font-semibold text-slate-900">Daftar artis gagal dimuat</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && artists.length === 0 && (
          <div className="mx-auto max-w-xl rounded-[30px] border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Belum ada artis dari event yang sedang dijual.
          </div>
        )}

        {!loading && !error && artists.length > 0 && (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

            {artists.map((artist) => (

              <div
                key={artist.name}
                className="group relative rounded-[35px] overflow-hidden shadow-xl h-[500px]"
              >

                <img
                  src={posterOf(artist.events[0])}
                  alt={artist.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute top-6 left-6">

                  <span className="bg-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    TOP ARTIST
                  </span>

                </div>

                <div className="absolute bottom-0 p-7 text-white w-full">

                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-5">

                    <Music2 />

                  </div>

                  <h3 className="text-3xl font-black line-clamp-2">
                    {artist.name}
                  </h3>

                  <p className="text-gray-300 mt-2">
                    {Array.from(artist.types).join(" • ")}
                    {artist.cities.size > 0 ? ` • ${Array.from(artist.cities).join(", ")}` : ""}
                  </p>

                  <p className="text-cyan-300 mt-2">
                    {artist.events.length} Upcoming Event{artist.events.length > 1 ? "s" : ""}
                  </p>

                  <Link
                    href={
                      artist.events.length === 1
                        ? `/user/event/${artist.events[0].id}`
                        : `/user/event?search=${encodeURIComponent(artist.name)}`
                    }
                    className="mt-6 inline-flex items-center gap-2 bg-white text-black rounded-full px-5 py-3 font-semibold group-hover:bg-cyan-500 group-hover:text-white transition"
                  >
                    View Events
                    <ArrowRight size={18} />
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
