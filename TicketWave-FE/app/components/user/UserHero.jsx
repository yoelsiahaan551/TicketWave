"use client";

import { useEffect, useState } from "react";
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
import api from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useIsMounted } from "@/app/context/ThemeContext";

export default function UserHero() {
  const router = useRouter();
  const { user } = useAuth();
  const mounted = useIsMounted();

  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [citiesCount, setCitiesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingCodeInput, setBookingCodeInput] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.allSettled([
      api.get("/public/events", { per_page: 3 }),
      api.get("/public/events/cities"),
    ]).then(([eventsRes, citiesRes]) => {
      if (ignore) return;

      if (
        eventsRes.status === "fulfilled" &&
        eventsRes.value?.success &&
        eventsRes.value?.data
      ) {
        const items = eventsRes.value.data.items || [];
        setTotalEvents(eventsRes.value.data.total_items || items.length);
        if (items.length > 0) {
          setFeaturedEvent(items[0]);
        }
      }

      if (
        citiesRes.status === "fulfilled" &&
        citiesRes.value?.success &&
        citiesRes.value?.data?.cities
      ) {
        setCitiesCount(citiesRes.value.data.cities.length);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

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

  const formatPrice = (price) => {
    if (!price) return "Cek Tiket";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 lg:py-24">
      {/* Glow Effects matching Landing Page Hero */}
      <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-[#0080f2]/100/20 blur-[140px]" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#0080f2]/25 blur-[140px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left Content */}
        <div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0080f2]/25 bg-[#0080f2]/100/10 px-4 py-2 text-xs sm:text-sm font-semibold text-white/90 backdrop-blur-xl shadow-lg">
            <Sparkles size={16} />
            <span>
              {mounted && user?.name
                ? `Selamat Datang Kembali, ${user.name}!`
                : "Official Concert & Festival Ticketing"}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Temukan & Pesan
            <span className="block bg-[#0080f2] bg-clip-text text-transparent">
              Tiket Event Impianmu
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Jelajahi konser tunggal dan festival musik terbaik di berbagai kota.
            Nikmati harga fase Early Bird & Presale langsung dari penyelenggara resmi.
          </p>

          {/* Search & Quick Booking Lookup Bar */}
          <div className="mt-8 space-y-3 max-w-xl">
            <form
              onSubmit={handleSearchEvent}
              className="flex flex-col sm:flex-row gap-2.5 rounded-3xl border border-white/10 bg-white/95 dark:bg-slate-900/95 p-2.5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-1 items-center gap-3 px-4 py-2">
                <Search size={19} className="shrink-0 text-[#0080f2]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama konser atau artis..."
                  className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-[1.02]"
              >
                Cari Event
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Booking Code Lookup */}
            <form
              onSubmit={handleQuickLookup}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md"
            >
              <Receipt size={16} className="shrink-0 text-[#0080f2]" />
              <input
                type="text"
                value={bookingCodeInput}
                onChange={(e) => setBookingCodeInput(e.target.value)}
                placeholder="Punya kode booking? (cth: TKTW-20261103-XXXXX)"
                className="flex-1 bg-transparent text-xs sm:text-sm font-mono text-white outline-none placeholder:text-slate-400 placeholder:font-sans"
              />
              <button
                type="submit"
                className="rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white/90 transition hover:bg-[#0070d4] hover:text-white"
              >
                Cek Pesanan
              </button>
            </form>
          </div>

          {/* Real Stats from Backend */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 max-w-lg">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {totalEvents}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Event On Sale
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {citiesCount}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Kota Tersedia
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#0080f2]">
                15m
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Garansi Kuota Checkout
              </p>
            </div>
          </div>
        </div>

        {/* Right Content — Featured Real Event Card */}
        <div className="relative">
          {featuredEvent ? (
            <Link
              href={`/user/event/${featuredEvent.id}`}
              className="group block overflow-hidden rounded-[32px] border border-white/15 bg-white dark:bg-slate-900 shadow-[0_35px_80px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-72 sm:h-80 overflow-hidden bg-slate-800">
                {featuredEvent.poster_url || featuredEvent.banner_url ? (
                  <img
                    src={featuredEvent.poster_url || featuredEvent.banner_url}
                    alt={featuredEvent.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900">
                    <Ticket size={64} className="text-[#0080f2]/40" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="rounded-full bg-[#0080f2]/100 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    {featuredEvent.event_type === "festival"
                      ? "Festival Multi-Hari"
                      : "Konser Tunggal"}
                  </span>
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    On Sale
                  </span>
                </div>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  {featuredEvent.artist_name && (
                    <p className="text-xs font-bold uppercase tracking-widest text-white/90">
                      {featuredEvent.artist_name}
                    </p>
                  )}
                  <h2 className="mt-1 text-2xl sm:text-3xl font-black leading-tight line-clamp-2">
                    {featuredEvent.name}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={17} className="text-[#0080f2] dark:text-[#0080f2]" />
                    <span>
                      {featuredEvent.event_type === "festival" && featuredEvent.days_count
                        ? `Festival ${featuredEvent.days_count} Hari`
                        : formatDate(featuredEvent.event_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={17} className="text-[#0080f2] dark:text-[#0080f2]" />
                    <span>
                      {featuredEvent.venue}, {featuredEvent.city}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Mulai Dari
                    </p>
                    <p className="mt-0.5 text-2xl font-black text-[#0080f2] dark:text-[#0080f2]">
                      {formatPrice(featuredEvent.price_from)}
                    </p>
                  </div>

                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0080f2] text-white shadow-lg transition group-hover:scale-110">
                    <ArrowRight size={20} />
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0080f2] text-white shadow-xl">
                <Ticket size={36} />
              </div>
              <h2 className="mt-6 text-2xl font-black text-white">
                Jelajahi Katalog Event Resmi
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Semua event yang berstatus <span className="font-semibold text-white/90">On Sale</span> di sistem akan tampil otomatis beserta kuota dan harga aktifnya.
              </p>
              <Link
                href="/user/event"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0080f2] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-105"
              >
                Buka Katalog Event
                <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
