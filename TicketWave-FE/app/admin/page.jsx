"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Building2,
  Users,
  Ticket,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import api from "@/app/lib/api";

const statusBadge = {
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

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [totalAgenciesCount, setTotalAgenciesCount] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      // 1. Ambil metrik resmi dari endpoint GET /api/admin/dashboard
      const dashRes = await api.get("/admin/dashboard", {}, { silent: true });
      if (dashRes && dashRes.success && dashRes.data?.metrics) {
        const m = dashRes.data.metrics;
        setTotalEventsCount(m.total_events || 0);
        setTotalAgenciesCount(m.total_agencies || 0);
        setTotalTicketsSold(m.tickets_sold || 0);
        setTotalRevenue(m.total_revenue || 0);
        setTotalBookingsCount(m.total_bookings || 0);
        setRecentBookings(dashRes.data.recent_bookings || []);

        // Also fetch event list for table
        const eventsRes = await api.get("/events", { page: 1, per_page: 10 });
        setEvents(eventsRes.data?.items || dashRes.data.recent_events || []);
        return;
      }
    } catch {
      // Fallback manual query
    }

    try {
      const [eventsRes, agenciesRes] = await Promise.all([
        api.get("/events", { page: 1, per_page: 20 }),
        api.get("/agencies", { page: 1, per_page: 20 }),
      ]);

      const eventItems = eventsRes.data?.items || [];
      setTotalEventsCount(eventsRes.data?.total_items ?? eventItems.length);
      setTotalAgenciesCount(
        agenciesRes.data?.total_items ?? (agenciesRes.data?.items || []).length
      );

      const detailPromises = eventItems.slice(0, 8).map((ev) =>
        api
          .get(`/events/${ev.id}`)
          .then((r) => r.data)
          .catch(() => ev)
      );
      const detailedList = await Promise.all(detailPromises);
      const detailMap = new Map(detailedList.map((d) => [d.id, d]));

      let soldSum = 0;
      const enrichedEvents = eventItems.map((ev) => {
        const det = detailMap.get(ev.id) || ev;
        const tts = det.ticket_types || [];
        const evSold = tts.reduce((acc, t) => acc + Number(t.sold_count || 0), 0);
        const evQuota = tts.reduce((acc, t) => acc + Number(t.quota || 0), 0);
        soldSum += evSold;
        return {
          ...ev,
          sold_count: evSold,
          total_quota: evQuota,
          ticket_types_count: tts.length,
        };
      });

      setEvents(enrichedEvents);
      setTotalTicketsSold(soldSum);
    } catch (err) {
      setError(
        err.message ||
          "Gagal memuat ringkasan dashboard. Pastikan Anda sudah login menggunakan akun Admin."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchDashboardData]);

  const onSaleCount = events.filter((e) => e.status === "on_sale").length;

  const stats = [
    {
      name: "Total Event Terdaftar",
      value: totalEventsCount,
      subtext: "Dari GET /api/events",
      icon: Calendar,
      iconClass: "text-[#0080f2] bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      name: "Event Sedang Dijual",
      value: onSaleCount,
      subtext: "Tampil di katalog publik",
      icon: CheckCircle2,
      iconClass: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    {
      name: "Total Agency",
      value: totalAgenciesCount,
      subtext: "Dari GET /api/agencies",
      icon: Building2,
      iconClass: "text-[#0080f2] bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      name: "Total Tiket Terjual",
      value: totalTicketsSold,
      subtext: "Akumulasi sold_count tiket",
      icon: Ticket,
      iconClass: "text-[#0080f2] bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
            Ringkasan Operasional
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Metrik langsung dari database backend TicketWave tanpa data simulasi.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Muat Ulang Data
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-300 bg-slate-100 p-4 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
          <div>
            <p className="font-semibold">Gagal mengambil data dari server</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {stat.name}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Events Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daftar Event Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan event terbaru beserta status siklus hidup dan penjualan tiketnya
            </p>
          </div>
          <Link
            href="/admin/event"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#0080f2] hover:underline"
          >
            Kelola Semua Event
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="px-3.5 py-2.5">Nama Event</th>
                <th className="px-3.5 py-2.5">Tipe &amp; Kota</th>
                <th className="px-3.5 py-2.5">Jadwal</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5">Tiket Terjual</th>
                <th className="px-3.5 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Memuat data event...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada event yang terdaftar. Klik tombol <strong>Buat Event Baru</strong> di bawah untuk memulai.
                  </td>
                </tr>
              ) : (
                events.slice(0, 8).map((ev) => (
                  <tr
                    key={ev.id}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-3.5 py-3 font-medium text-slate-900 dark:text-white">
                      {ev.name}
                    </td>
                    <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400">
                      <span className="capitalize">{ev.event_type}</span> • {ev.city}
                    </td>
                    <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400">
                      {ev.event_date || `Festival ${ev.days_count || 1} Hari`}
                    </td>
                    <td className="px-3.5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                          statusBadge[ev.status] || statusBadge.draft
                        }`}
                      >
                        {ev.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-medium text-slate-900 dark:text-white">
                      {ev.sold_count ?? 0} / {ev.total_quota ?? 0}
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <Link
                        href={`/admin/event/${ev.id}`}
                        className="font-medium text-[#0080f2] hover:underline"
                      >
                        Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (< md) */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Memuat data event...
            </div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada event yang terdaftar.
            </div>
          ) : (
            events.slice(0, 8).map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {ev.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="capitalize">{ev.event_type}</span> • {ev.city}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                      statusBadge[ev.status] || statusBadge.draft
                    }`}
                  >
                    {ev.status?.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-[11px] dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">
                    <span>{ev.event_date || `Festival ${ev.days_count || 1} Hari`}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {ev.sold_count ?? 0}/{ev.total_quota ?? 0} Tiket
                    </span>
                  </div>
                  <Link
                    href={`/admin/event/${ev.id}`}
                    className="inline-flex items-center gap-1 font-medium text-[#0080f2] hover:underline"
                  >
                    Detail &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/event/create"
          className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-[#0080f2] hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#0080f2]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-400 group-hover:bg-[#0080f2] group-hover:text-white transition">
              <Calendar size={20} />
            </div>
            <Plus size={18} className="text-slate-400 transition group-hover:text-[#0080f2]" />
          </div>
          <h3 className="mt-3.5 text-sm font-semibold text-slate-900 dark:text-white">Buat Event Baru</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tambahkan konser single atau festival lengkap dengan kategori tiket &amp; fase harga
          </p>
        </Link>

        <Link
          href="/admin/agency/create"
          className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-[#0080f2] hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#0080f2]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-400 group-hover:bg-[#0080f2] group-hover:text-white transition">
              <Building2 size={20} />
            </div>
            <Plus size={18} className="text-slate-400 transition group-hover:text-[#0080f2]" />
          </div>
          <h3 className="mt-3.5 text-sm font-semibold text-slate-900 dark:text-white">Tambah Agency</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Daftarkan promotor / agency penyelenggara event beserta logo resminya
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-[#0080f2] hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#0080f2]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-400 group-hover:bg-[#0080f2] group-hover:text-white transition">
              <Users size={20} />
            </div>
            <ArrowRight size={18} className="text-slate-400 transition group-hover:text-[#0080f2]" />
          </div>
          <h3 className="mt-3.5 text-sm font-semibold text-slate-900 dark:text-white">Akun &amp; Officer</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tinjau profil administrator dan status akun officer pada setiap agency
          </p>
        </Link>
      </div>
    </div>
  );
}
