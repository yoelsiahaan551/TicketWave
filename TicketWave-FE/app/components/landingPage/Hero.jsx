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
  Star,
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

      {/* Subtle Glow */}
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-slate-500/5 blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-slate-500/5 blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md">

              <Ticket size={15} className="text-[#0080f2]" />

              <span>
                Trusted by 150K+ Ticket Buyers
              </span>

            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">

              Discover

              <span className="block text-[#0080f2]">
                Amazing Events
              </span>

            </h1>

            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
              Book tickets for concerts, festivals, sports, comedy,
              exhibitions and unforgettable experiences across Indonesia.
            </p>

            {/* Search Box (diteruskan ke GET /api/public/events lewat /user/event) */}

            <form
              onSubmit={handleSearch}
              className="mt-8 rounded-2xl bg-white p-3 sm:p-4 shadow-xl border border-slate-100"
            >

              <div className="grid gap-3 lg:grid-cols-4">

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-400 transition">

                  <Search size={18} className="shrink-0 text-slate-400" />

                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search Event"
                    aria-label="Cari event atau artis"
                    className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />

                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-400 transition">

                  <MapPin size={18} className="shrink-0 text-slate-400" />

                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label="Pilih kota"
                    className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none"
                  >
                    <option value="">All Locations</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-400 transition">

                  <Calendar size={18} className="shrink-0 text-slate-400" />

                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Tanggal mulai"
                    className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none"
                  />

                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#0080f2] hover:bg-[#0070d4] py-3 text-sm font-medium text-white shadow-xs transition"
                >
                  Search
                </button>

              </div>

            </form>

            {/* Stats (Events & Kota dari backend) */}

            <div className="mt-10 flex flex-wrap gap-10">

              <div>

                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {loading ? "…" : error ? "–" : totalItems}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Events On Sale
                </p>

              </div>

              <div>

                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {loading ? "…" : cities.length}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Cities
                </p>

              </div>

              <div>

                <h2 className="flex items-center gap-1.5 text-3xl font-bold text-white tracking-tight">
                  4.9
                  <Star className="h-5 w-5 fill-slate-300 text-slate-300" />
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Rating
                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative hidden lg:flex justify-center">

            {/* Floating Left */}

            <div className="absolute left-0 top-10 z-10 rounded-xl border border-slate-100 bg-white/95 p-4 shadow-lg backdrop-blur-md">

              <Users className="mb-2 text-[#0080f2]" size={20} />

              <h2 className="text-2xl font-bold text-slate-900">
                150K+
              </h2>

              <p className="text-xs text-slate-500">
                Happy Users
              </p>

            </div>

            {/* Main Card — event on sale terdekat dari backend */}

            <div className="w-[400px] overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 transition-all duration-300">

              {loading ? (
                <div className="animate-pulse">
                  <div className="h-64 w-full bg-slate-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-28 rounded-full bg-slate-200" />
                    <div className="h-6 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                    <div className="h-12 w-full rounded-xl bg-slate-200" />
                  </div>
                </div>
              ) : highlight ? (
                <>
                  <img
                    src={posterOf(highlight)}
                    alt={highlight.name}
                    onError={handleImageError}
                    className="h-64 w-full object-cover"
                  />

                  <div className="p-6">

                    <span className="inline-block rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-xs font-medium text-[#0080f2]">
                      {eventTypeLabel(highlight)} • {formatEventDate(highlight)}
                    </span>

                    <h2 className="mt-3 text-xl font-semibold text-slate-900 line-clamp-2">
                      {highlight.name}
                    </h2>

                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">
                      {[highlight.venue, highlight.city].filter(Boolean).join(", ")}
                    </p>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">

                      <div>

                        <p className="text-xs text-slate-400">
                          Starting From
                        </p>

                        <h2 className="text-xl font-bold text-[#0080f2]">
                          {highlightPrice !== null ? formatRupiah(highlightPrice) : "Lihat detail"}
                        </h2>

                      </div>

                      <Link
                        href={`/user/event/${highlight.id}`}
                        aria-label={`Lihat detail ${highlight.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0080f2] text-white hover:bg-[#0070d4] transition shadow-xs"
                      >

                        <ArrowRight size={18} />

                      </Link>

                    </div>

                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <Ticket className="mx-auto text-slate-400" size={36} />
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    {error ? "Server event tidak tersedia" : "Belum ada event on sale"}
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {error || "Event akan tampil di sini setelah penjualan dibuka."}
                  </p>
                </div>
              )}

            </div>

            {/* Floating Right */}

            <div className="absolute right-0 bottom-10 rounded-xl border border-slate-100 bg-white/95 p-4 shadow-lg backdrop-blur-md">

              <h2 className="text-2xl font-bold text-slate-900">
                24/7
              </h2>

              <p className="text-xs text-slate-500">
                Customer Support
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
