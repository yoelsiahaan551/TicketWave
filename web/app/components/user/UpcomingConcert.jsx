"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CalendarX2, RefreshCw } from "lucide-react";
import api from "@/app/lib/api";
import EventCard from "@/app/components/user/EventCard";
import { getStoredEvents } from "@/app/lib/dummyApiHandler";

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
      let items = response.data?.items || [];
      try {
        const localEvents = getStoredEvents().filter((e) => e.status === "on_sale");
        const extraEvents = localEvents.filter(
          (le) =>
            !items.some(
              (be) =>
                String(be.id) === String(le.id) ||
                (be.name && le.name && be.name.toLowerCase() === le.name.toLowerCase())
            )
        );
        if (extraEvents.length > 0) {
          items = [...extraEvents, ...items];
        }
      } catch {
        // ignore
      }
      setEvents(items);
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
              Live On Sale Events
            </span>

            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Event yang Sedang Dijual
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Daftar konser dan festival resmi yang saat ini berstatus aktif (On Sale) langsung dari katalog TicketWave.
            </p>
          </div>

          <Link
            href="/user/event"
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#0080f2] dark:hover:text-[#0080f2]"
          >
            Lihat Semua Event
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-5 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="mt-5 h-9 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Tidak dapat terhubung ke server event
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{error}</p>
            <button
              type="button"
              onClick={fetchUpcomingEvents}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0080f2] px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
            >
              <RefreshCw size={15} />
              Muat Ulang
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <CalendarX2 size={24} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Belum Ada Event yang Sedang Dijual
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
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
