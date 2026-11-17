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
    urutan !== "date_asc";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          aria-label="Cari event atau artis"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Cari nama konser, festival, atau kata kunci..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:bg-white focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#0080f2]"
        />
      </div>

      {/* Filters Row */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Kategori (event_type) */}
        <select
          value={kategori}
          aria-label="Tipe event"
          onChange={(e) => onKategori(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-[#0080f2]"
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
          aria-label="Kota event"
          onChange={(e) => onLokasi(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-[#0080f2]"
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
              size={14}
              className="pointer-events-none absolute left-3 text-slate-400"
            />
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => onDateFrom(e.target.value)}
              title="Dari tanggal"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-[#0080f2]"
            />
          </div>
        )}

        {/* Sampai Tanggal (date_to) */}
        {onDateTo && (
          <div className="relative flex items-center">
            <Calendar
              size={14}
              className="pointer-events-none absolute left-3 text-slate-400"
            />
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => onDateTo(e.target.value)}
              title="Sampai tanggal"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-[#0080f2]"
            />
          </div>
        )}

        {/* Sorting - Hanya menampilkan opsi yang benar-benar didukung Backend */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <SlidersHorizontal size={14} className="shrink-0 text-slate-500 dark:text-slate-400" />
          <select
            value={urutan}
            onChange={(e) => onUrutan(e.target.value)}
            aria-label="Urutkan Berdasarkan"
            className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-slate-200"
          >
            <option value="date_asc">Tanggal Terdekat (Standar)</option>
          </select>
        </div>
      </div>

      {hasActiveFilter && onReset && (
        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2.5 dark:border-slate-800">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:underline dark:text-slate-400"
          >
            <RotateCcw size={13} />
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
