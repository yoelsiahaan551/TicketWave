"use client";

import {
  ShieldCheck,
  Ticket,
  CreditCard,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Secure",
    desc: "Semua transaksi dienkripsi dan dilindungi dengan sistem keamanan modern.",
  },
  {
    icon: Ticket,
    title: "Official Ticket",
    desc: "Tiket resmi langsung dari promotor tanpa risiko tiket palsu.",
  },
  {
    icon: CreditCard,
    title: "Easy Payment",
    desc: "Mendukung QRIS, Virtual Account, E-Wallet, dan Kartu Kredit.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Customer service siap membantu kapan pun dibutuhkan.",
  },
];

export default function WhyChoose() {
  return (
    <section className="py-28 bg-slate-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">

          <span className="text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
            WHY US
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Why Choose TicketWave?
          </h2>

          <p className="text-slate-500 mt-2 text-sm max-w-2xl mx-auto">
            Kami menghadirkan pengalaman membeli tiket yang cepat,
            aman, dan nyaman untuk semua jenis event.
          </p>

        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

          {features.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-slate-300 transition duration-200"
              >

                <div
                  className="w-12 h-12 rounded-xl bg-blue-50 text-[#0080f2] flex items-center justify-center"
                >

                  <Icon size={24} />

                </div>

                <h3 className="text-base font-semibold text-slate-900 mt-4">
                  {item.title}
                </h3>

                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                  {item.desc}
                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}