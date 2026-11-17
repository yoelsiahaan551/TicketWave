"use client";

import { Mail, ArrowRight } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="py-28 bg-slate-950 relative overflow-hidden">

      {/* Subtle Background Accent */}
      <div className="absolute -top-40 left-0 w-[450px] h-[450px] rounded-full bg-slate-800/10 blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-slate-800/10 blur-[140px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 sm:p-12 shadow-xl">

          <div className="grid lg:grid-cols-2 gap-8 items-center">

            {/* Left */}

            <div>

              <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
                NEWSLETTER
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3 leading-tight">
                Never Miss
                <span className="block text-[#0080f2]">
                  Amazing Events
                </span>
              </h2>

              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Langganan email belum tersedia. Jelajahi katalog untuk melihat event yang sedang dijual.
              </p>

            </div>

            {/* Right */}

            <div>

              <div className="bg-white rounded-xl flex items-center p-1.5 shadow-md border border-slate-200">

                <Mail
                  className="ml-3 text-slate-400"
                  size={18}
                />

                <input
                  type="email"
                  disabled
                  aria-label="Newsletter belum tersedia"
                  placeholder="Enter your email..."
                  className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />

                <button type="button" disabled className="rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition shadow-xs">

                  Belum tersedia

                  <ArrowRight size={15} />

                </button>

              </div>

              <p className="text-slate-500 mt-3 text-xs">
                Alamat email tidak dikumpulkan melalui bagian ini.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}