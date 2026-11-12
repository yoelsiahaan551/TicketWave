"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";

const STATUS_MAP = {
  menunggu_pembayaran: { label: "Menunggu Pembayaran", style: "bg-amber-100 text-amber-700" },
  pending_payment: { label: "Menunggu Pembayaran", style: "bg-amber-100 text-amber-700" },
  diproses: { label: "Diproses", style: "bg-[#0080f2]/15 text-[#0080f2]" },
  paid: { label: "Lunas", style: "bg-emerald-100 text-emerald-700" },
  selesai: { label: "Selesai", style: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Dibatalkan", style: "bg-red-100 text-red-600" },
  dibatalkan: { label: "Dibatalkan", style: "bg-red-100 text-red-600" },
  expired: { label: "Kedaluwarsa", style: "bg-slate-100 text-slate-600" },
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

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, style: "bg-slate-100 text-slate-600" };
  const bisaLanjutBayar = order.status === "menunggu_pembayaran" || order.status === "pending_payment";
  const orderId = order.id || order.booking_code;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">No. Pesanan</p>
          <p className="font-mono text-sm font-bold text-slate-900">
            {order.nomor || order.booking_code}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusInfo.style}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold text-slate-500">Event</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{order.eventNama || order.event_name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Tanggal Pesan</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
            <CalendarDays size={15} className="text-[#0080f2]" />
            {formatTanggal(order.dibuatPada || order.created_at)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Jumlah Tiket</p>
          <p className="mt-1 text-sm text-slate-700">{order.jumlahTiket || order.quantity} tiket</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Total</p>
          <p className="mt-1 font-black text-[#0080f2]">
            {formatRupiah(order.total || order.total_price)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/user/pesanan/${orderId}`}
          className="flex items-center gap-1.5 rounded-xl bg-[#0080f2] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0080f2]/20 transition hover:scale-[1.03]"
        >
          Lihat Detail
          <ChevronRight size={15} />
        </Link>
        {bisaLanjutBayar && (
          <button className="flex items-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#0080f2] hover:text-[#0080f2]">
            Lanjutkan Pembayaran
          </button>
        )}
      </div>
    </div>
  );
}
