"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/app/components/common/ThemeToggle";
import { useAuth } from "@/app/context/AuthContext";
import { useIsMounted } from "@/app/context/ThemeContext";
import {
  Ticket,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  CalendarDays,
  Receipt,
  Shield,
} from "lucide-react";

export default function UserNavbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const mounted = useIsMounted();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menus = [
    {
      name: "Home",
      href: "/user/home",
      icon: Home,
    },
    {
      name: "Event",
      href: "/user/event",
      icon: CalendarDays,
    },
    {
      name: "Tiket Saya",
      href: "/user/ticket",
      icon: Ticket,
    },
    {
      name: "Pesanan Saya",
      href: "/user/pesanan",
      icon: Receipt,
    },
  ];

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setIsOpen(false);
    logout();
  };

  const displayName =
    mounted && isAuthenticated && user?.name ? user.name : "Pengunjung";

  const displayEmail =
    mounted && isAuthenticated && user?.email
      ? user.email
      : "Mode Pemesanan Tamu";

  const initials =
    mounted && isAuthenticated && user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "TW";

  const roleLabel =
    mounted && isAuthenticated && user
      ? user.role === "admin"
        ? "Administrator"
        : user.role === "officer"
        ? "Officer"
        : "Member TicketWave"
      : "Guest Checkout";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/user/home" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0080f2] shadow-lg shadow-[#0080f2]/20 transition-transform duration-300 group-hover:scale-105">
            <Ticket className="text-white" size={22} />
          </div>

          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              TicketWave
            </span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-[#0080f2] dark:text-[#0080f2]">
              Official Ticketing
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = isActive(menu.href);
            return (
              <Link
                key={menu.name}
                href={menu.href}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#0080f2] text-white shadow-md shadow-[#0080f2]/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0080f2] dark:hover:text-[#0080f2]"
                }`}
              >
                <Icon size={16} />
                {menu.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle brandHover />

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-1.5 transition hover:border-[#0080f2] dark:hover:border-[#0080f2]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0080f2] text-sm font-bold text-white shadow-sm">
                {initials}
              </div>

              <div className="hidden text-left lg:block max-w-[140px]">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-500 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-14 z-20 w-64 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {displayEmail}
                    </p>
                  </div>

                  <div className="py-1">
                    {mounted && isAuthenticated && isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#0080f2] dark:text-[#0080f2] transition hover:bg-[#0080f2]/10 dark:hover:bg-slate-800"
                      >
                        <Shield size={17} />
                        Panel Admin
                      </Link>
                    )}

                    <Link
                      href="/user/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User size={17} />
                      Profil Saya
                    </Link>

                    <Link
                      href="/user/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Settings size={17} />
                      Pengaturan
                    </Link>
                  </div>

                  {mounted && isAuthenticated ? (
                    <>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut size={17} />
                        Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <div className="grid grid-cols-2 gap-2 p-2">
                        <Link
                          href="/login"
                          onClick={() => setProfileOpen(false)}
                          className="rounded-xl border border-slate-300 dark:border-slate-700 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setProfileOpen(false)}
                          className="rounded-xl bg-[#0080f2] py-2 text-center text-xs font-bold text-white shadow"
                        >
                          Register
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle brandHover />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5 md:hidden shadow-2xl">
          <nav className="flex flex-col gap-1.5">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const active = isActive(menu.href);
              return (
                <Link
                  key={menu.name}
                  href={menu.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#0080f2] text-white shadow-md"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={19} />
                  {menu.name}
                </Link>
              );
            })}

            <div className="my-3 border-t border-slate-200 dark:border-slate-800" />

            <div className="px-4 py-2 mb-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {displayEmail}
              </p>
            </div>

            {mounted && isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-[#0080f2] dark:text-[#0080f2] hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Shield size={19} />
                Panel Admin
              </Link>
            )}

            <Link
              href="/user/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <User size={19} />
              Profil Saya
            </Link>

            <Link
              href="/user/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Settings size={19} />
              Pengaturan
            </Link>

            {mounted && isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={19} />
                Keluar
              </button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-center text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-[#0080f2] py-3 text-center text-sm font-bold text-white shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
