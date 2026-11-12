"use client";

import { Search, SlidersHorizontal, Calendar, RotateCcw } from "lucide-react";

export default function EventFilter({
  search,
  onSearch,
  kategori,
  onKategori,
  daftarKategori = ["Semua", "Single", "Festival"],
  lokasi,
  onLokasi,
  daftarLokasi = ["Semua"],
  urutan,
  onUrutan,
  dateFrom = "",
  onDateFrom,
  dateTo = "",
  onDateTo,
  onReset,
}) {
  const hasActiveFilter =
    Boolean(search) ||
    kategori !== "Semua" ||
    lokasi !== "Semua" ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    urutan !== "terdekat";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 md:p-6">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Cari nama konser, festival, atau kata kunci..."
          className="w-full rounded-2xl border border-slate-300 bg-slate-50/60 py-3.5 pl-12 pr-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:bg-white focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#0080f2] dark:focus:bg-slate-800"
        />
      </div>

      {/* Filters Row */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Kategori (event_type) */}
        <select
          value={kategori}
          onChange={(e) => onKategori(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {daftarKategori.map((k) => (
            <option key={k} value={k}>
              {k === "Semua"
                ? "Semua Tipe Event"
                : k === "Single"
                ? "Single Event / Konser"
                : k === "Festival"
                ? "Festival Multi-Hari"
                : k}
            </option>
          ))}
        </select>

        {/* Lokasi (city) */}
        <select
          value={lokasi}
          onChange={(e) => onLokasi(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {daftarLokasi.map((l) => (
            <option key={l} value={l}>
              {l === "Semua" ? "Semua Kota" : l}
            </option>
          ))}
        </select>

        {/* Dari Tanggal (date_from) */}
        {onDateFrom && (
          <div className="relative flex items-center">
            <Calendar
              size={15}
              className="pointer-events-none absolute left-3.5 text-slate-400"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFrom(e.target.value)}
              title="Dari tanggal"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        )}

        {/* Sampai Tanggal (date_to) */}
        {onDateTo && (
          <div className="relative flex items-center">
            <Calendar
              size={15}
              className="pointer-events-none absolute left-3.5 text-slate-400"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateTo(e.target.value)}
              title="Sampai tanggal"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        )}

        {/* Sorting */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
          <SlidersHorizontal size={16} className="shrink-0 text-slate-500 dark:text-slate-400" />
          <select
            value={urutan}
            onChange={(e) => onUrutan(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none dark:text-slate-200"
          >
            <option value="terdekat">Tanggal Terdekat</option>
            <option value="termurah">Harga Terendah</option>
            <option value="termahal">Harga Tertinggi</option>
            <option value="nama">Nama A-Z</option>
          </select>
        </div>
      </div>

      {hasActiveFilter && onReset && (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0080f2] transition hover:text-[#0080f2] dark:text-[#0080f2]"
          >
            <RotateCcw size={14} />
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
