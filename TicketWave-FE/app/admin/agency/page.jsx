"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/app/lib/api";

export default function AdminAgencyList() {
  const [agencies, setAgencies] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchAgencies = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/agencies", {
        search: search.trim() || undefined,
        page,
        per_page: 9,
      });
      setAgencies(res.data?.items || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotalItems(res.data?.total_items ?? (res.data?.items || []).length);
    } catch (err) {
      setError(err.message || "Gagal memuat daftar agency.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAgencies();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchAgencies]);

  const handleDeleteAgency = async (agency) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus agency "${agency.name}"? (Catatan: Agency yang sudah memiliki event tidak dapat dihapus).`
    );
    if (!confirmed) return;

    setActionMessage(null);
    try {
      await api.delete(`/agencies/${agency.id}`);
      setActionMessage({
        type: "success",
        text: `Agency "${agency.name}" berhasil dihapus.`,
      });
      await fetchAgencies();
    } catch (err) {
      setActionMessage({
        type: "error",
        text:
          err.message ||
          "Gagal menghapus agency. Pastikan agency tidak memiliki event terkait (HTTP 409).",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
            Manajemen Promotor
          </span>
          <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
            Agency Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola data penyelenggara event (<code className="font-mono">GET / POST / PUT / DELETE /api/agencies</code>). Total: {totalItems} agency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAgencies}
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            title="Muat ulang"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/agency/create"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3 font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105"
          >
            <Plus size={19} />
            Tambah Agency
          </Link>
        </div>
      </div>

      {/* Action Message */}
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

      {/* Search */}
      <div className="relative">
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Cari nama agency Berdasarkan nama..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && agencies.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <div
                key={agency.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {agency.logo_url ? (
                      <img
                        src={agency.logo_url}
                        alt={agency.name}
                        className="h-12 w-12 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0080f2] text-white">
                        <Building2 size={22} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white">
                        {agency.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ID #{agency.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      agency.has_officer_account
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {agency.has_officer_account ? "Has Officer" : "No Officer"}
                  </span>
                </div>

                <div className="mt-5 flex-1 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <User size={15} className="shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
                    <span className="truncate">PIC: {agency.pic_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail size={15} className="shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
                    <span className="truncate">{agency.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
                    <span>{agency.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={15} className="shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
                    <span className="line-clamp-1">
                      {agency.address || "Alamat belum diisi"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={`/admin/agency/${agency.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:text-slate-200"
                  >
                    <Pencil size={15} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteAgency(agency)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    title="Hapus Agency"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
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
        </>
      )}

      {!loading && !error && agencies.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="mt-4 font-bold text-slate-700 dark:text-slate-200">
            Belum ada data agency yang ditemukan
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tambahkan agency terlebih dahulu sebelum membuat event baru.
          </p>
        </div>
      )}
    </div>
  );
}
