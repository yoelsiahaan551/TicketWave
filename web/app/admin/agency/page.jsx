"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
      setTotalItems(null);
      setTotalPages(1);
      setAgencies([]);
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
            Manajemen Promotor
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Agency Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Kelola data penyelenggara event. Total: {loading ? "..." : error ? "—" : totalItems} agency.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAgencies}
            className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-600 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Muat ulang"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/agency/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
          >
            <Plus size={16} />
            Tambah Agency
          </Link>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-300 bg-slate-100 p-3.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <AlertCircle size={15} className="shrink-0 text-slate-500 dark:text-slate-400" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Cari nama agency..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#0080f2] dark:focus:ring-slate-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 text-center text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 animate-pulse rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && agencies.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <div
                key={agency.id}
                className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {agency.logo_url ? (
                      <Image
                        width={40}
                        height={40}
                        unoptimized
                        src={agency.logo_url}
                        alt={agency.name}
                        className="h-10 w-10 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Building2 size={18} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        <Link href={`/admin/agency/${agency.id}`} className="hover:text-[#0080f2] hover:underline">{agency.name}</Link>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ID #{agency.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      agency.has_officer_account
                        ? "border border-blue-200/60 bg-blue-50 text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                        : "border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {agency.has_officer_account ? "Has Officer" : "No Officer"}
                  </span>
                </div>

                <div className="mt-4 flex-1 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">PIC: {agency.pic_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{agency.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-slate-400" />
                    <span>{agency.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="shrink-0 text-slate-400" />
                    <span className="line-clamp-1">
                      {agency.address || "Alamat belum diisi"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link
                    href={`/admin/agency/${agency.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 py-1.5 text-xs font-medium text-slate-700 transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:text-slate-200 dark:hover:border-[#0080f2] dark:hover:text-[#0080f2]"
                  >
                    <Pencil size={13} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteAgency(agency)}
                    className="flex items-center justify-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Hapus Agency"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
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
        </>
      )}

      {!loading && !error && agencies.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <Building2 size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Belum ada data agency yang ditemukan
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Tambahkan agency terlebih dahulu sebelum membuat event baru.
          </p>
        </div>
      )}
    </div>
  );
}
