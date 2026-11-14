"use client";

import { CalendarDays, MapPin, Clock, QrCode } from "lucide-react";

const STATUS_STYLE = {
  aktif: "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  valid: "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  digunakan: "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  used: "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  batal: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
  cancelled: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const STATUS_LABEL = {
  aktif: "Berlaku",
  valid: "Berlaku",
  digunakan: "Sudah Digunakan",
  used: "Sudah Digunakan",
  batal: "Dibatalkan",
  cancelled: "Dibatalkan",
};

export default function TicketCard({ ticket }) {
  if (!ticket) return null;

  const formatTanggal = (d) => {
    if (!d) return "TBA";
    try {
      return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch {
      return d;
    }
  };

  const status = ticket.status || "aktif";
  const style = STATUS_STYLE[status] || STATUS_STYLE.aktif;
  const label = STATUS_LABEL[status] || status;
  const isActive = status === "aktif" || status === "valid";

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${!isActive ? "opacity-70" : ""}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Event image */}
        <div className="relative h-40 shrink-0 sm:h-auto sm:w-48 bg-slate-100 dark:bg-slate-800">
          <img
            src={ticket.gambar || ticket.poster_url || "https://via.placeholder.com/200x160"}
            alt={ticket.eventNama || ticket.event_name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {ticket.eventNama || ticket.event_name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {ticket.kategoriTiket || ticket.ticket_type_name}
              </p>
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
              {label}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="shrink-0 text-slate-400" />
              {formatTanggal(ticket.tanggal || ticket.event_date)}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="shrink-0 text-slate-400" />
              {ticket.waktu || ticket.event_time ? (ticket.waktu || ticket.event_time).slice(0, 5) + " WIB" : "TBA"}
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin size={14} className="shrink-0 text-slate-400" />
              {ticket.lokasi || ticket.venue}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Kode Tiket</p>
              <p className="font-mono text-xs font-semibold tracking-wider text-slate-800 dark:text-slate-200">
                {ticket.kode || ticket.ticket_code || "—"}
              </p>
            </div>
            {isActive && (
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
                <QrCode size={15} className="text-[#0080f2]" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Tunjukkan saat masuk</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
