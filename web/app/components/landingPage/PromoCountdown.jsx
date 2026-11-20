"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TicketPercent, ArrowRight } from "lucide-react";

export default function PromoCountdown() {
  // Target promo
  const targetDate = new Date("2026-12-31T23:59:59").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((distance / 1000) % 60)).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="py-28 bg-slate-950 overflow-hidden relative">

      {/* Subtle Glow */}
      <div className="absolute w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -left-20 top-10"></div>
      <div className="absolute w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full right-0 bottom-0"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}

          <div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/40 border border-blue-900/50 text-[#0080f2] text-xs font-semibold tracking-wider mb-6">

              <TicketPercent size={16} />

              FLASH SALE

            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">

              Save Up To

              <span className="block text-[#0080f2] font-bold">

                50% OFF

              </span>

            </h2>

            <p className="text-slate-300 mt-4 leading-relaxed text-sm">

              Dapatkan potongan harga spesial untuk konser,
              festival, olahraga, dan berbagai event favoritmu.
              Promo hanya berlaku dalam waktu terbatas.

            </p>

            <Link
              href="/user/event"
              className="inline-flex mt-8 px-6 py-3 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white font-medium shadow-xs transition items-center gap-2 text-sm"
            >

              Claim Discount

              <ArrowRight size={16} />

            </Link>

          </div>

          {/* RIGHT */}

          <div className="grid grid-cols-2 gap-4">

            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item) => (

              <div
                key={item.label}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:border-[#0080f2]/50 transition"
              >

                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {item.value}
                </h3>

                <p className="text-slate-300 mt-2 text-xs uppercase tracking-wider font-medium">
                  {item.label}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}
