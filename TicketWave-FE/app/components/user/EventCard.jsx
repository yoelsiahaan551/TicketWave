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
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Image */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={event.poster_url || event.banner_url || FALLBACK_POSTER}
          alt={event.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

        <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-900 shadow-xs backdrop-blur-xs">
            <Sparkles size={12} className="text-[#0080f2]" />
            {event.event_type === "festival"
              ? `Festival (${event.days_count || 1} Hari)`
              : "Single Event"}
          </span>

          {event.status === "on_sale" && (
            <span className="rounded-full border border-blue-900/40 bg-slate-900/90 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#0080f2] shadow-xs backdrop-blur-xs">
              On Sale
            </span>
          )}
        </div>

        {event.artist_name && (
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-1.5 text-xs font-medium text-white/90">
            <Music2 size={13} className="shrink-0 text-slate-300" />
            <span className="truncate">{event.artist_name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900 transition group-hover:text-[#0080f2] dark:text-white dark:group-hover:text-[#0080f2]">
          {event.name}
        </h3>

        <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="shrink-0 text-slate-400" />
            <span className="truncate">{formatDate(event.event_date, event.event_time)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-slate-400" />
            <span className="truncate">
              {event.venue ? `${event.venue}, ${event.city}` : event.city}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              Mulai dari
            </p>
            <span className="text-base font-bold text-[#0080f2]">
              {formattedPrice || "Lihat Kategori Tiket"}
            </span>
          </div>

          <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition group-hover:bg-[#0080f2] group-hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-[#0080f2] dark:group-hover:text-white">
            Beli Tiket
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
