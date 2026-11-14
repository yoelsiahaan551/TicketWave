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

        <div className="text-center mb-12">

          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            TESTIMONIAL
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            What People Say
          </h2>

          <p className="text-slate-400 mt-2 text-sm max-w-2xl mx-auto">
            Ribuan pengguna telah menggunakan TicketWave untuk membeli tiket
            konser, festival, olahraga, dan berbagai event lainnya.
          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {testimonials.map((item) => (

            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition"
            >

              <div className="flex gap-1 mb-4">

                {[1,2,3,4,5].map((star)=>(
                  <Star
                    key={star}
                    size={15}
                    className="fill-slate-400 text-slate-400"
                  />
                ))}

              </div>

              <p className="text-slate-300 text-sm leading-relaxed italic">
                &ldquo;{item.review}&rdquo;
              </p>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/80">

                <img
                  src={item.image}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  alt={item.name}
                />

                <div>

                  <h3 className="text-white font-medium text-sm">
                    {item.name}
                  </h3>

                  <p className="text-slate-400 text-xs">
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