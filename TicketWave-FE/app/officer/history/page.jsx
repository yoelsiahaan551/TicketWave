"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getOfficerHistory } from "@/app/lib/officerService";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ban,
  ScanLine,
  Clock,
  RefreshCw,
  Ticket,
} from "lucide-react";

export default function OfficerHistoryPage() {
  const [historyList, setHistoryList] = useState(() => getOfficerHistory());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gateFilter, setGateFilter] = useState("all");

  const refreshData = () => {
    const list = getOfficerHistory();
    setHistoryList(list);
  };

  const filteredList = useMemo(() => {
    return historyList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.ticket_code?.toLowerCase().includes(q) ||
        item.attendee_name?.toLowerCase().includes(q) ||
        item.booking_code?.toLowerCase().includes(q) ||
        item.ticket_type?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        item.status === statusFilter ||
        (statusFilter === "VALID" && item.result === "success");

      const matchGate =
        gateFilter === "all" ||
        (item.gate && item.gate.toLowerCase().includes(gateFilter.toLowerCase()));

      return matchQuery && matchStatus && matchGate;
    });
  }, [historyList, searchQuery, statusFilter, gateFilter]);

  const countValid = historyList.filter(
    (h) => h.status === "VALID" || h.result === "success"
  ).length;
  const countUsed = historyList.filter((h) => h.status === "SUDAH DIGUNAKAN").length;
  const countCancelled = historyList.filter((h) => h.status === "DIBATALKAN").length;
  const countInvalid = historyList.filter((h) => h.status === "TIDAK VALID").length;

  const statBoxes = [
    {
      name: "Total Log Diperiksa",
      value: historyList.length,
      subtext: "Semua status pemeriksaan",
    },
    {
      name: "Berhasil Check-in",
      value: countValid,
      subtext: "Tiket sah & pengunjung masuk",
    },
    {
      name: "Sudah Digunakan",
      value: countUsed,
      subtext: "Peringatan duplikasi tiket",
    },
    {
      name: "Dibatalkan / Tidak Valid",
      value: countCancelled + countInvalid,
      subtext: "Refund atau tidak terdaftar",
    },
  ];

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Riwayat Validasi Gate
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
            Daftar audit log seluruh pemeriksaan tiket yang tercatat di gate masuk konser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={13} />
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

      {/* 4 Stat Boxes Konsisten */}
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
              {stat.value}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket, nama penonton, booking code..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0080f2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 hidden sm:block shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-normal text-slate-700 focus:border-[#0080f2] focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2]"
            >
              <option value="all">Semua Status</option>
              <option value="VALID">VALID (Berhasil)</option>
              <option value="SUDAH DIGUNAKAN">SUDAH DIGUNAKAN</option>
              <option value="DIBATALKAN">DIBATALKAN</option>
              <option value="TIDAK VALID">TIDAK VALID</option>
            </select>

            <select
              value={gateFilter}
              onChange={(e) => setGateFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-normal text-slate-700 focus:border-[#0080f2] focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2]"
            >
              <option value="all">Semua Gate</option>
              <option value="Gate A">Gate A (VIP)</option>
              <option value="Gate B">Gate B (Regular)</option>
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
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setGateFilter("all");
              }}
              className="text-xs text-[#0080f2] hover:text-[#0070d4] hover:underline ml-auto font-medium transition"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Tabel Data Riwayat */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="font-medium text-slate-700 dark:text-slate-300">Tidak ada log yang sesuai</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Coba sesuaikan kata kunci pencarian atau reset filter.
            </p>
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
                    <th className="px-5 py-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredList.map((item) => {
                    const isValid = item.status === "VALID" || item.result === "success";
                    const isUsed = item.status === "SUDAH DIGUNAKAN";
                    const isCancelled = item.status === "DIBATALKAN";

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400" />
                            {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block font-normal">
                            {item.gate}
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
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                              isValid
                                ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : isUsed
                                ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                                : isCancelled
                                ? "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                                : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                            }`}
                          >
                            {isValid && <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />}
                            {isUsed && <AlertTriangle size={12} className="text-amber-600 dark:text-amber-400" />}
                            {isCancelled && <Ban size={12} className="text-slate-500 dark:text-slate-400" />}
                            {!isValid && !isUsed && !isCancelled && <XCircle size={12} className="text-red-600 dark:text-red-400" />}
                            <span>{item.status}</span>
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate font-normal">
                          {item.note || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800/80">
              {filteredList.map((item) => {
                const isValid = item.status === "VALID" || item.result === "success";
                const isUsed = item.status === "SUDAH DIGUNAKAN";
                const isCancelled = item.status === "DIBATALKAN";

                return (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                        {item.ticket_code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                          isValid
                            ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : isUsed
                            ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                            : isCancelled
                            ? "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                            : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.attendee_name || "Pemegang Tiket"}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-normal">
                      <span>{item.ticket_type} &bull; {item.gate}</span>
                      <span className="font-mono text-[11px]">
                        {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
