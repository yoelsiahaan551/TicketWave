"use client";

import Link from "next/link";
import {
  Ticket,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const ticketTiers = [
  {
    id: "early-bird",
    name: "Early Bird",
    tagline: "Fase Awal Terbaik",
    badge: "KUOTA TERBATAS",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    description:
      "Dapatkan harga terendah untuk tiket konser atau festival pilihanmu saat penjualan baru dibuka.",
    features: [
      "Harga paling hemat fase pembukaan",
      "E-Ticket resmi dengan kode QR unik",
      "Notifikasi instan via email & dashboard",
      "Garansi keaslian 100% dari promotor",
    ],
    highlight: false,
    cta: "Lihat Event Early Bird",
  },
  {
    id: "presale",
    name: "Presale & Reguler",
    tagline: "Pilihan Terpopuler",
    badge: "MOST POPULAR",
    badgeColor: "bg-[#0080f2]/20 text-cyan-400 border-[#0080f2]/30",
    description:
      "Akses standar ke seluruh rangkaian penampilan konser dan festival musik favorit dengan kepastian tiket resmi.",
    features: [
      "Akses penuh ke area pertunjukan konser",
      "QR Code dinamis anti-duplikasi",
      "Dukungan berbagai metode pembayaran",
      "Bantuan pelanggan TicketWave 24/7",
    ],
    highlight: true,
    cta: "Pesan Tiket Sekarang",
  },
  {
    id: "vip",
    name: "VIP Experience",
    tagline: "Pengalaman Eksklusif",
    badge: "VIP ACCESS",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    description:
      "Nikmati penampilan terbaik musisi idola dari baris terdepan dengan kenyamanan fasilitas eksklusif.",
    features: [
      "Fast-track gate masuk tanpa antre",
      "Akses area panggung VIP terdepan",
      "Official merchandise & wristband eksklusif",
      "Akses VIP Lounge & Refreshment area",
    ],
    highlight: false,
    cta: "Eksplor Tiket VIP",
  },
];

export default function TicketSection() {
  return (
    <section className="py-28 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-cyan-400 text-xs font-semibold tracking-wider mb-4">
            <Ticket size={15} />
            TIKET RESMI & TERVERIFIKASI
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Pilihan Kategori Tiket
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0080f2] to-cyan-400">
              Sesuai Pengalaman Impianmu
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Setiap e-tiket TicketWave dilengkapi QR Code unik terenkripsi untuk
            validasi cepat di pintu masuk venue tanpa ribet.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {ticketTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                tier.highlight
                  ? "bg-gradient-to-b from-blue-950/80 to-slate-950 border-2 border-[#0080f2] shadow-2xl shadow-blue-900/30 -translate-y-2"
                  : "bg-slate-950/70 border border-slate-800 hover:border-slate-700 hover:-translate-y-1"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border tracking-wider uppercase ${tier.badgeColor}`}
                  >
                    {tier.badge}
                  </span>
                  {tier.highlight && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300">
                      <Sparkles size={14} /> Pilihan Utama
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {tier.tagline}
                </p>

                <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                  {tier.description}
                </p>

                {/* Features List */}
                <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Keuntungan Tiket:
                  </p>
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          tier.highlight ? "text-cyan-400" : "text-[#0080f2]"
                        }`}
                      />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <Link
                  href="/user/event"
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                    tier.highlight
                      ? "bg-gradient-to-r from-[#0080f2] to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/25 hover:brightness-110"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Feature Badges */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 pt-12 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-950 flex items-center justify-center text-cyan-400 border border-blue-900">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">QR Code Instan</p>
              <p className="text-xs text-slate-400">Langsung muncul setelah bayar</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-950 flex items-center justify-center text-cyan-400 border border-blue-900">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">100% Anti-Calo</p>
              <p className="text-xs text-slate-400">Verifikasi resmi penyelenggara</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-950 flex items-center justify-center text-cyan-400 border border-blue-900">
              <Ticket size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Maks 10 Tiket/Order</p>
              <p className="text-xs text-slate-400">Transparan dan adil untuk fans</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
