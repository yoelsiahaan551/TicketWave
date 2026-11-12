"use client";

import { CalendarDays, MapPin, Clock, QrCode } from "lucide-react";

const STATUS_STYLE = {
  aktif: "bg-[#0080f2]/15 text-[#0080f2]",
  valid: "bg-emerald-100 text-emerald-700",
  digunakan: "bg-slate-100 text-slate-500",
  used: "bg-slate-100 text-slate-500",
  batal: "bg-red-100 text-red-600",
  cancelled: "bg-red-100 text-red-600",
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
    <div className={`overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg ${!isActive ? "opacity-70" : ""}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Event image */}
        <div className="relative h-40 shrink-0 sm:h-auto sm:w-52">
          <img
            src={ticket.gambar || ticket.poster_url || "https://via.placeholder.com/200x160"}
            alt={ticket.eventNama || ticket.event_name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {ticket.eventNama || ticket.event_name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#0080f2]">
                {ticket.kategoriTiket || ticket.ticket_type_name}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${style}`}>
              {label}
            </span>
          </div>

          <div className="mt-4 grid gap-2.5 text-sm text-slate-500 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <CalendarDays size={16} className="shrink-0 text-[#0080f2]" />
              {formatTanggal(ticket.tanggal || ticket.event_date)}
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="shrink-0 text-[#0080f2]" />
              {ticket.waktu || ticket.event_time ? (ticket.waktu || ticket.event_time).slice(0, 5) + " WIB" : "TBA"}
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <MapPin size={16} className="shrink-0 text-[#0080f2]" />
              {ticket.lokasi || ticket.venue}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">Kode Tiket</p>
              <p className="font-mono text-sm font-bold tracking-wider text-slate-900">
                {ticket.kode || ticket.ticket_code || "—"}
              </p>
            </div>
            {isActive && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                <QrCode size={20} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-500">Tunjukkan saat masuk</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
