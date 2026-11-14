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
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={14} />
        Kembali ke Detail Event
      </Link>

      <div className="w-full max-w-4xl rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">
            Detail Kategori Tiket {ticketType ? `— ${ticketType.name}` : `#${typeId}`}
          </h1>
          <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Read-Only Schema
          </span>
        </div>

        {ticketType && (
          <div className="mt-4 grid gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Nama Kategori</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white">
                {ticketType.name}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Harga Dasar</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white">
                Rp {Number(ticketType.base_price || 0).toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Kuota / Terjual</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white">
                {ticketType.quota} / {ticketType.sold_count} terjual
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Info size={16} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
          <span>
            Backend belum menyediakan endpoint <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">PUT / DELETE /api/ticket-types/&lt;id&gt;</code> untuk mengubah kuota atau harga dasar kategori tiket yang sudah dibuat. Untuk mengatur potongan harga dan periode penjualan, silakan gunakan fitur <strong>Ticket Phases</strong>.
          </span>
        </div>

        <div className="mt-5">
          <Link
            href={`/admin/event/${id}/ticket-phase?ticketTypeId=${typeId}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Ticket size={14} />
            Kelola Fase Harga untuk Kategori Ini
          </Link>
        </div>
      </div>
    </div>
  );
}
