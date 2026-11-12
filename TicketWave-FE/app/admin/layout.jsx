"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/app/components/common/ThemeToggle";
import { useAuth } from "@/app/context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Ticket,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      const target = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${target}`);
    } else if (!isAdmin) {
      router.replace("/user/home");
    }
  }, [loading, isAuthenticated, isAdmin, user, router, pathname]);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Agencies", href: "/admin/agency", icon: Building2 },
    { name: "Events & Phases", href: "/admin/event", icon: Calendar },
    { name: "Users & Officers", href: "/admin/users", icon: Users },
    { name: "Settings & Health", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href) => {
    if (href === "/admin") return pathname === href;
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Loader2 className="h-9 w-9 animate-spin text-[#0080f2] dark:text-[#0080f2]" />
        <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">
          Memverifikasi sesi &amp; hak akses Administrator...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
            Autentikasi Diperlukan (401)
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Halaman khusus Administrator hanya dapat diakses setelah login. Mengarahkan ke halaman login...
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#0080f2] px-6 py-3 text-sm font-bold text-white shadow"
          >
            Ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-900/50 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
            Akses Ditolak — Khusus Admin (403 Forbidden)
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Akun Anda memiliki role <strong className="uppercase">{user.role}</strong>. Fitur pengelolaan event, agency, pengguna, dan pengaturan sistem hanya diizinkan untuk role <strong>admin</strong>.
          </p>
          <Link
            href="/user/home"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3 text-sm font-bold text-white shadow"
          >
            <ArrowLeft size={16} />
            Kembali ke Area User
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:w-72 lg:flex-col dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0080f2] shadow">
              <Ticket size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                TicketWave
              </h1>
              <p className="text-xs font-semibold text-[#0080f2] dark:text-[#0080f2]">
                Admin Control Center
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    isActive(item.href)
                      ? "bg-[#0080f2] text-white shadow-md shadow-[#0080f2]/20"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="space-y-1 border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut size={19} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-72 flex-col bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0080f2]">
                  <Ticket size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white">
                    TicketWave
                  </h1>
                  <p className="text-xs text-[#0080f2] dark:text-[#0080f2]">
                    Admin Panel
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1.5">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                        isActive(item.href)
                          ? "bg-[#0080f2] text-white"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon size={19} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400"
              >
                <LogOut size={19} />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle brandHover />
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {user?.name || "Tamu (Belum Login)"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email || "Akses memerlukan akun role admin"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0080f2] font-black text-white shadow">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        {/* Auth Role Banner if not admin */}
        {!loading && (!isAuthenticated || !isAdmin) && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-semibold">
                <ShieldAlert size={16} className="shrink-0" />
                Seluruh endpoint Admin (<code className="font-mono">/api/agencies</code>, <code className="font-mono">/api/events</code>, <code className="font-mono">/api/phases</code>) diwajibkan oleh backend menggunakan JWT dengan role <code className="font-mono font-bold">admin</code>.
              </span>
              <Link
                href="/login"
                className="rounded-lg bg-amber-600 px-3 py-1 font-bold text-white hover:bg-amber-700"
              >
                Login sebagai Admin
              </Link>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
