"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  ScanLine,
  History,
  LogOut,
  X,
  Shield,
  MapPin,
} from "lucide-react";

export default function OfficerSidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/officer", icon: LayoutDashboard },
    { name: "Event Tugas", href: "/officer/events", icon: Calendar },
    { name: "Scan Tiket", href: "/officer/scan", icon: ScanLine },
    { name: "Riwayat Check-in", href: "/officer/history", icon: History },
  ];

  const isActive = (href) => {
    if (href === "/officer") return pathname === "/officer";
    if (href === "/officer/scan") {
      return (
        pathname === "/officer/scan" ||
        pathname?.startsWith("/officer/scan/") ||
        pathname === "/officer/validation" ||
        pathname?.startsWith("/officer/validation/")
      );
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
  };

  const displayName = user?.name || "Petugas Scanner";
  const displayGate = user?.assigned_gate || "Gate belum dapat diverifikasi";
  const badgeId = user?.badge_id || "—";

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Header: Logo, Identitas Petugas & Badge Role Officer */}
        <div className="border-b border-slate-200/80 p-5 sm:p-6 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <Link
              href="/officer"
              onClick={isMobile ? onClose : undefined}
              className="flex items-center gap-3"
            >
              <Image
                src="/logo/ticketwave.png"
                alt="TicketWave Logo"
                width={38}
                height={38}
                className="h-9 w-9 object-contain drop-shadow-xs"
                priority
              />
              <div>
                <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white leading-snug">
                  TicketWave
                </h1>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Officer Control
                </p>
              </div>
            </Link>

            {isMobile && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition"
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Badge & Profil Petugas Ringkas di Atas Menu */}
          <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[11px] font-medium text-[#0080f2] dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-300">
                <Shield size={12} /> Officer Gate
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {badgeId}
              </span>
            </div>
            <p className="mt-1.5 truncate text-xs font-semibold text-slate-900 dark:text-white">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-slate-400 shrink-0" /> {displayGate}
            </p>
          </div>
        </div>

        {/* Navigasi Utama */}
        <nav className="flex-1 overflow-y-auto p-3.5">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#0080f2] text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={18} className={active ? "text-white" : "text-slate-400 dark:text-slate-500"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Bagian Bawah: Tombol Logout */}
      <div className="border-t border-slate-200/80 p-3.5 dark:border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanen di sebelah kiri) */}
      <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:w-72 lg:flex-col dark:border-slate-800 dark:bg-slate-900 shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Sidebar (Drawer dengan backdrop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-72 flex-col bg-white shadow-xl dark:bg-slate-900 transition-transform">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
