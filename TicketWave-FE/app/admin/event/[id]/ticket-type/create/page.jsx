"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ticket, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import api from "@/app/lib/api";

export default function CreateTicketTypePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [quota, setQuota] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setMessage({
          type: "error",
          text: err.message || "Gagal memuat detail event.",
        });
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Nama kategori tiket wajib diisi." });
      return;
    }
    const priceNum = Number(basePrice);
    if (!priceNum || priceNum <= 0) {
      setMessage({ type: "error", text: "Harga dasar harus lebih besar dari 0." });
      return;
    }
    const quotaNum = Number(quota);
    if (!quotaNum || quotaNum <= 0) {
      setMessage({ type: "error", text: "Kuota tiket harus lebih besar dari 0." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        name: name.trim(),
        base_price: priceNum,
        quota: quotaNum,
        description: description.trim() || undefined,
      };

      const res = await api.post(`/events/${id}/ticket-types`, payload);
      setMessage({
        type: "success",
        text: `Kategori tiket "${res.data?.name || name}" berhasil ditambahkan ke database!`,
      });

      setTimeout(() => {
        router.push(`/admin/event/${id}`);
      }, 1200);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal menambahkan kategori tiket.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={14} />
        Kembali ke Detail Event ({event?.name || `#${id}`})
      </Link>

      <div className="w-full max-w-2xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-400">
            <Ticket size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Tambah Kategori Tiket Baru
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Event: <span className="font-semibold text-slate-700 dark:text-slate-200">{event?.name || `#${id}`}</span>
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-medium ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Kategori Tiket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: VIP Diamond, Regular Festival"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs focus:border-[#0080f2] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Harga Dasar (IDR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="Contoh: 750000"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs focus:border-[#0080f2] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kuota Tiket <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="Contoh: 150"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs focus:border-[#0080f2] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deskripsi &amp; Fasilitas Tiket (Opsional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Termasuk akses lounge, antrean khusus, dan merchandise resmi."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs focus:border-[#0080f2] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Link
              href={`/admin/event/${id}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] px-5 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4] disabled:opacity-60"
            >
              <Plus size={15} />
              {submitting ? "Menyimpan ke Backend..." : "Simpan Kategori Tiket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
