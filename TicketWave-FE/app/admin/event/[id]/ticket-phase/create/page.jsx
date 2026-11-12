"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import api from "@/app/lib/api";

function CreateTicketPhaseContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params?.id;
  const queryTicketTypeId = searchParams.get("ticketTypeId");

  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketTypeId, setTicketTypeId] = useState(queryTicketTypeId || "");
  const [phaseName, setPhaseName] = useState("early_bird");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discount, setDiscount] = useState(10);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    api
      .get(`/events/${eventId}`)
      .then((res) => {
        const tts = res.data?.ticket_types || [];
        setTicketTypes(tts);
        if (!ticketTypeId && tts.length > 0) {
          setTicketTypeId(String(tts[0].id));
        }
      })
      .catch(() => setTicketTypes([]));
  }, [eventId, ticketTypeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketTypeId) {
      setError("Pilih kategori tiket terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/ticket-types/${ticketTypeId}/phases`, {
        phase_name: phaseName,
        start_date: startDate,
        end_date: endDate,
        discount_percent: Number(discount),
      });
      router.push(
        `/admin/event/${eventId}/ticket-phase?ticketTypeId=${ticketTypeId}`
      );
    } catch (err) {
      setError(
        err.message ||
          "Gagal membuat fase harga. Pastikan start_date < end_date dan tidak tumpang tindih dengan fase lain."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${eventId}/ticket-phase${
          ticketTypeId ? `?ticketTypeId=${ticketTypeId}` : ""
        }`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
      >
        <ArrowLeft size={17} />
        Kembali ke Daftar Fase Tiket
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Tambah Fase Harga Tiket
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Terhubung dengan <code className="font-mono">POST /api/ticket-types/&lt;ticket_type_id&gt;/phases</code>. Sistem otomatis memvalidasi tumpang tindih tanggal (Date Overlap Check).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Kategori Tiket *
          </label>
          <select
            required
            value={ticketTypeId}
            onChange={(e) => setTicketTypeId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">-- Pilih Kategori Tiket --</option>
            {ticketTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name} (Rp {Number(tt.base_price).toLocaleString("id-ID")})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Nama Fase *
          </label>
          <select
            value={phaseName}
            onChange={(e) => setPhaseName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="early_bird">Early Bird</option>
            <option value="presale">Presale</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Tanggal Mulai (Start Date) *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Tanggal Berakhir (End Date) *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Persentase Diskon (0 – 100%) *
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              required
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-32 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <span className="text-xl font-black text-slate-700 dark:text-slate-300">
              %
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Isi 0% untuk fase harga normal tanpa potongan.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[#0080f2] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan Fase Harga"}
          </button>
          <Link
            href={`/admin/event/${eventId}/ticket-phase${
              ticketTypeId ? `?ticketTypeId=${ticketTypeId}` : ""
            }`}
            className="rounded-2xl border border-slate-300 px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CreateTicketPhasePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-slate-500">
          Memuat formulir fase tiket...
        </div>
      }
    >
      <CreateTicketPhaseContent />
    </Suspense>
  );
}
