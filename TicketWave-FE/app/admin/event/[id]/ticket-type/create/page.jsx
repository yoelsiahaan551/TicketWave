"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info, Ticket, Plus } from "lucide-react";
import api from "@/app/lib/api";

export default function CreateTicketTypePage() {
  const params = useParams();
  const id = params?.id;
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setEvent(null));
  }, [id]);

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
      >
        <ArrowLeft size={17} />
        Kembali ke Detail Event
      </Link>

      <div className="max-w-3xl rounded-3xl border border-amber-200 bg-amber-50/80 p-8 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
            <Info size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Pembuatan Kategori Tiket Bersifat Nested pada Saat Buat Event
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Berdasarkan arsitektur backend TicketWave saat ini, model{" "}
              <code className="font-mono font-bold">TicketType</code> hanya dibuat secara{" "}
              <strong>nested</strong> di dalam endpoint{" "}
              <code className="font-mono font-bold">POST /api/events</code>. Backend belum menyediakan endpoint terpisah (<code className="font-mono">POST /api/events/&lt;id&gt;/ticket-types</code>) untuk menambah kategori tiket baru setelah event disimpan.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Namun, Anda dapat <strong>menambah, mengubah, dan menghapus Fase Harga (Early Bird, Presale, Normal)</strong> secara penuh untuk setiap kategori tiket yang sudah ada pada event{" "}
              <strong>{event?.name || `#${id}`}</strong>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/admin/event/${id}/ticket-phase`}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20"
              >
                <Ticket size={17} />
                Kelola Fase Harga Tiket Event Ini
              </Link>
              <Link
                href="/admin/event/create"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Plus size={17} />
                Buat Event Baru dengan Kategori Tiket
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
