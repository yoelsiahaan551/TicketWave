"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Search,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/api";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    await Promise.resolve();
    setUsersLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 15 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "all") params.role = roleFilter;

      const res = await api.get("/users", params);
      if (res && res.success && res.data) {
        setUsers(res.data.items || []);
        setTotalPages(res.data.total_pages || 1);
        setTotalUsersCount(res.data.total_items || 0);
      }
    } catch (err) {
      setError(err.message || "Gagal memuat daftar pengguna.");
    } finally {
      setUsersLoading(false);
    }
  }, [page, search, roleFilter]);

  const fetchAgencyOfficers = async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await api.get("/agencies", { page: 1, per_page: 50 });
      setAgencies(res.data?.items || []);
    } catch {
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers();
      fetchAgencyOfficers();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const officersCount = agencies.filter((a) => a.has_officer_account).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
              Akses &amp; Otorisasi
            </span>
            <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              Mode Simulasi Direktori Akun
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Users &amp; Account Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Kelola seluruh akun pengguna terdaftar, petugas lapangan, dan administrator di database TicketWave.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchUsers();
            fetchAgencyOfficers();
          }}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw size={13} className={usersLoading ? "animate-spin" : ""} />
          Muat Ulang
        </button>
      </div>

      {/* Current Admin Account */}
      {user && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sesi Akun Aktif
          </h2>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0080f2] text-base font-semibold text-white shadow-xs">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium uppercase text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                <Shield size={12} />
                Role: {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global Users Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Daftar Pengguna Global ({totalUsersCount} Pengguna Terdaftar)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data real-time dari endpoint <code className="font-mono text-[10px]">GET /api/users</code>
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, no. telp..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 shadow-xs focus:border-[#0080f2] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-xs focus:border-[#0080f2] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">Semua Role</option>
                <option value="user">User</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs border-b border-red-100 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Table Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nama &amp; Email</th>
                <th className="px-4 py-3">Nomor Telepon</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status Email</th>
                <th className="px-4 py-3">Terdaftar Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat data pengguna dari server...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                      {u.phone || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                          u.role === "admin"
                            ? "border border-purple-200/60 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300"
                            : u.role === "officer"
                            ? "border border-blue-200/60 bg-blue-50 text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                            : "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {u.role}
                        {u.agency ? ` (${u.agency.name})` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.email_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 size={11} />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                          <AlertCircle size={11} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (< md) */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {usersLoading ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Memuat data pengguna...
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                      {u.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                      u.role === "admin"
                        ? "border border-purple-200/60 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300"
                        : u.role === "officer"
                        ? "border border-blue-200/60 bg-blue-50 text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                        : "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Telp: {u.phone || "-"}</span>
                  <span>
                    Status:{" "}
                    {u.email_verified ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Terverifikasi</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Agency Officers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Status PIC &amp; Akun Officer Agency ({officersCount} / {agencies.length} Terhubung)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Keterkaitan akun Officer dengan entitas promotor event
            </p>
          </div>
          <Link
            href="/admin/agency"
            className="text-xs font-medium text-[#0080f2] hover:underline"
          >
            Kelola Agency &rarr;
          </Link>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Nama PIC</th>
                <th className="px-4 py-3">Email &amp; Kontak</th>
                <th className="px-4 py-3">Status Akun Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Memuat data agency...
                  </td>
                </tr>
              ) : agencies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Belum ada agency yang terdaftar.
                  </td>
                </tr>
              ) : (
                agencies.map((ag) => (
                  <tr
                    key={ag.id}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 size={15} className="text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {ag.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {ag.pic_name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      <div>{ag.email}</div>
                      <div>{ag.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {ag.has_officer_account ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 size={12} />
                          Officer Terdaftar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          <AlertCircle size={12} />
                          Belum Ada Akun
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
