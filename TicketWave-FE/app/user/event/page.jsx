"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/app/components/user/EventCard";
import EventFilter from "@/app/components/user/EventFilter";
import EmptyState from "@/app/components/user/EmptyState";
import { SearchX, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import api from "@/app/lib/api";

function EventListContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";
  // Parameter dari search box Landing Page (Hero) / tombol "View All"
  const initialCity = searchParams.get("city") || "Semua";
  const initialDateFrom = searchParams.get("date_from") || "";

  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState(
    initialCity !== "Semua" ? ["Semua", initialCity] : ["Semua"]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(initialQuery);
  const [kategori, setKategori] = useState("Semua");
  const [lokasi, setLokasi] = useState(initialCity);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState("");
  const [urutan, setUrutan] = useState("terdekat");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const KATEGORI_EVENT = ["Semua", "Single", "Festival"];

  useEffect(() => {
    let ignore = false;
    api
      .get("/public/events/cities")
      .then((response) => {
        if (!ignore && response.data?.cities) {
          setCities(["Semua", ...response.data.cities]);
        }
      })
      .catch(() => {
        if (!ignore) setCities(["Semua"]);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const fetchEvents = async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    const params = {
      page,
      per_page: 12,
    };

    if (search.trim()) params.search = search.trim();
    if (kategori !== "Semua") params.event_type = kategori.toLowerCase();
    if (lokasi !== "Semua") params.city = lokasi;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    try {
      const response = await api.get("/public/events", params);
      let items = response.data?.items || [];

      items = [...items].sort((a, b) => {
        if (urutan === "terdekat") {
          return new Date(a.event_date || 0) - new Date(b.event_date || 0);
        }
        if (urutan === "termurah") {
          return (a.price_from || 0) - (b.price_from || 0);
        }
        if (urutan === "termahal") {
          return (b.price_from || 0) - (a.price_from || 0);
        }
        if (urutan === "nama") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });

      setEvents(items);
      setTotalPages(response.data?.total_pages || 1);
      setTotalItems(response.data?.total_items ?? items.length);
    } catch (err) {
      setError(err.message || "Gagal memuat katalog event.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchEvents();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, kategori, lokasi, dateFrom, dateTo, urutan, page]);

  const handleResetFilters = () => {
    setSearch("");
    setKategori("Semua");
    setLokasi("Semua");
    setDateFrom("");
    setDateTo("");
    setUrutan("terdekat");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 transition-colors">
      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
          Katalog Resmi TicketWave
        </span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Jelajahi Semua Event
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Temukan konser tunggal maupun festival multi-hari yang sedang berstatus{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">On Sale</span>.
          Saring berdasarkan tipe event, kota penyelenggaraan, atau rentang tanggal.
        </p>
      </div>

      {/* Filter */}
      <EventFilter
        search={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        kategori={kategori}
        onKategori={(val) => {
          setKategori(val);
          setPage(1);
        }}
        daftarKategori={KATEGORI_EVENT}
        lokasi={lokasi}
        onLokasi={(val) => {
          setLokasi(val);
          setPage(1);
        }}
        daftarLokasi={cities}
        dateFrom={dateFrom}
        onDateFrom={(val) => {
          setDateFrom(val);
          setPage(1);
        }}
        dateTo={dateTo}
        onDateTo={(val) => {
          setDateTo(val);
          setPage(1);
        }}
        urutan={urutan}
        onUrutan={setUrutan}
        onReset={handleResetFilters}
      />

      {/* Info jumlah hasil */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {loading ? "Memuat event..." : `Menampilkan ${events.length} dari ${totalItems} event aktif`}
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-52 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2.5 h-3.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-5 h-9 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-6 rounded-xl border border-slate-300 bg-slate-100 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Gagal memuat katalog event
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{error}</p>
          <button
            type="button"
            onClick={fetchEvents}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Grid hasil */}
      {!loading && !error && events.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={SearchX}
            judul="Event tidak ditemukan"
            deskripsi="Tidak ada event aktif (on_sale) yang cocok dengan pencarian atau filter Anda. Coba ubah kata kunci atau reset filter."
          />
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <ChevronLeft size={15} />
                Sebelumnya
              </button>

              <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                Halaman {page} dari {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Berikutnya
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EventListPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-12 text-center text-slate-500">
          Memuat katalog event...
        </div>
      }
    >
      <EventListContent />
    </Suspense>
  );
}
