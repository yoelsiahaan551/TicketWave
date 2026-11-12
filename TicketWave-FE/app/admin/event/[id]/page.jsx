"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Upload,
  Ticket,
  Plus,
  Calendar,
  MapPin,
  Building2,
  Clock,
  Music2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "@/app/lib/api";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200";

const STATUS_TRANSITIONS = [
  "published",
  "on_sale",
  "sales_closed",
  "ongoing",
  "finished",
  "archived",
];

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchEventDetail = useCallback(async () => {
    if (!id) return;
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError(err.message || "Gagal memuat detail event.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchEventDetail();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchEventDetail]);

  const handleUploadMedia = async (type, file) => {
    if (!file || !id) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append(type, file);
      await api.upload(`/events/${id}/${type}`, fd);
      setMessage({
        type: "success",
        text: `${type === "poster" ? "Poster" : "Banner"} event berhasil diunggah!`,
      });
      await fetchEventDetail();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || `Gagal mengunggah ${type}.`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setMessage(null);
    try {
      await api.patch(`/events/${id}/status`, { status: newStatus });
      setMessage({
        type: "success",
        text: `Status event berhasil diperbarui menjadi "${newStatus}".`,
      });
      await fetchEventDetail();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal memperbarui status event.",
      });
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    const confirmed = window.confirm(
      `Hapus event "${event.name}" secara permanen?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/events/${id}`);
      router.push("/admin/event");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.message ||
          "Gagal menghapus event. Event yang sudah memiliki penjualan tiket tidak dapat dihapus.",
      });
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(p || 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        <p className="font-bold">{error || "Event tidak ditemukan"}</p>
        <Link
          href="/admin/event"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white"
        >
          Kembali ke Daftar Event
        </Link>
      </div>
    );
  }

  const ticketTypes = event.ticket_types || [];
  const lineup = event.festival_artists || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/event"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
        >
          <ArrowLeft size={17} />
          Kembali ke Daftar Event
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/event/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0080f2] px-4 py-2.5 text-xs font-bold text-white shadow"
          >
            <Pencil size={15} />
            Edit Informasi Event
          </Link>

          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Upload size={15} />
              {uploading ? "Mengunggah..." : "Upload Poster"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleUploadMedia("poster", e.target.files?.[0])}
            />
          </label>

          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Upload size={15} />
              {uploading ? "Mengunggah..." : "Upload Banner"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleUploadMedia("banner", e.target.files?.[0])}
            />
          </label>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
          >
            <Trash2 size={15} />
            Hapus Event
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-sm font-semibold ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Banner */}
      <div className="relative h-72 overflow-hidden rounded-3xl">
        <img
          src={event.banner_url || event.poster_url || FALLBACK_BANNER}
          alt={event.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-between gap-4 p-6 text-white sm:flex-row sm:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0080f2]/100 px-3.5 py-1 text-xs font-bold uppercase">
                {event.status?.replace("_", " ")}
              </span>
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold capitalize backdrop-blur">
                {event.event_type}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black">{event.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Ubah Status:
            </span>
            <select
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-xl bg-white/95 px-3 py-2 text-xs font-bold uppercase text-slate-900 outline-none"
            >
              {event.status === "draft" && (
                <option value="draft" disabled>
                  DRAFT
                </option>
              )}
              {STATUS_TRANSITIONS.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Calendar,
            label: "Tanggal / Durasi",
            value:
              event.event_date || `Festival ${event.days_count || 1} Hari`,
          },
          {
            icon: Clock,
            label: "Waktu / Artis",
            value: event.event_time
              ? `${event.event_time.slice(0, 5)} WIB • ${event.artist_name || ""}`
              : event.artist_name || `${lineup.length} Penampil Festival`,
          },
          {
            icon: MapPin,
            label: "Venue & Kota",
            value: `${event.venue}, ${event.city}`,
          },
          {
            icon: Building2,
            label: "Agency Penyelenggara",
            value: event.agency?.name || `Agency #${event.agency_id}`,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon size={20} className="mb-3 text-[#0080f2] dark:text-[#0080f2]" />
            <p className="text-xs font-semibold uppercase text-slate-400">
              {label}
            </p>
            <p className="mt-1 font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Description & Festival Lineup */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-black text-slate-900 dark:text-white">
            Deskripsi Event
          </h2>
          <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
            {event.description || "Belum ada deskripsi."}
          </p>
        </div>

        {lineup.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <Music2 size={18} className="text-[#0080f2] dark:text-[#0080f2]" />
              Lineup Festival ({lineup.length} Artis)
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {lineup.map((fa) => (
                <div
                  key={fa.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-800"
                >
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fa.artist_name}
                  </span>
                  <span className="rounded-full bg-[#0080f2]/15 px-2.5 py-0.5 text-xs font-bold text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]">
                    Hari {fa.day_number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Types & Phases */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Kategori Tiket &amp; Fase Harga ({ticketTypes.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola fase diskon (<code className="font-mono">early_bird</code>, <code className="font-mono">presale</code>, <code className="font-mono">normal</code>) untuk setiap kategori tiket.
            </p>
          </div>
          <Link
            href={`/admin/event/${id}/ticket-phase`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0080f2] px-5 py-2.5 text-xs font-bold text-white shadow transition hover:scale-105"
          >
            <Plus size={16} />
            Kelola Semua Fase Tiket
          </Link>
        </div>

        {ticketTypes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Event ini belum memiliki kategori tiket.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ticketTypes.map((tt) => (
              <div
                key={tt.id}
                className="flex flex-col rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">
                      {tt.name}
                    </h3>
                    <p className="mt-1 text-lg font-black text-[#0080f2] dark:text-[#0080f2]">
                      {formatPrice(tt.base_price)}
                    </p>
                  </div>
                  <Ticket size={20} className="text-slate-300 dark:text-slate-600" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                  <div>
                    <p className="text-slate-500">Kuota</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {tt.quota}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Terjual</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {tt.sold_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Sisa</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {tt.remaining ?? tt.quota - tt.sold_count}
                    </p>
                  </div>
                </div>

                {/* Phases summary */}
                <div className="mt-4 flex-1">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Fase Harga ({tt.phases?.length || 0}):
                  </p>
                  {tt.phases && tt.phases.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {tt.phases.map((ph) => (
                        <div
                          key={ph.id}
                          className="flex items-center justify-between rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] dark:bg-slate-800"
                        >
                          <span className="font-bold capitalize text-slate-800 dark:text-slate-200">
                            {ph.phase_name?.replace("_", " ")} (-{ph.discount_percent}%)
                          </span>
                          <span className="text-slate-500">
                            {ph.start_date} s/d {ph.end_date}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">
                      Belum ada fase khusus (menggunakan harga dasar).
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={`/admin/event/${id}/ticket-phase?ticketTypeId=${tt.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-[#0080f2] dark:hover:bg-[#0070d4]"
                  >
                    Kelola Fase Harga
                  </Link>
                  <Link
                    href={`/admin/event/${id}/ticket-phase/create?ticketTypeId=${tt.id}`}
                    className="flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 hover:border-[#0080f2] dark:border-slate-700 dark:text-slate-200"
                    title="Tambah Fase"
                  >
                    <Plus size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
