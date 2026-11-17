"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      <div className="space-y-4">
        <div className="h-56 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-xl border border-slate-300 bg-slate-100 p-6 text-center text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p className="font-semibold text-sm">{error || "Event tidak ditemukan"}</p>
        <Link
          href="/admin/event"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white"
        >
          Kembali ke Daftar Event
        </Link>
      </div>
    );
  }

  const ticketTypes = event.ticket_types || [];
  const lineup = event.festival_artists || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/event"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={15} />
          Kembali ke Daftar Event
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/event/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
          >
            <Pencil size={13} />
            Edit Event
          </Link>

          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Upload size={13} />
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
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Upload size={13} />
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
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Trash2 size={13} />
            Hapus
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 p-3.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {message.type === "error" ? (
            <AlertCircle size={15} className="text-slate-500 dark:text-slate-400" />
          ) : (
            <CheckCircle2 size={15} className="text-slate-500 dark:text-slate-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Banner */}
      <div className="relative h-60 overflow-hidden rounded-xl">
        <Image
          fill
          sizes="100vw"
          unoptimized
          src={event.banner_url || event.poster_url || FALLBACK_BANNER}
          alt={event.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-between gap-3 p-5 text-white sm:flex-row sm:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-medium uppercase text-white dark:bg-slate-100 dark:text-slate-900">
                {event.status?.replace("_", " ")}
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-medium capitalize backdrop-blur">
                {event.event_type}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold sm:text-2xl">{event.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              Ubah Status:
            </span>
            <select
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-xl bg-white/95 px-2.5 py-1 text-xs font-medium uppercase text-slate-900 outline-none"
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon size={18} className="mb-2 text-slate-400" />
            <p className="text-[10px] font-medium uppercase text-slate-400">
              {label}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Description & Festival Lineup */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
            Deskripsi Event
          </h2>
          <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {event.description || "Belum ada deskripsi."}
          </p>
        </div>

        {lineup.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Music2 size={16} className="text-slate-400" />
              Lineup Festival ({lineup.length} Artis)
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {lineup.map((fa) => (
                <div
                  key={fa.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-slate-800"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {fa.artist_name}
                  </span>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    Hari {fa.day_number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Types & Phases */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Kategori Tiket &amp; Fase Harga ({ticketTypes.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola fase diskon untuk setiap kategori tiket.
            </p>
          </div>
          <Link
            href={`/admin/event/${id}/ticket-phase`}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Plus size={14} />
            Kelola Semua Fase
          </Link>
        </div>

        {ticketTypes.length === 0 ? (
          <p className="text-xs text-slate-500">
            Event ini belum memiliki kategori tiket.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {ticketTypes.map((tt) => (
              <div
                key={tt.id}
                className="flex flex-col rounded-xl border border-slate-200/80 p-4 dark:border-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {tt.name}
                    </h3>
                    <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                      {formatPrice(tt.base_price)}
                    </p>
                  </div>
                  <Ticket size={18} className="text-slate-300 dark:text-slate-600" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-center text-xs dark:bg-slate-800/60">
                  <div>
                    <p className="text-[10px] text-slate-400">Kuota</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {tt.quota}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Terjual</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {tt.sold_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Sisa</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {tt.remaining ?? tt.quota - tt.sold_count}
                    </p>
                  </div>
                </div>

                {/* Phases summary */}
                <div className="mt-3 flex-1">
                  <p className="text-[11px] font-medium text-slate-400">
                    Fase Harga ({tt.phases?.length || 0}):
                  </p>
                  {tt.phases && tt.phases.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {tt.phases.map((ph) => (
                        <div
                          key={ph.id}
                          className="flex items-center justify-between rounded-md bg-slate-100 px-2 py-1 text-[10px] dark:bg-slate-800"
                        >
                          <span className="font-medium capitalize text-slate-800 dark:text-slate-200">
                            {ph.phase_name?.replace("_", " ")} (-{ph.discount_percent}%)
                          </span>
                          <span className="text-slate-400">
                            {ph.start_date} s/d {ph.end_date}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Belum ada fase khusus.
                    </p>
                  )}
                </div>

                <div className="mt-3 flex gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link
                    href={`/admin/event/${id}/ticket-phase?ticketTypeId=${tt.id}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Kelola Fase
                  </Link>
                  <Link
                    href={`/admin/event/${id}/ticket-phase/create?ticketTypeId=${tt.id}`}
                    className="flex items-center justify-center rounded-xl border border-slate-200/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
                    title="Tambah Fase"
                  >
                    <Plus size={13} />
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
