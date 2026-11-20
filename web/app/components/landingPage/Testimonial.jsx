"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Michael Jordan",
    job: "Music Enthusiast",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500",
    review:
      "TicketWave membuat proses pembelian tiket menjadi sangat mudah. Saya mendapatkan tiket konser hanya dalam hitungan menit.",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    job: "Content Creator",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500",
    review:
      "Interface sangat modern, pembayaran cepat, dan QR Ticket langsung masuk setelah transaksi selesai.",
  },
  {
    id: 3,
    name: "Kevin Hart",
    job: "Traveler",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500",
    review:
      "Pengalaman terbaik membeli tiket festival. Tidak ada kendala saat masuk venue dan semuanya berjalan lancar.",
  },
];

export default function Testimonial() {
  return (
    <section className="py-28 bg-slate-950">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">

          <span className="uppercase tracking-[4px] text-xs font-semibold text-[#0080f2]">
            TESTIMONIAL
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-3">
            What People Say
          </h2>

          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Ribuan pengguna telah menggunakan TicketWave untuk membeli tiket
            konser, festival, olahraga, dan berbagai event lainnya.
          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {testimonials.map((item) => (

            <div
              key={item.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:-translate-y-2 hover:border-[#0080f2]/60 transition-all duration-300"
            >

              <div className="flex gap-1 mb-6">

                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill="#F59E0B"
                    color="#F59E0B"
                  />
                ))}

              </div>

              <p className="text-slate-300 leading-relaxed text-sm sm:text-base italic">
                &ldquo;{item.review}&rdquo;
              </p>

              <div className="flex items-center gap-4 mt-8 pt-4 border-t border-white/10">

                <img
                  src={item.image}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#0080f2]"
                  alt={item.name}
                />

                <div>

                  <h3 className="text-white font-bold text-base">
                    {item.name}
                  </h3>

                  <p className="text-slate-400 text-xs mt-0.5">
                    {item.job}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}
