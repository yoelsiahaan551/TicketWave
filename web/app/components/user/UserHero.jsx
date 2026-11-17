"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Ticket,
  MapPin,
  Search,
  Sparkles,
  Receipt,
} from "lucide-react";
import { useLandingEvents, useLandingCities } from "@/app/components/landingPage/useLandingEvents";
import { formatRupiah, priceFromOf } from "@/app/components/landingPage/eventDisplay";
import { useAuth } from "@/app/context/AuthContext";
import { useIsMounted } from "@/app/context/ThemeContext";

export default function UserHero() {
  const router = useRouter();
  const { user } = useAuth();
  const mounted = useIsMounted();

  const { events, totalItems: totalEvents, loading, error, retry } = useLandingEvents();
  const { cities, loading: citiesLoading, error: cityError, retry: retryCities } = useLandingCities();
  const featuredEvent = events[0] || null;
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingCodeInput, setBookingCodeInput] = useState("");


  const handleSearchEvent = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/user/event?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/user/event");
    }
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    const code = bookingCodeInput.trim().toUpperCase();
    if (!code) return;
    router.push(`/user/pesanan/${encodeURIComponent(code)}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Jadwal Segera Hadir";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };


  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 lg:py-24">
      {/* Subtle background glow */}
      <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-slate-800/10 blur-[140px]" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-slate-800/10 blur-[140px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left Content */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md shadow-xs">
            <Sparkles size={14} className="text-[#0080f2]" />
            <span>
              {mounted && user?.name
                ? `Selamat Datang Kembali, ${user.name}!`
                : "Official Concert & Festival Ticketing"}
            </span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
            Temukan & Pesan
            <span className="block text-[#0080f2]">
              Tiket Event Impianmu
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
            Jelajahi konser tunggal dan festival musik terbaik di berbagai kota.
            Nikmati harga fase Early Bird & Presale langsung dari penyelenggara resmi.
          </p>

          {/* Search & Quick Booking Lookup Bar */}
          <div className="mt-6 space-y-2.5 max-w-xl">
            <form
              onSubmit={handleSearchEvent}
              className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-white/10 bg-white/95 dark:bg-slate-900/95 p-2 shadow-xl backdrop-blur-md"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama konser atau artis..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition"
              >
                Cari Event
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Quick Booking Code Lookup */}
            <form
              onSubmit={handleQuickLookup}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-md"
            >
              <Receipt size={15} className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={bookingCodeInput}
                onChange={(e) => setBookingCodeInput(e.target.value)}
                placeholder="Punya kode booking? (cth: TKTW-20261103-XXXXX)"
                className="flex-1 min-w-0 bg-transparent text-xs font-mono text-white outline-none placeholder:text-slate-400 placeholder:font-sans"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#0080f2] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#0070d4]"
              >
                Cek Pesanan
              </button>
            </form>
          </div>

          {error && <p role="alert" className="mt-3 text-sm text-white">Katalog gagal dimuat. <button type="button" onClick={retry} className="underline">Coba Lagi</button></p>}
          {cityError && <p role="alert" className="mt-3 text-sm text-white">Daftar kota gagal dimuat. <button type="button" onClick={retryCities} className="underline">Coba Lagi</button></p>}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 max-w-lg">
            <div>
              <p className="text-2xl font-bold tracking-tight text-white">
                {loading ? "…" : error ? "–" : totalEvents}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Event On Sale
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-white">
                {citiesLoading ? "…" : cityError ? "–" : cities.length}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Kota Tersedia
              </p>
            </div>

          </div>
        </div>

        {/* Right Content — Featured Real Event Card */}
        <div className="relative">
          {featuredEvent ? (
            <Link
              href={`/user/event/${featuredEvent.id}`}
              className="group block overflow-hidden rounded-2xl border border-white/15 bg-white dark:bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-800">
                {featuredEvent.poster_url || featuredEvent.banner_url ? (
                  <img
                    src={featuredEvent.poster_url || featuredEvent.banner_url}
                    alt={featuredEvent.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900">
                    <Ticket size={48} className="text-slate-600" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-xs font-medium text-slate-900 shadow-xs">
                    {featuredEvent.event_type === "festival"
                      ? "Festival Multi-Hari"
                      : "Konser Tunggal"}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-xs font-medium text-slate-200 shadow-xs">
                    On Sale
                  </span>
                </div>

                <div className="absolute bottom-4 left-5 right-5 text-white">
                  {featuredEvent.artist_name && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {featuredEvent.artist_name}
                    </p>
                  )}
                  <h2 className="mt-0.5 text-xl sm:text-2xl font-bold leading-tight line-clamp-2">
                    {featuredEvent.name}
                  </h2>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={15} className="text-slate-400" />
                    <span>
                      {featuredEvent.event_type === "festival" && featuredEvent.days_count
                        ? `Festival ${featuredEvent.days_count} Hari`
                        : formatDate(featuredEvent.event_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-slate-400" />
                    <span>
                      {featuredEvent.venue}, {featuredEvent.city}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Mulai Dari
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-[#0080f2]">
                      {formatRupiah(priceFromOf(featuredEvent)) || "Lihat detail harga"}
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0080f2] text-white shadow-xs transition group-hover:scale-105 group-hover:bg-[#0070d4]">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-950/50 text-[#0080f2] border border-blue-900/50 shadow-md">
                <Ticket size={28} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">
                {loading ? "Memuat event…" : error ? "Event gagal dimuat" : "Belum ada event yang sedang dijual"}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Semua event yang berstatus <span className="font-semibold text-white/90">On Sale</span> di sistem akan tampil otomatis beserta kuota dan harga aktifnya.
              </p>
              <Link
                href="/user/event"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-5 py-2.5 text-xs font-medium text-white shadow-xs transition"
              >
                Buka Katalog Event
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
