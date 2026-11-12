"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight, Music2, Sparkles } from "lucide-react";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80";

export default function EventCard({ event }) {
  if (!event) return null;

  const formatPrice = (price) => {
    if (price === null || price === undefined) return null;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr, timeStr) => {
    if (!dateStr) {
      return event.event_type === "festival"
        ? `Festival ${event.days_count || 1} Hari`
        : "Jadwal Menyusul";
    }
    try {
      const date = new Date(dateStr);
      const options = { day: "numeric", month: "short", year: "numeric" };
      let formatted = date.toLocaleDateString("id-ID", options);
      if (timeStr) {
        formatted += ` • ${timeStr.slice(0, 5)} WIB`;
      }
      return formatted;
    } catch {
      return dateStr;
    }
  };

  const formattedPrice = formatPrice(event.price_from);

  return (
    <Link
      href={`/user/event/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Image */}
      <div className="relative h-60 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={event.poster_url || event.banner_url || FALLBACK_POSTER}
          alt={event.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow backdrop-blur">
            <Sparkles size={13} className="text-[#0080f2]" />
            {event.event_type === "festival"
              ? `Festival (${event.days_count || 1} Hari)`
              : "Single Event"}
          </span>

          {event.status === "on_sale" && (
            <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow">
              On Sale
            </span>
          )}
        </div>

        {event.artist_name && (
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-xs font-semibold text-white/90">
            <Music2 size={14} className="shrink-0 text-[#0080f2]" />
            <span className="truncate">{event.artist_name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2 text-xl font-black text-slate-900 transition group-hover:text-[#0080f2] dark:text-white dark:group-hover:text-[#0080f2]">
          {event.name}
        </h3>

        <div className="mt-4 space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <CalendarDays size={17} className="shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
            <span className="truncate">{formatDate(event.event_date, event.event_time)}</span>
          </div>

          <div className="flex items-center gap-3">
            <MapPin size={17} className="shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
            <span className="truncate">
              {event.venue ? `${event.venue}, ${event.city}` : event.city}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mulai dari
            </p>
            <span className="text-lg font-black text-[#0080f2] dark:text-[#0080f2]">
              {formattedPrice || "Lihat Kategori Tiket"}
            </span>
          </div>

          <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition group-hover:bg-[#0080f2] group-hover:text-white dark:bg-slate-800 dark:text-slate-200">
            Beli Tiket
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
