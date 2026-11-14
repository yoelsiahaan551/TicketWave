"use client";

import { useState } from "react";
import OfficerGuard from "@/app/components/officer/OfficerGuard";
import OfficerSidebar from "@/app/components/officer/OfficerSidebar";
import ThemeToggle from "@/app/components/common/ThemeToggle";
import ProfileDropdown from "@/app/components/common/ProfileDropdown";
import { Menu } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function OfficerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <OfficerGuard>
      <div className="flex h-screen w-full max-w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        {/* Officer Left Sidebar (Desktop permanent & Mobile drawer) */}
        <OfficerSidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full">
          {/* Top Bar Header */}
          <header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8 py-3.5 dark:border-slate-800 dark:bg-slate-900 shrink-0">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800 transition mr-2 shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <Menu size={20} />
            </button>

            {/* Shift & Gate Indicator */}
            <div className="hidden sm:flex items-center gap-2 min-w-0 truncate">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0080f2] shrink-0" />
                <span className="truncate">Shift Aktif: {user?.assigned_gate || "Gate A - VIP"}</span>
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3 sm:gap-4 shrink-0 pr-1">
              <ThemeToggle brandHover />
              <ProfileDropdown role="officer" />
            </div>
          </header>

          {/* Page Content Viewport */}
          <main className="flex-1 w-full max-w-none min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-none min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </OfficerGuard>
  );
}
