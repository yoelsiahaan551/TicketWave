"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Ticket, Receipt, User } from "lucide-react";

export default function UserBottomNav() {
  const pathname = usePathname();

  const navItems = [
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
      name: "Tiket",
      href: "/user/ticket",
      icon: Ticket,
    },
    {
      name: "Pesanan",
      href: "/user/pesanan",
      icon: Receipt,
    },
    {
      name: "Profil",
      href: "/user/profile",
      icon: User,
    },
  ];

  const isActive = (href) => {
    if (href === "/user/home") return pathname === "/user/home";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-md shadow-lg transition-colors"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active
                  ? "text-[#0080f2] font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 dark:bg-blue-950/50"
                    : "bg-transparent"
                }`}
              >
                <Icon size={17} className={active ? "text-[#0080f2]" : "text-current"} />
              </div>
              <span className="leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
