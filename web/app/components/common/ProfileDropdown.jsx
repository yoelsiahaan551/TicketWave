"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useIsMounted } from "@/app/context/ThemeContext";
import {
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

/**
 * ProfileDropdown Component
 * Menampilkan avatar, nama pengguna, dan chevron di pojok kanan atas.
 * Saat diklik, membuka popover dropdown berisi:
 * - Foto profil & Nama pengguna
 * - Email pengguna
 * - Menu Profil (sesuai role)
 * - Menu Pengaturan (sesuai role)
 * - Divider
 * - Logout / Keluar
 */
export default function ProfileDropdown({
  role = "user",
  profileHref,
  settingsHref,
  compact = false,
  className = "",
}) {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const mounted = useIsMounted();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown saat route berpindah
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Tutup dropdown saat klik di luar (click outside listener)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Tutup dropdown saat menekan tombol Escape (Escape key listener)
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Penentuan identitas & role aktual
  const currentRole = user?.role || role || "user";

  // Penentuan route tujuan Profil & Pengaturan sesuai instruksi:
  // Admin: /admin/settings (karena /admin/settings mengelola tema dan profil admin aktif; /admin/profile tidak tersedia di app)
  // Officer: /officer/profile (mengelola profil dan penugasan gate)
  // User: /user/profile & /user/settings
  const getProfileTarget = () => {
    if (profileHref) return profileHref;
    if (currentRole === "admin") return "/admin/settings";
    if (currentRole === "officer") return "/officer/profile";
    return "/user/profile";
  };

  const getSettingsTarget = () => {
    if (settingsHref) return settingsHref;
    if (currentRole === "admin") return "/admin/settings";
    if (currentRole === "officer") return "/officer/profile";
    return "/user/settings";
  };

  const targetProfile = getProfileTarget();
  const targetSettings = getSettingsTarget();

  // Nama tampilan
  const displayName =
    mounted && user?.name
      ? user.name
      : currentRole === "admin"
      ? "Administrator"
      : currentRole === "officer"
      ? "Petugas Scanner"
      : isAuthenticated
      ? "Pengguna TicketWave"
      : "Tamu";

  // Email tampilan
  const displayEmail =
    mounted && user?.email
      ? user.email
      : currentRole === "admin"
      ? "admin@ticketwave.com"
      : currentRole === "officer"
      ? "officer@ticketwave.com"
      : isAuthenticated
      ? "user@ticketwave.com"
      : "Mode Tamu";

  // Inisial untuk avatar jika tidak ada foto
  const initials =
    mounted && user?.name
      ? user.name
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : currentRole === "admin"
      ? "AD"
      : currentRole === "officer"
      ? "OF"
      : "TW";

  // Label badge role
  const roleLabel =
    currentRole === "admin"
      ? "Administrator"
      : currentRole === "officer"
      ? user?.badge_id
        ? `${user.badge_id} • Officer`
        : "Petugas Lapangan"
      : "Member TicketWave";

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button: [Foto Profil] Nama Pengguna ▼ */}
      <button
        type="button"
        id="profile-dropdown-button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 p-1 sm:px-2.5 sm:py-1.5 text-left shadow-2xs backdrop-blur-xs transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0080f2]/40"
      >
        {/* Foto Profil / Avatar */}
        <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0080f2] text-xs font-semibold text-white shadow-xs ring-2 ring-white dark:ring-slate-900">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Nama Pengguna */}
        <div className={`text-left leading-tight ${compact ? "hidden md:block" : "hidden xs:block"}`}>
          <p className="max-w-[100px] sm:max-w-[140px] truncate text-xs font-semibold text-slate-900 dark:text-white">
            {displayName}
          </p>
          <p className="max-w-[100px] sm:max-w-[140px] truncate text-[10px] text-slate-500 dark:text-slate-400">
            {currentRole === "admin" ? "Admin" : currentRole === "officer" ? "Petugas" : "Member"}
          </p>
        </div>

        {/* Arrow Chevron */}
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-dropdown-button"
          className="absolute right-0 top-full mt-2 w-64 sm:w-72 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl ring-1 ring-slate-900/5 transition-all dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Card: Foto Profil, Nama Pengguna, Email */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50/90 p-3 border border-slate-100 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0080f2] text-sm font-bold text-white shadow-xs ring-2 ring-blue-100 dark:ring-blue-950">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5" title={displayEmail}>
                {displayEmail}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-block rounded-md border border-blue-200/60 bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

          {/* Menu Items */}
          <div className="space-y-0.5">
            {/* Shortcut Panel Admin jika user memiliki hak admin tetapi sedang di modul lain */}
            {mounted && isAuthenticated && isAdmin && currentRole !== "admin" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Shield size={15} className="text-[#0080f2] shrink-0" />
                <span className="flex-1">Panel Admin</span>
              </Link>
            )}

            {/* Menu Profil */}
            <Link
              href={targetProfile}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <UserIcon size={15} className="text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="flex-1">Profil</span>
            </Link>

            {/* Menu Pengaturan */}
            <Link
              href={targetSettings}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <SettingsIcon size={15} className="text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="flex-1">Pengaturan</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

          {/* Logout / Keluar (atau Opsi Login jika tamu) */}
          {mounted && isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            >
              <LogOut size={15} className="shrink-0" />
              <span>Keluar</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-1">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 py-1.5 text-center text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white py-1.5 text-center text-xs font-medium shadow-xs"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
