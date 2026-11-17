import Link from "next/link";
import { ArrowRight, Sparkles, Ticket, Clock, ShieldCheck } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="bg-white py-20 transition-colors dark:bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-10 shadow-lg md:px-12 md:py-12">
          {/* Decoration */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 left-1/2 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
                <Sparkles size={14} className="text-[#0080f2]" />
                Fase Harga Otomatis TicketWave
              </div>

              <h2 className="mt-5 max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
                Periksa Harga Tiket dan
                <span className="block text-[#0080f2]">
                  Fase Penjualan Event
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85">
                Penyelenggara dapat mengatur fase harga{" "}
                <strong className="font-semibold text-white">Early Bird</strong>,{" "}
                <strong className="font-semibold text-white">Presale</strong>, dan{" "}
                <strong className="font-semibold text-white">Normal</strong>. Potongan
                harga bergantung pada fase yang tersedia. Periksa harga aktif di
                detail event; tidak semua tiket memiliki diskon.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/user/event"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0080f2] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#0070d4]"
                >
                  Eksplor Event On Sale
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/user/pesanan"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
                >
                  Lacak Kode Booking
                </Link>
              </div>
            </div>

            {/* Phase Info Card */}
            <div className="relative">
              <div className="mx-auto max-w-sm rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0080f2] shadow-xs">
                    <Ticket size={22} />
                  </div>

                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-900">
                    AUTO PRICING
                  </span>
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/90">
                  Skema Fase Tiket Resmi
                </p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-white/10 px-3.5 py-2 text-xs text-white">
                    <span className="flex items-center gap-2 font-medium">
                      <Clock size={14} className="text-white/90" />
                      Early Bird
                    </span>
                    <span className="font-semibold text-white/90">Diskon Fase Awal</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/10 px-3.5 py-2 text-xs text-white">
                    <span className="flex items-center gap-2 font-medium">
                      <Clock size={14} className="text-white/90" />
                      Presale
                    </span>
                    <span className="font-semibold text-white/90">Harga Spesial</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/10 px-3.5 py-2 text-xs text-white">
                    <span className="flex items-center gap-2 font-medium">
                      <ShieldCheck size={14} className="text-white/90" />
                      Normal Phase
                    </span>
                    <span className="font-semibold text-white">Harga Reguler</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/20 pt-3 text-xs text-white/85">
                  Maksimal pembelian <strong className="text-white font-semibold">10 tiket</strong> per transaksi dengan kode QR unik untuk setiap e-ticket.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
