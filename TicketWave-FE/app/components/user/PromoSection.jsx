import Link from "next/link";
import { ArrowRight, Sparkles, Ticket, Clock, ShieldCheck } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="bg-white py-20 transition-colors dark:bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0080f2] px-8 py-12 shadow-xl md:px-14 md:py-16">
          {/* Decoration */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 left-1/2 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <Sparkles size={16} />
                Fase Harga Otomatis TicketWave
              </div>

              <h2 className="mt-6 max-w-2xl text-3xl font-black leading-tight text-white md:text-5xl">
                Hemat Lebih Banyak di Fase
                <span className="block text-white/90">
                  Early Bird &amp; Presale Resmi
                </span>
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-white/85">
                Setiap kategori tiket di TicketWave mendukung fase harga{" "}
                <strong className="font-bold text-white">Early Bird</strong>,{" "}
                <strong className="font-bold text-white">Presale</strong>, dan{" "}
                <strong className="font-bold text-white">Normal</strong>. Potongan
                harga diterapkan otomatis berdasarkan tanggal aktif fase tanpa perlu
                memasukkan kode voucher manual.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/user/event"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-[#0080f2] transition hover:scale-[1.03] hover:shadow-lg"
                >
                  Eksplor Event On Sale
                  <ArrowRight size={19} />
                </Link>

                <Link
                  href="/user/pesanan"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-4 font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Lacak Kode Booking
                </Link>
              </div>
            </div>

            {/* Phase Info Card */}
            <div className="relative">
              <div className="mx-auto max-w-sm rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0080f2] shadow">
                    <Ticket size={28} />
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#0080f2]">
                    AUTO PRICING
                  </span>
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-white/85">
                  Skema Fase Tiket Resmi
                </p>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                    <span className="flex items-center gap-2 font-semibold">
                      <Clock size={15} className="text-white/90" />
                      Early Bird
                    </span>
                    <span className="font-black text-white/90">Diskon Fase Awal</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                    <span className="flex items-center gap-2 font-semibold">
                      <Clock size={15} className="text-white/90" />
                      Presale
                    </span>
                    <span className="font-black text-white/90">Harga Spesial</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                    <span className="flex items-center gap-2 font-semibold">
                      <ShieldCheck size={15} className="text-white/90" />
                      Normal Phase
                    </span>
                    <span className="font-black text-white">Harga Reguler</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/20 pt-4 text-xs text-white/85">
                  Maksimal pembelian <strong className="text-white">10 tiket</strong> per transaksi dengan kode QR unik untuk setiap e-ticket.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
