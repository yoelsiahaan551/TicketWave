"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Eye,
  Ticket,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/app/lib/api";

const STATUS_OPTIONS = [
  "draft",
  "published",
  "on_sale",
  "sales_closed",
  "ongoing",
  "finished",
  "archived",
];

const statusStyle = {
  draft: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  published: "bg-[#0080f2]/15 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]",
  on_sale:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  sales_closed:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  ongoing: "bg-[#0080f2]/15 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]",
  finished:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  archived: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

export default function AdminEventList() {
  const [events, setEvents] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    api
      .get("/agencies", { page: 1, per_page: 50 })
      .then((res) => setAgencies(res.data?.items || []))
      .catch(() => setAgencies([]));
  }, []);

  const fetchEvents = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (cityFilter.trim()) params.city = cityFilter.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.event_type = typeFilter;
      if (agencyFilter !== "all") params.agency_id = agencyFilter;

      const res = await api.get("/events", params);
      setEvents(res.data?.items || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotalItems(res.data?.total_items ?? (res.data?.items || []).length);
    } catch (err) {
      setError(err.message || "Gagal memuat daftar event.");
    } finally {
      setLoading(false);
    }
  }, [page, search, cityFilter, statusFilter, typeFilter, agencyFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchEvents();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchEvents]);

  const handleStatusChange = async (eventId, newStatus) => {
    if (newStatus === "draft") {
      setActionMessage({
        type: "error",
        text: "Endpoint PATCH /api/events/<id>/status hanya mengizinkan transisi ke published, on_sale, sales_closed, ongoing, finished, atau archived.",
      });
      return;
    }
    setActionMessage(null);
    try {
      await api.patch(`/events/${eventId}/status`, { status: newStatus });
      setActionMessage({
        type: "success",
        text: `Status event #${eventId} berhasil diubah menjadi "${newStatus}".`,
      });
      await fetchEvents();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.message || "Gagal mengubah status event.",
      });
    }
  };

  const handleDeleteEvent = async (ev) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus event "${ev.name}"? (Catatan: Event tidak dapat dihapus jika sudah ada tiket yang terjual).`
    );
    if (!confirmed) return;

    setActionMessage(null);
    try {
      await api.delete(`/events/${ev.id}`);
      setActionMessage({
        type: "success",
        text: `Event "${ev.name}" berhasil dihapus.`,
      });
      await fetchEvents();
    } catch (err) {
      setActionMessage({
        type: "error",
        text:
          err.message ||
          "Gagal menghapus event. Event yang sudah memiliki penjualan tiket tidak dapat dihapus (HTTP 409).",
      });
    }
  };

  const agencyMap = new Map(agencies.map((a) => [a.id, a.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
            Manajemen Katalog &amp; Lifecycle
          </span>
          <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
            Event Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola seluruh event, ubah status penjualan (<code className="font-mono">PATCH /api/events/&lt;id&gt;/status</code>), dan atur fase harga tiket. Total: {totalItems} event.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchEvents}
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            title="Muat ulang"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/event/create"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3 font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105"
          >
            <Plus size={19} />
            Buat Event Baru
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            actionMessage.type === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
          }`}
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama event..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="relative">
          <MapPin
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Filter kota..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="all">Semua Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              Status: {s.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="all">Semua Tipe Event</option>
          <option value="single">Single Event / Konser</option>
          <option value="festival">Festival Multi-Hari</option>
        </select>

        <select
          value={agencyFilter}
          onChange={(e) => {
            setAgencyFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="all">Semua Agency</option>
          {agencies.map((ag) => (
            <option key={ag.id} value={ag.id}>
              {ag.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Jadwal &amp; Kota</th>
                <th className="px-6 py-4">Agency</th>
                <th className="px-6 py-4">Status (Ubah Cepat)</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Memuat daftar event...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada event yang cocok dengan filter ini.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 dark:text-white">
                        {event.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {event.artist_name ||
                          (event.event_type === "festival"
                            ? `Festival ${event.days_count || 1} Hari`
                            : `ID #${event.id}`)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          event.event_type === "festival"
                            ? "bg-[#0080f2]/15 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]"
                            : "bg-[#0080f2]/15 text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]"
                        }`}
                      >
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar size={14} className="text-[#0080f2] dark:text-[#0080f2]" />
                        {event.event_date || `Festival ${event.days_count || 1} Hari`}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <MapPin size={14} className="text-[#0080f2] dark:text-[#0080f2]" />
                        {event.venue}, {event.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {agencyMap.get(event.agency_id) || `Agency #${event.agency_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value)}
                        className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold uppercase outline-none ${
                          statusStyle[event.status] || statusStyle.draft
                        }`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option
                            key={st}
                            value={st}
                            disabled={st === "draft" && event.status !== "draft"}
                            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                          >
                            {st.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/event/${event.id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:text-slate-300"
                          title="Detail & Upload Poster/Banner"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/event/${event.id}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:text-slate-300"
                          title="Edit Event"
                        >
                          <Pencil size={15} />
                        </Link>
                        <Link
                          href={`/admin/event/${event.id}/ticket-phase`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:text-slate-300"
                          title="Kelola Fase Tiket"
                        >
                          <Ticket size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-300 text-red-500 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                          title="Hapus Event"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0080f2] hover:bg-[#0070d4] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0080f2]/25 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#0080f2] dark:hover:bg-[#0070d4] dark:hover:text-white"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span className="rounded-xl bg-[#0080f2] px-3.5 py-2 text-sm font-bold text-white">
            Halaman {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0080f2] hover:bg-[#0070d4] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0080f2]/25 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#0080f2] dark:hover:bg-[#0070d4] dark:hover:text-white"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
