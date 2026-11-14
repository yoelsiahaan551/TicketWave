"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";

const STATUS_MAP = {
  menunggu_pembayaran: { label: "Menunggu Pembayaran", style: "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300" },
  pending_payment: { label: "Menunggu Pembayaran", style: "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300" },
  diproses: { label: "Diproses", style: "border-blue-200/60 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300" },
  paid: { label: "Lunas", style: "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300" },
  selesai: { label: "Selesai", style: "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300" },
  cancelled: { label: "Dibatalkan", style: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300" },
  dibatalkan: { label: "Dibatalkan", style: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300" },
  expired: { label: "Kedaluwarsa", style: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300" },
};

export default function OrderCard({ order }) {
  if (!order) return null;

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const formatTanggal = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, style: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" };
  const bisaLanjutBayar = order.status === "menunggu_pembayaran" || order.status === "pending_payment";
  const orderId = order.id || order.booking_code;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">No. Pesanan</p>
          <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
            {order.nomor || order.booking_code}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusInfo.style}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
        <div>
          <p className="text-xs font-medium text-slate-500">Event</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{order.eventNama || order.event_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Tanggal Pesan</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <CalendarDays size={14} className="text-slate-400" />
            {formatTanggal(order.dibuatPada || order.created_at)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Jumlah Tiket</p>
          <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">{order.jumlahTiket || order.quantity} tiket</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="mt-0.5 text-sm font-bold text-[#0080f2]">
            {formatRupiah(order.total || order.total_price)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <Link
          href={`/user/pesanan/${orderId}`}
          className="flex items-center gap-1.5 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
        >
          Lihat Detail
          <ChevronRight size={14} />
        </Link>
        {bisaLanjutBayar && (
          <Link
            href={`/user/pesanan/${orderId}`}
            className="flex items-center rounded-xl border border-[#0080f2] px-4 py-2 text-xs font-medium text-[#0080f2] transition hover:bg-blue-50/50 dark:border-blue-500/60 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            Lanjutkan Pembayaran
          </Link>
        )}
      </div>
    </div>
  );
}
