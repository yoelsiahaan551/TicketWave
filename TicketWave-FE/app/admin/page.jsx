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

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [totalAgenciesCount, setTotalAgenciesCount] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
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

      // Fetch detail of recent events to compute sold_count from ticket_types
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
      bgClass: "bg-[#0080f2]",
    },
    {
      name: "Event Sedang Dijual (On Sale)",
      value: onSaleCount,
      subtext: "Tampil di katalog publik",
      icon: CheckCircle2,
      bgClass: "bg-emerald-600",
    },
    {
      name: "Total Agency Penyelenggara",
      value: totalAgenciesCount,
      subtext: "Dari GET /api/agencies",
      icon: Building2,
      bgClass: "bg-[#0080f2]",
    },
    {
      name: "Total Tiket Terjual",
      value: totalTicketsSold,
      subtext: "Akumulasi sold_count tiket",
      icon: Ticket,
      bgClass: "bg-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
            Ringkasan Operasional
          </span>
          <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Metrik langsung dari database backend TicketWave tanpa data simulasi.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Muat Ulang Data
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Gagal mengambil data dari server</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bgClass} shadow`}
                >
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Events Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Daftar Event Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan event terbaru beserta status siklus hidup dan penjualan tiketnya
            </p>
          </div>
          <Link
            href="/admin/event"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0080f2] hover:text-[#0080f2] dark:text-[#0080f2]"
          >
            Kelola Semua Event
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3">Nama Event</th>
                <th className="px-4 py-3">Tipe &amp; Kota</th>
                <th className="px-4 py-3">Jadwal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tiket Terjual</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat data event...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Belum ada event yang terdaftar. Klik tombol <strong>Buat Event Baru</strong> di bawah untuk memulai.
                  </td>
                </tr>
              ) : (
                events.slice(0, 8).map((ev) => (
                  <tr
                    key={ev.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                      {ev.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      <span className="capitalize">{ev.event_type}</span> • {ev.city}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {ev.event_date || `Festival ${ev.days_count || 1} Hari`}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          statusBadge[ev.status] || statusBadge.draft
                        }`}
                      >
                        {ev.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                      {ev.sold_count ?? 0} / {ev.total_quota ?? 0}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/event/${ev.id}`}
                        className="font-bold text-[#0080f2] hover:underline dark:text-[#0080f2]"
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/admin/event/create"
          className="group rounded-3xl bg-[#0080f2] p-6 text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <Calendar size={30} />
            <Plus size={22} className="transition group-hover:rotate-90" />
          </div>
          <h3 className="mt-4 text-xl font-black">Buat Event Baru</h3>
          <p className="mt-1 text-sm text-white/85">
            Tambahkan konser single atau festival lengkap dengan kategori tiket &amp; fase harga
          </p>
        </Link>

        <Link
          href="/admin/agency/create"
          className="group rounded-3xl bg-[#0080f2] p-6 text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <Building2 size={30} />
            <Plus size={22} className="transition group-hover:rotate-90" />
          </div>
          <h3 className="mt-4 text-xl font-black">Tambah Agency</h3>
          <p className="mt-1 text-sm text-white/85">
            Daftarkan promotor / agency penyelenggara event beserta logo resminya
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="group rounded-3xl bg-[#0080f2] p-6 text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-[1.02] hover:bg-[#0070d4]"
        >
          <div className="flex items-center justify-between">
            <Users size={30} />
            <ArrowRight size={22} />
          </div>
          <h3 className="mt-4 text-xl font-black">Akun &amp; Officer Agency</h3>
          <p className="mt-1 text-sm text-white/85">
            Tinjau profil administrator dan status akun officer pada setiap agency
          </p>
        </Link>
      </div>
    </div>
  );
}
