"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import UserNavbar from "@/app/components/user/UserNavbar";
import UserFooter from "@/app/components/user/UserFooter";
import UserBottomNav from "@/app/components/user/UserBottomNav";
import { ArrowLeft, Loader2, LogIn, ShieldAlert } from "lucide-react";

export default function UserLayout({ children }) {
  const { user, isAuthenticated, loading, isOfficer } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isOrderDetailPath = /^\/user\/pesanan\/[^/]+/.test(pathname || "");

  useEffect(() => {
    if (loading) return;
    // Jika pengguna login sebagai Officer pada route user umum, arahkan ke portal Officer.
    // Untuk detail pesanan (/user/pesanan/[id]), tampilkan pesan role mismatch eksplisit tanpa redirect diam-diam ke /officer/scan.
    if (
      isAuthenticated &&
      (isOfficer || user?.role === "officer") &&
      !isOrderDetailPath
    ) {
      router.replace("/officer");
    }
  }, [loading, isAuthenticated, isOfficer, user, router, isOrderDetailPath]);

  // Jika teridentifikasi sebagai Officer, sembunyikan tampilan User
  if (isAuthenticated && (isOfficer || user?.role === "officer")) {
    if (isOrderDetailPath) {
      const loginNextHref = `/login?next=${encodeURIComponent(
        pathname || "/user/pesanan"
      )}`;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-950">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldAlert size={24} />
            </div>
            <h1 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Sesi Role Tidak Sesuai
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Halaman detail pesanan dan pembayaran hanya diperuntukkan bagi akun pemilik pesanan (User). Sesi aktif Anda saat ini adalah Officer ({user?.email || "officer"}).
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={loginNextHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0080f2] px-4 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
              >
                <LogIn size={14} />
                Masuk dengan Akun Pemilik Pesanan
              </Link>
              <Link
                href="/officer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={14} />
                Kembali ke Portal Officer
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
        <Loader2 className="h-7 w-7 animate-spin text-[#0080f2]" />
        <p className="mt-3 text-xs font-medium text-slate-400">
          Mengarahkan ke Portal Petugas (Officer)...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <UserNavbar />
      <main className="flex-1 w-full max-w-full min-w-0 pb-16 md:pb-0">{children}</main>
      <UserFooter />
      <UserBottomNav />
    </div>
  );
}
