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
    title: "Katalog Event",
    desc: "Jelajahi event yang sedang membuka penjualan tiket.",
  },
  {
    icon: Ticket,
    title: "Official Ticket",
    desc: "Lihat kategori tiket dan penyelenggara di halaman detail event.",
  },
  {
    icon: CreditCard,
    title: "Harga Tiket",
    desc: "Periksa harga aktif setiap kategori sebelum melanjutkan pemesanan.",
  },
  {
    icon: Headphones,
    title: "Cari Berdasarkan Kota",
    desc: "Saring konser dan festival menurut kota dan tanggal pelaksanaannya.",
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