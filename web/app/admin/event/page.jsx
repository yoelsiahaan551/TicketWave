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
  draft: "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
  published: "border border-blue-200/60 bg-blue-50 text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
  on_sale:
    "border border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  sales_closed:
    "border border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  ongoing: "border border-blue-200/60 bg-blue-50 text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
  finished:
    "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
  archived: "border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400",
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
        text: `Status event #${eventId} berhasil diubah menjadi "${newStatus}"${
          newStatus === "on_sale"
            ? " (Aktif & langsung tampil di katalog publik User)"
            : ""
        }.`,
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
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
            Manajemen Katalog &amp; Lifecycle
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Event Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Kelola seluruh event, ubah status penjualan, dan atur fase harga tiket. Total: {totalItems} event.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEvents}
            className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-600 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Muat ulang"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/event/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
          >
            <Plus size={16} />
            Buat Event Baru
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-300 bg-slate-100 p-3.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <AlertCircle size={15} className="shrink-0 text-slate-500 dark:text-slate-400" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama event..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#0080f2]"
          />
        </div>

        <div className="relative">
          <MapPin
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Filter kota..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#0080f2]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-[#0080f2]"
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
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-[#0080f2]"
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
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-slate-400 dark:focus:ring-slate-400"
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
        <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 text-center text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {error}
        </div>
      )}

      {/* Table & Mobile Card View */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Jadwal &amp; Kota</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat daftar event...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Tidak ada event yang cocok dengan filter ini.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event.id}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {event.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {event.artist_name ||
                          (event.event_type === "festival"
                            ? `Festival ${event.days_count || 1} Hari`
                            : `ID #${event.id}`)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar size={13} className="text-slate-400" />
                        {event.event_date || `Festival ${event.days_count || 1} Hari`}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin size={12} />
                        {event.venue}, {event.city}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {agencyMap.get(event.agency_id) || `Agency #${event.agency_id}`}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value)}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-medium uppercase outline-none ${
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
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/event/${event.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                          title="Detail & Upload Poster/Banner"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/admin/event/${event.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                          title="Edit Event"
                        >
                          <Pencil size={14} />
                        </Link>
                        <Link
                          href={`/admin/event/${event.id}/ticket-phase`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                          title="Kelola Fase Tiket"
                        >
                          <Ticket size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                          title="Hapus Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (< md) */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Memuat daftar event...
            </div>
          ) : events.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Tidak ada event yang cocok dengan filter ini.
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {event.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {event.artist_name ||
                        (event.event_type === "festival"
                          ? `Festival ${event.days_count || 1} Hari`
                          : `ID #${event.id}`)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    {event.event_type}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400 shrink-0" />
                    <span>{event.event_date || `Festival ${event.days_count || 1} Hari`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{event.venue}, {event.city}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {agencyMap.get(event.agency_id) || `Agency #${event.agency_id}`}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event.id, e.target.value)}
                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-medium uppercase outline-none ${
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

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/event/${event.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                      title="Detail"
                    >
                      <Eye size={13} />
                    </Link>
                    <Link
                      href={`/admin/event/${event.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </Link>
                    <Link
                      href={`/admin/event/${event.id}/ticket-phase`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                      title="Fase"
                    >
                      <Ticket size={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      title="Hapus"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="rounded-xl bg-[#0080f2] px-3 py-1.5 text-xs font-medium text-white shadow-xs">
            Halaman {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
