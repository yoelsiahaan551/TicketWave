"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info, Ticket } from "lucide-react";
import api from "@/app/lib/api";

export default function EditTicketTypePage() {
  const params = useParams();
  const id = params?.id;
  const typeId = params?.typeId;
  const [ticketType, setTicketType] = useState(null);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/events/${id}`)
      .then((res) => {
        const tts = res.data?.ticket_types || [];
        const found = tts.find((t) => String(t.id) === String(typeId));
        setTicketType(found || null);
      })
      .catch(() => setTicketType(null));
  }, [id, typeId]);

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
      >
        <ArrowLeft size={17} />
        Kembali ke Detail Event
      </Link>

      <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Detail Kategori Tiket {ticketType ? `— ${ticketType.name}` : `#${typeId}`}
          </h1>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Read-Only Schema
          </span>
        </div>

        {ticketType && (
          <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3 dark:bg-slate-800/50">
            <div>
              <p className="text-xs text-slate-500">Nama Kategori</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {ticketType.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Harga Dasar</p>
              <p className="font-bold text-[#0080f2] dark:text-[#0080f2]">
                Rp {Number(ticketType.base_price || 0).toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Kuota / Terjual</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {ticketType.quota} / {ticketType.sold_count} terjual
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-5 text-slate-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-slate-300">
          <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <span>
            Backend belum menyediakan endpoint <code className="font-mono">PUT / DELETE /api/ticket-types/&lt;id&gt;</code> untuk mengubah kuota atau harga dasar kategori tiket yang sudah dibuat. Untuk mengatur potongan harga dan periode penjualan, silakan gunakan fitur <strong>Ticket Phases</strong>.
          </span>
        </div>

        <div className="mt-6">
          <Link
            href={`/admin/event/${id}/ticket-phase?ticketTypeId=${typeId}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20"
          >
            <Ticket size={17} />
            Kelola Fase Harga untuk Kategori Ini
          </Link>
        </div>
      </div>
    </div>
  );
}
