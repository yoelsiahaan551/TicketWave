"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/app/lib/api";

export default function EditTicketPhasePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;
  const phaseId = params?.phaseId;

  const [ticketTypeId, setTicketTypeId] = useState(null);
  const [phaseName, setPhaseName] = useState("early_bird");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discount, setDiscount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!phaseId) return;
    let ignore = false;
    api
      .get(`/phases/${phaseId}`)
      .then((res) => {
        if (ignore) return;
        const ph = res.data;
        if (ph) {
          setTicketTypeId(ph.ticket_type_id);
          setPhaseName(ph.phase_name || "early_bird");
          setStartDate(ph.start_date || "");
          setEndDate(ph.end_date || "");
          setDiscount(ph.discount_percent ?? 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Gagal memuat detail fase harga.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [phaseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.put(`/phases/${phaseId}`, {
        phase_name: phaseName,
        start_date: startDate,
        end_date: endDate,
        discount_percent: Number(discount),
      });
      setSuccessMsg("Fase harga berhasil diperbarui!");
      setTimeout(() => {
        router.push(
          `/admin/event/${eventId}/ticket-phase${
            ticketTypeId ? `?ticketTypeId=${ticketTypeId}` : ""
          }`
        );
      }, 800);
    } catch (err) {
      setError(
        err.message ||
          "Gagal memperbarui fase harga. Periksa rentang tanggal agar tidak tumpang tindih."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-80 max-w-2xl animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${eventId}/ticket-phase${
          ticketTypeId ? `?ticketTypeId=${ticketTypeId}` : ""
        }`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
      >
        <ArrowLeft size={17} />
        Kembali ke Fase Tiket
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Edit Fase Harga #{phaseId}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Perbarui fase harga melalui <code className="font-mono">PUT /api/phases/{phaseId}</code>.
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

        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

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
              Tanggal Mulai *
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
              Tanggal Berakhir *
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
          <input
            type="number"
            min={0}
            max={100}
            required
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-32 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[#0080f2] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
