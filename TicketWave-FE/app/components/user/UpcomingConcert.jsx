"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CalendarX2, RefreshCw } from "lucide-react";
import api from "@/app/lib/api";
import EventCard from "@/app/components/user/EventCard";

export default function UpcomingConcert() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcomingEvents = async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/public/events", {
        page: 1,
        per_page: 6,
      });
      setEvents(response.data?.items || []);
    } catch (err) {
      setError(err.message || "Gagal memuat daftar event.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchUpcomingEvents();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="bg-slate-50 py-20 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
              Live On Sale Events
            </span>

            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
              Event yang Sedang Dijual
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-slate-500 dark:text-slate-400">
              Daftar konser dan festival resmi yang saat ini berstatus aktif (On Sale) langsung dari katalog TicketWave.
            </p>
          </div>

          <Link
            href="/user/event"
            className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0080f2] shadow-sm transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-[#0080f2]"
          >
            Lihat Semua Event
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-5 h-6 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50/70 p-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              Tidak dapat terhubung ke server event
            </p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={fetchUpcomingEvents}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#0070d4]"
            >
              <RefreshCw size={16} />
              Muat Ulang
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0080f2]/10 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]">
              <CalendarX2 size={30} />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
              Belum Ada Event yang Sedang Dijual
            </h3>
            <p className=" mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Saat ini belum ada event dengan status <code className="font-semibold">on_sale</code> di sistem. Silakan periksa kembali nanti atau buka katalog lengkap.
            </p>
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
