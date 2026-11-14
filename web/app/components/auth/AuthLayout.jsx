"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
  title,
  subtitle,
}) {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-slate-900 antialiased">
      {/* ============================================================
          LEFT PANEL: Full-Height Branding & Illustration Panel
          (Mandatory full-page layout on desktop: 50% / 45% screen width)
          ============================================================ */}
      <aside className="relative hidden lg:flex lg:w-1/2 xl:w-5/12 min-h-screen flex-col justify-between overflow-hidden bg-slate-950 p-10 xl:p-14 text-white shrink-0">
        {/* Background Visual with Subtle Concert Photography */}
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2000"
          alt="TicketWave Concert"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-slate-950/95" />

        {/* Subtle Brand Glow Accents */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-slate-800/20 blur-[120px]" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-slate-800/20 blur-[120px]" />

        {/* Top: Logo & Brand Identity */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 transition hover:opacity-90"
          >
            <Image
              src="/logo/ticketwave.png"
              alt="TicketWave Logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain drop-shadow-md"
              priority
            />
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">
                TicketWave
              </span>
              <span className="block text-xs font-normal text-slate-400">
                Discover Amazing Events
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Value Proposition & Hero Branding */}
        <div className="relative z-10 my-auto py-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-[#0080f2]" />
            #1 Ticket Platform di Indonesia
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Book Amazing Events
          </h1>

          <p className="max-w-md text-sm xl:text-base leading-relaxed text-slate-300">
            Temukan konser musik spektakuler, festival internasional, dan berbagai pertunjukan terbaik dengan reservasi tiket instan, aman, dan terpercaya.
          </p>

          {/* Value Highlights */}
          <div className="pt-4 space-y-3.5 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Tiket resmi 100% langsung dari promotor terverifikasi</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span>Transaksi cepat dan terenkripsi dengan aman</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>E-Ticket langsung terbit dan siap digunakan</span>
            </div>
          </div>
        </div>

        {/* Bottom: Left Panel Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} TicketWave. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">Beranda</Link>
            <Link href="#" className="hover:text-white transition">Bantuan</Link>
            <Link href="#" className="hover:text-white transition">Privasi</Link>
          </div>
        </div>
      </aside>

      {/* ============================================================
          RIGHT PANEL: Full-Height Standalone Authentication Form
          (Solid full-page panel, zero modal/dialog/floating box)
          ============================================================ */}
      <section className="flex-1 flex flex-col justify-between min-h-screen bg-white px-6 sm:px-12 lg:px-16 xl:px-20 py-8 sm:py-12 min-w-0">
        {/* Top Bar on Right Panel */}
        <div className="w-full flex items-center justify-between">
          {/* Mobile Brand Header */}
          <div className="lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo/ticketwave.png"
                alt="TicketWave Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain drop-shadow-sm"
                priority
              />
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  TicketWave
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Back to Home Link */}
          <div className="hidden lg:block ml-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              <span>&larr;</span>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>

        {/* Center: Auth Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-6 sm:py-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Bottom Right Footer */}
        <div className="w-full text-center text-xs text-slate-400 py-2">
          &copy; {new Date().getFullYear()} TicketWave. Platform Tiket Konser &amp; Festival.
        </div>
      </section>
    </main>
  );
}
