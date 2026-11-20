"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, X, ArrowRight, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useIsMounted } from "@/app/context/ThemeContext";

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, isAdmin, isOfficer } = useAuth();
  const mounted = useIsMounted();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/user/event?search=${encodeURIComponent(q)}` : "/user/event");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 30);
    };

    if (window.location.pathname === "/" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("order_id") || params.get("booking_code") || "";
      if (/^TKTW-/i.test(orderId.trim())) {
        router.replace(`/payment/finish${window.location.search}`);
        return undefined;
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  const dashboardHref =
    mounted && isAuthenticated
      ? isAdmin
        ? "/admin"
        : isOfficer
        ? "/officer"
        : "/user/home"
      : null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scroll
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-xl tracking-tight"
        >
          <Image
            src="/logo/ticketwave.png"
            alt="TicketWave Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain drop-shadow-xs"
            priority
          />
          <span
            className={`transition ${
              scroll ? "text-slate-900 dark:text-white" : "text-white"
            }`}
          >
            TicketWave
          </span>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition hover:text-slate-900 dark:hover:text-white ${
              scroll ? "text-slate-700 dark:text-slate-200" : "text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/user/event"
            className={`text-sm font-medium transition hover:text-slate-900 dark:hover:text-white ${
              scroll ? "text-slate-700 dark:text-slate-200" : "text-white"
            }`}
          >
            Event
          </Link>
          <Link
            href="/user/ticket"
            className={`text-sm font-medium transition hover:text-slate-900 dark:hover:text-white ${
              scroll ? "text-slate-700 dark:text-slate-200" : "text-white"
            }`}
          >
            Ticket
          </Link>
          <Link
            href="/user/pesanan"
            className={`text-sm font-medium transition hover:text-slate-900 dark:hover:text-white ${
              scroll ? "text-slate-700 dark:text-slate-200" : "text-white"
            }`}
          >
            Pesanan Saya
          </Link>
        </nav>

        {/* Search Desktop */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
          <Search
            size={16}
            className="absolute left-3.5 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search event"
            placeholder="Search event..."
            className="w-60 h-10 pl-10 pr-4 text-xs rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-[#0080f2] focus:border-[#0080f2] shadow-xs transition dark:text-white"
          />
        </form>

        {/* Button Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white shadow-xs transition"
            >
              <User size={14} />
              <span>{user?.name ? user.name.split(" ")[0] : "Dashboard"}</span>
              <ArrowRight size={13} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
                  scroll
                    ? "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-medium rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white shadow-xs transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`lg:hidden p-2 rounded-xl transition ${
            scroll
              ? "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex flex-col p-6 gap-3.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white transition"
            >
              Home
            </Link>
            <Link
              href="/user/event"
              onClick={() => setOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white transition"
            >
              Event
            </Link>
            <Link
              href="/user/ticket"
              onClick={() => setOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white transition"
            >
              Ticket
            </Link>
            <Link
              href="/user/pesanan"
              onClick={() => setOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white transition"
            >
              Pesanan Saya
            </Link>

            <hr className="border-slate-100 dark:border-slate-800 my-1" />

            {dashboardHref ? (
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 text-center rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white py-2.5 font-medium shadow-xs transition"
              >
                <User size={15} />
                <span>Buka Dashboard ({user?.role?.toUpperCase() || "USER"})</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-center rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="text-center rounded-xl py-2.5 bg-[#0080f2] hover:bg-[#0070d4] text-white font-medium shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
