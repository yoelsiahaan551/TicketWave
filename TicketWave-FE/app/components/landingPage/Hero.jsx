"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  Ticket,
  Users,
} from "lucide-react";
import {
  useLandingEvents,
  useLandingCities,
} from "@/app/components/landingPage/useLandingEvents";
import {
  posterOf,
  handleImageError,
  formatRupiah,
  priceFromOf,
  eventTypeLabel,
  formatEventDate,
} from "@/app/components/landingPage/eventDisplay";

export default function Hero() {
  const router = useRouter();
  const { events, totalItems, loading, error } = useLandingEvents();
  const { cities } = useLandingCities();

  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [dateFrom, setDateFrom] = useState("");

  const highlight = events[0] || null;
  const highlightPrice = priceFromOf(highlight);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (city) params.set("city", city);
    if (dateFrom) params.set("date_from", dateFrom);
    const qs = params.toString();
    router.push(qs ? `/user/event?${qs}` : "/user/event");
  };

  return (
    <section className="relative overflow-hidden pt-28 min-h-screen">

      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070"
        alt="Concert"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/30" />

      {/* Glow */}
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-700/20 blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>

            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-cyan-300 backdrop-blur-xl shadow-lg">

              <Ticket size={18} />

              <span className="font-medium">
                Trusted by 150K+ Ticket Buyers
              </span>

            </div>

            <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white">

              Discover

              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Amazing Events
              </span>

            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
              Book tickets for concerts, festivals, sports, comedy,
              exhibitions and unforgettable experiences across Indonesia.
            </p>

            {/* Search Box (diteruskan ke GET /api/public/events lewat /user/event) */}

            <form
              onSubmit={handleSearch}
              className="mt-12 rounded-[32px] bg-white/95 backdrop-blur-xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
            >

              <div className="grid gap-4 lg:grid-cols-4">

                <div className="flex items-center gap-3 rounded-2xl border p-4">

                  <Search className="shrink-0 text-cyan-500" />

                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search Event"
                    aria-label="Cari event atau artis"
                    className="w-full min-w-0 bg-transparent outline-none"
                  />

                </div>

                <div className="flex items-center gap-3 rounded-2xl border p-4">

                  <MapPin className="shrink-0 text-cyan-500" />

                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label="Pilih kota"
                    className="w-full min-w-0 bg-transparent outline-none text-slate-700"
                  >
                    <option value="">All Locations</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="flex items-center gap-3 rounded-2xl border p-4">

                  <Calendar className="shrink-0 text-cyan-500" />

                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Tanggal mulai"
                    className="w-full min-w-0 bg-transparent outline-none"
                  />

                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Search
                </button>

              </div>

            </form>

            {/* Stats (Events & Kota dari backend) */}

            <div className="mt-14 flex flex-wrap gap-12">

              <div>

                <h2 className="text-4xl font-bold text-white">
                  {loading ? "…" : error ? "–" : totalItems}
                </h2>

                <p className="mt-2 text-slate-400">
                  Events On Sale
                </p>

              </div>

              <div>

                <h2 className="text-4xl font-bold text-white">
                  {loading ? "…" : cities.length}
                </h2>

                <p className="mt-2 text-slate-400">
                  Cities
                </p>

              </div>

              <div>

                <h2 className="text-4xl font-bold text-white">
                  4.9★
                </h2>

                <p className="mt-2 text-slate-400">
                  Rating
                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative hidden lg:flex justify-center">

            {/* Floating Left */}

            <div className="absolute left-0 top-10 z-10 rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-2xl backdrop-blur-xl">

              <Users className="mb-3 text-cyan-500" />

              <h2 className="text-3xl font-bold">
                150K+
              </h2>

              <p className="text-slate-500">
                Happy Users
              </p>

            </div>

            {/* Main Card — event on sale terdekat dari backend */}

            <div className="w-[430px] overflow-hidden rounded-[40px] bg-white shadow-[0_35px_80px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2">

              {loading ? (
                <div className="animate-pulse">
                  <div className="h-72 w-full bg-slate-200" />
                  <div className="p-8 space-y-4">
                    <div className="h-7 w-28 rounded-full bg-slate-200" />
                    <div className="h-8 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                    <div className="h-16 w-full rounded-2xl bg-slate-200" />
                  </div>
                </div>
              ) : highlight ? (
                <>
                  <img
                    src={posterOf(highlight)}
                    alt={highlight.name}
                    onError={handleImageError}
                    className="h-72 w-full object-cover"
                  />

                  <div className="p-8">

                    <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
                      {eventTypeLabel(highlight)} • {formatEventDate(highlight)}
                    </span>

                    <h2 className="mt-5 text-3xl font-bold line-clamp-2">
                      {highlight.name}
                    </h2>

                    <p className="mt-2 text-slate-500 line-clamp-1">
                      {[highlight.venue, highlight.city].filter(Boolean).join(", ")}
                    </p>

                    <div className="mt-8 flex items-center justify-between">

                      <div>

                        <p className="text-slate-400">
                          Starting From
                        </p>

                        <h2 className="text-3xl font-bold text-blue-600">
                          {highlightPrice !== null ? formatRupiah(highlightPrice) : "Lihat detail"}
                        </h2>

                      </div>

                      <Link
                        href={`/user/event/${highlight.id}`}
                        aria-label={`Lihat detail ${highlight.name}`}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition hover:scale-110"
                      >

                        <ArrowRight />

                      </Link>

                    </div>

                  </div>
                </>
              ) : (
                <div className="p-10 text-center">
                  <Ticket className="mx-auto text-cyan-500" size={40} />
                  <h2 className="mt-5 text-2xl font-bold">
                    {error ? "Server event tidak tersedia" : "Belum ada event on sale"}
                  </h2>
                  <p className="mt-2 text-slate-500">
                    {error || "Event akan tampil di sini setelah penjualan dibuka."}
                  </p>
                </div>
              )}

            </div>

            {/* Floating Right */}

            <div className="absolute right-0 bottom-10 rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-2xl backdrop-blur-xl">

              <h2 className="text-3xl font-bold">
                24/7
              </h2>

              <p className="text-slate-500">
                Customer Support
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
