"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/app/components/common/ThemeToggle";
import ProfileDropdown from "@/app/components/common/ProfileDropdown";
import { useAuth } from "@/app/context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
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
      if (user?.role === 'officer') {
        router.replace("/officer");
      } else {
        router.replace("/user/home");
      }
    }
  }, [loading, isAuthenticated, isAdmin, user, router, pathname]);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Agencies", href: "/admin/agency", icon: Building2 },
    { name: "Events & Phases", href: "/admin/event", icon: Calendar },
    { name: "Users & Officers", href: "/admin/users", icon: Users },
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
        <Loader2 className="h-8 w-8 animate-spin text-slate-800 dark:text-slate-200" />
        <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
          Memverifikasi sesi &amp; hak akses Administrator...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <ShieldAlert size={24} />
          </div>
          <h1 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            Autentikasi Diperlukan (401)
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Halaman khusus Administrator hanya dapat diakses setelah login. Mengarahkan ke halaman login...
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
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
        <div className="max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <ShieldAlert size={24} />
          </div>
          <h1 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            Akses Ditolak — Khusus Admin (403)
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Akun Anda memiliki role <strong className="uppercase">{user.role}</strong>. Fitur pengelolaan hanya diizinkan untuk role <strong>admin</strong>.
          </p>
          <Link
            href="/user/home"
            className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={14} />
            Kembali ke Area User
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden border-r border-slate-200/80 bg-white lg:flex lg:w-64 lg:flex-col dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="border-b border-slate-200/80 p-5 dark:border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/logo/ticketwave.png"
              alt="TicketWave Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                TicketWave
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Admin Control
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3.5">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-[#0080f2] text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={17} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200/80 p-3.5 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <LogOut size={17} />
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
          <aside className="absolute bottom-0 left-0 top-0 flex w-64 flex-col bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200/80 p-5 dark:border-slate-800">
              <Link href="/admin" className="flex items-center gap-2.5">
                <Image
                  src="/logo/ticketwave.png"
                  alt="TicketWave Logo"
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                  priority
                />
                <div>
                  <h1 className="text-base font-bold text-slate-900 dark:text-white">
                    TicketWave
                  </h1>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Admin Panel
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3.5">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-[#0080f2] text-white font-semibold"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon size={17} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-slate-200/80 p-3.5 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <LogOut size={17} />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-3 sm:gap-3.5">
            <ThemeToggle brandHover />
            <ProfileDropdown role="admin" />
          </div>
        </header>

        {/* Auth Role Banner if not admin */}
        {!loading && (!isAuthenticated || !isAdmin) && (
          <div className="border-b border-slate-200 bg-slate-100 px-4 py-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldAlert size={14} className="shrink-0" />
                Seluruh endpoint Admin diwajibkan oleh backend menggunakan JWT role <code className="font-mono text-[11px] font-semibold">admin</code>.
              </span>
              <Link
                href="/login"
                className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Login sebagai Admin
              </Link>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 w-full max-w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="w-full max-w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
