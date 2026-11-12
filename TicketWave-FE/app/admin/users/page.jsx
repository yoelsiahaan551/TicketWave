"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/api";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

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
      fetchAgencyOfficers();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const officersCount = agencies.filter((a) => a.has_officer_account).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
            Akses &amp; Otorisasi
          </span>
          <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
            Users &amp; Agency Officers
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Informasi akun administrator aktif (<code className="font-mono">GET /api/auth/me</code>) dan status keterkaitan akun Officer pada setiap Agency (<code className="font-mono">GET /api/agencies</code>).
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAgencyOfficers}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Muat Ulang
        </button>
      </div>

      {/* Backend Limitation Notice */}
      <div className="flex items-start gap-3 rounded-3xl border border-[#0080f2]/30 bg-[#0080f2]/10 p-5 text-xs leading-6 text-slate-700 dark:border-[#0080f2]/50 dark:bg-[#0080f2]/20 dark:text-slate-300">
        <Info size={18} className="mt-0.5 shrink-0 text-[#0080f2] dark:text-[#0080f2]" />
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            Catatan Keterbatasan Endpoint Backend
          </p>
          <p>
            Backend TicketWave saat ini belum menyediakan endpoint daftar seluruh pengguna (<code className="font-mono">GET /api/users</code>) maupun manajemen CRUD user oleh admin. Halaman ini menampilkan <strong>Akun Administrator Aktif</strong> serta <strong>Status Akun Officer per Agency</strong> (<code className="font-mono">has_officer_account</code>) yang benar-benar dikembalikan oleh backend.
          </p>
        </div>
      </div>

      {/* Current Admin Account */}
      {user && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            Akun yang Sedang Login (GET /api/auth/me)
          </h2>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0080f2] text-xl font-black text-white">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-[#0080f2]" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-[#0080f2]" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0080f2]/15 px-3.5 py-1 text-xs font-bold uppercase text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]">
                <Shield size={13} />
                Role: {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Agency Officers Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Status PIC &amp; Akun Officer Agency ({officersCount} / {agencies.length} Aktif)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Berdasarkan relasi <code className="font-mono">Agency.user_id</code> (<code className="font-mono">has_officer_account</code>) dari database backend
            </p>
          </div>
          <Link
            href="/admin/agency"
            className="text-xs font-bold text-[#0080f2] hover:underline dark:text-[#0080f2]"
          >
            Kelola Agency &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Agency</th>
                <th className="px-6 py-4">Nama PIC</th>
                <th className="px-6 py-4">Email &amp; Kontak</th>
                <th className="px-6 py-4">Status Akun Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
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
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Building2
                          size={18}
                          className="text-[#0080f2] dark:text-[#0080f2]"
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ag.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {ag.pic_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                      <div>{ag.email}</div>
                      <div>{ag.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {ag.has_officer_account ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle2 size={13} />
                          Terhubung (Akun Officer Aktif)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <AlertCircle size={13} />
                          Belum Ada Akun Officer
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
