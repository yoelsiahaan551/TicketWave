"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getScanHistoryWithMeta } from "@/app/lib/officerService";
import {
  Search,
  Filter,
  CheckCircle2,
  ScanLine,
  Clock,
  RefreshCw,
  Ticket,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
} from "lucide-react";

export default function OfficerHistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gateFilter, setGateFilter] = useState("all");

  // Local Pagination states
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Ambil data asli dari Backend sekali saat mount atau saat tombol Segarkan ditekan
  const refreshData = async () => {
    setCurrentPage(1);
    setLoading(true);
    setError(null);
    try {
      const res = await getScanHistoryWithMeta();
      if (res && res.success) {
        setHistoryList(Array.isArray(res.data) ? res.data : []);
      } else {
        setHistoryList([]);
        setError(res?.error || "Gagal memuat log riwayat dari server.");
      }
    } catch (err) {
      setHistoryList([]);
      setError(err?.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await getScanHistoryWithMeta();
        if (!ignore) {
          if (res && res.success) {
            setHistoryList(Array.isArray(res.data) ? res.data : []);
          } else {
            setHistoryList([]);
        setError(res?.error || "Gagal memuat log riwayat dari server.");
          }
        }
      } catch (err) {
        if (!ignore) {
          setHistoryList([]);
      setError(err?.message || "Terjadi kesalahan saat memuat data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Handler pergantian filter dengan reset halaman lokal ke 1
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleGateChange = (e) => {
    setGateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setGateFilter("all");
    setCurrentPage(1);
  };

  // Nilai Gate aktual yang benar-benar ada pada data Backend
  const availableGates = useMemo(() => {
    const set = new Set();
    historyList.forEach((item) => {
      if (item.gate && item.gate.trim()) set.add(item.gate.trim());
    });
    return Array.from(set).sort();
  }, [historyList]);

  // Nilai Status aktual yang benar-benar ada pada data Backend
  const availableStatuses = useMemo(() => {
    const set = new Set();
    historyList.forEach((item) => {
      if (item.status && item.status.trim()) set.add(item.status.trim());
    });
    return Array.from(set).sort();
  }, [historyList]);

  // Filter data secara lokal atas data asli Backend
  const filteredList = useMemo(() => {
    return historyList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.ticket_code?.toLowerCase().includes(q) ||
        item.attendee_name?.toLowerCase().includes(q) ||
        item.booking_code?.toLowerCase().includes(q) ||
        item.ticket_type?.toLowerCase().includes(q) ||
        item.event_name?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchGate =
        gateFilter === "all" || item.gate === gateFilter;

      return matchQuery && matchStatus && matchGate;
    });
  }, [historyList, searchQuery, statusFilter, gateFilter]);

  // Statistik dihitung secara jujur dari data aktual yang diterima dari server
  const countValid = historyList.filter(
    (h) => h.status === "VALID" || h.result === "success"
  ).length;

  const statBoxes = [
    {
      name: "Total Log Server",
      value: historyList.length,
      subtext: "Maksimal 50 check-in terbaru",
    },
    {
      name: "Berhasil Check-in",
      value: countValid,
      subtext: "Tiket terverifikasi valid",
    },
    {
      name: "Gate Terdata",
      value: "—",
      subtext: "Data gate belum dapat diverifikasi",
    },
    {
      name: "Hasil Saring",
      value: filteredList.length,
      subtext: "Sesuai kata kunci & filter",
    },
  ];

  // Pagination lokal atas array data yang diterima
  const totalFiltered = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalFiltered);
  const paginatedList = useMemo(() => {
    return filteredList.slice(startIndex, endIndex);
  }, [filteredList, startIndex, endIndex]);

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Riwayat Validasi Gate
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
            Maksimal 50 check-in berhasil terbaru dari seluruh event dan petugas. Riwayat penolakan tidak tersedia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
          <Link
            href="/officer/scan"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0080f2] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
          >
            <ScanLine size={14} />
            <span>Scan Baru</span>
          </Link>
        </div>
      </div>

      {/* Informasi Jujur Keterbatasan Endpoint Backend */}
      <div className="flex items-center gap-2.5 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
        <Info size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
        <span>
          Menampilkan maksimal 50 check-in terbaru seluruh event dan petugas (data diterima: {loading || error ? "—" : historyList.length}). Gate dan catatan check-in belum tersedia sebagai data terverifikasi.
        </span>
      </div>

      {/* 4 Stat Boxes Berdasarkan Data Aktual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {statBoxes.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
              {stat.name}
            </span>
            <span className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white block tracking-tight">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
              ) : (
                error ? "—" : stat.value
              )}
            </span>
            <span className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 block truncate font-normal">
              {stat.subtext}
            </span>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Cari kode tiket, nama penonton, booking code..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0080f2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Filter Dropdowns - Hanya Menampilkan Nilai Aktual dari Backend */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 hidden sm:block shrink-0" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              aria-label="Filter Status"
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-normal text-slate-700 focus:border-[#0080f2] focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2]"
            >
              <option value="all">Semua Status ({loading || error ? "—" : historyList.length})</option>
              {availableStatuses.map((st) => (
                <option key={st} value={st}>
                  {st} {st === "VALID" ? "(Berhasil)" : ""}
                </option>
              ))}
            </select>

            <select
              value={gateFilter}
              disabled
              onChange={handleGateChange}
              aria-label="Filter Gate"
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-normal text-slate-700 focus:border-[#0080f2] focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2]"
            >
              <option value="all">Filter gate belum tersedia</option>
              {availableGates.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Badges Active */}
        {(searchQuery || statusFilter !== "all" || gateFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 text-xs border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
            <span className="text-slate-400 font-normal">Filter Aktif:</span>
            {searchQuery && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                Pencarian: &quot;{searchQuery}&quot;
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                Status: {statusFilter}
              </span>
            )}
            {gateFilter !== "all" && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                Gate: {gateFilter}
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#0080f2] hover:text-[#0070d4] hover:underline ml-auto font-medium transition"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Tabel Data Riwayat */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <RefreshCw size={18} className="animate-spin text-[#0080f2]" />
              <span>Memuat data riwayat dari server...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 dark:bg-red-950/40">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {error}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pastikan sesi login petugas masih berlaku dan koneksi backend terhubung.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0080f2] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
            >
              <RefreshCw size={13} />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Tidak ada log yang sesuai
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Coba sesuaikan kata kunci pencarian atau reset filter.
            </p>
            {(searchQuery || statusFilter !== "all" || gateFilter !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                    <th className="px-5 py-3">Waktu &amp; Gate</th>
                    <th className="px-5 py-3">Kode Tiket</th>
                    <th className="px-5 py-3">Penonton</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Petugas &amp; Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedList.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "-"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block font-normal">
                          Gate belum terverifikasi
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                          {item.ticket_code}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-normal">
                          Book: {item.booking_code}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                        {item.attendee_name || "Pemegang Tiket"}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 font-normal">
                          <Ticket size={13} className="text-slate-400" />
                          {item.ticket_type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2
                            size={12}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate font-normal">
                        <span className="font-medium text-slate-700 dark:text-slate-300 block">
                          {item.officer_name || "Petugas Gate"}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Catatan belum tersedia
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800/80">
              {paginatedList.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                      {item.ticket_code}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.attendee_name || "Pemegang Tiket"}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-normal">
                    <span>
                      {item.ticket_type} &bull; Gate belum terverifikasi
                    </span>
                    <span className="font-mono text-[11px]">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Bar (Lokal) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-xs">
              <div className="flex items-center gap-4">
                {/* Total Info */}
                <div className="text-slate-600 dark:text-slate-400">
                  {totalFiltered > 0 ? (
                    <>
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {startIndex + 1}
                      </span>
                      -
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {endIndex}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {totalFiltered}
                      </span>{" "}
                      log (Lokal)
                    </>
                  ) : (
                    <span>0 data</span>
                  )}
                </div>

                {/* Per Page Selector */}
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Per baris:</span>
                  <select
                    value={perPage}
                    onChange={handlePerPageChange}
                    aria-label="Jumlah baris per halaman"
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 focus:border-[#0080f2] focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1 || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (
                      p === 1 ||
                      p === totalPages ||
                      (p >= safeCurrentPage - 1 && p <= safeCurrentPage + 1)
                    ) {
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`h-7 min-w-7 rounded-lg px-2 text-xs font-medium transition ${
                            p === safeCurrentPage
                              ? "bg-[#0080f2] text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    } else if (
                      p === safeCurrentPage - 2 ||
                      p === safeCurrentPage + 2
                    ) {
                      return (
                        <span key={p} className="px-1 text-slate-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  aria-label="Halaman Berikutnya"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
