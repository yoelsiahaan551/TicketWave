"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { ShieldAlert, Loader2, ArrowLeft, LogOut } from "lucide-react";

export default function OfficerGuard({ children }) {
  const { user, isAuthenticated, isOfficer, isAdmin, isUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      const redirectUrl = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectUrl}`);
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Loader2 className="h-9 w-9 animate-spin text-slate-800 dark:text-slate-200" />
        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Memverifikasi Otorisasi Petugas...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Loader2 className="h-9 w-9 animate-spin text-slate-800 dark:text-slate-200" />
        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Mengarahkan ke halaman login...
        </p>
      </div>
    );
  }

  // Jika terautentikasi tetapi role BUKAN officer
  // Ketentuan: Admin dan User tidak boleh otomatis dianggap sebagai Officer.
  if (!isOfficer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <ShieldAlert size={20} />
          </div>

          <span className="mt-3 inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Akses Ditolak (HTTP 403)
          </span>

          <h1 className="mt-2.5 text-base font-semibold text-slate-900 dark:text-white">
            Otorisasi Petugas Diperlukan
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Portal ini dikhususkan bagi <strong>Petugas Lapangan (Officer)</strong> untuk operasional gate &amp; scanning tiket. Akun Anda saat ini masuk dengan role: <strong className="uppercase text-slate-900 dark:text-white">{isAdmin ? "Admin" : isUser ? "User" : user?.role || "Tidak Dikenal"}</strong>.
          </p>

          <p className="mt-1.5 text-[11px] text-slate-400">
            Sesuai kebijakan keamanan, role Admin dan User tidak memiliki akses operasional gate di modul ini.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition"
              >
                <ArrowLeft size={14} /> Buka Dashboard Administrator
              </Link>
            )}

            {isUser && (
              <Link
                href="/user/home"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition"
              >
                <ArrowLeft size={14} /> Buka Beranda Pengguna
              </Link>
            )}

            <button
              onClick={() => logout()}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <LogOut size={14} /> Keluar &amp; Ganti Akun Petugas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
