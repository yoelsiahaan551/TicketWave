"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/app/components/common/ThemeToggle";
import ProfileDropdown from "@/app/components/common/ProfileDropdown";
import { useAuth } from "@/app/context/AuthContext";
import { useIsMounted } from "@/app/context/ThemeContext";
import {
  Ticket,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Home,
  CalendarDays,
  Receipt,
  Heart,
  Shield,
} from "lucide-react";

export default function UserNavbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const mounted = useIsMounted();
  const [isOpen, setIsOpen] = useState(false);

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
    {
      name: "Favorit",
      href: "/user/favorites",
      icon: Heart,
    },
  ];

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
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
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/user/home" className="flex items-center gap-3 group">
          <Image
            src="/logo/ticketwave.png"
            alt="TicketWave Logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
            priority
          />

          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              TicketWave
            </span>
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#0080f2] text-white font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
          <ProfileDropdown role="user" />
        </div>

        {/* Mobile Controls: Theme, Profile, and Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
          <ThemeToggle brandHover />
          <ProfileDropdown role="user" compact />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 md:hidden shadow-lg">
          <nav className="flex flex-col gap-1">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const active = isActive(menu.href);
              return (
                <Link
                  key={menu.name}
                  href={menu.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-slate-200 text-slate-900 font-semibold dark:bg-slate-700 dark:text-white"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  {menu.name}
                </Link>
              );
            })}

            <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

            <div className="px-3.5 py-1.5 mb-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {displayEmail}
              </p>
            </div>

            {mounted && isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Shield size={18} />
                Panel Admin
              </Link>
            )}

            <Link
              href="/user/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <User size={18} />
              Profil Saya
            </Link>

            <Link
              href="/user/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Settings size={18} />
              Pengaturan
            </Link>

            {mounted && isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <LogOut size={18} />
                Keluar
              </button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 py-2 text-center text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white py-2 text-center text-xs font-medium shadow-xs"
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
