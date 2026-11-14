import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";

// ============================================================
// USER FOOTER — component khusus User
// Footer untuk halaman User. Mengambil gaya visual footer landing
// (bg gelap, ikon sosial) tapi linknya mengarah ke area User.
// Landing page tetap memakai Footer (landingPage) miliknya.
// ============================================================

export default function UserFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Logo + Deskripsi */}
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo/ticketwave.png"
                alt="TicketWave Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <h2 className="text-xl font-bold tracking-tight">TicketWave</h2>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Platform pembelian tiket konser, festival, olahraga,
              dan berbagai event terbesar di Indonesia.
            </p>

            <div className="mt-5 flex gap-2">
              {[FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn].map(
                (Icon, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label="Social Link"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    <Icon size={14} />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Navigasi User */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-200">Menu</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/user/home" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/user/event" className="transition hover:text-white">
                  Event
                </Link>
              </li>
              <li>
                <Link href="/user/ticket" className="transition hover:text-white">
                  Tiket Saya
                </Link>
              </li>
              <li>
                <Link href="/user/pesanan" className="transition hover:text-white">
                  Pesanan Saya
                </Link>
              </li>
              <li>
                <Link href="/" className="transition hover:text-white">
                  Halaman Utama
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-200">Kontak</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-slate-400" />
                Jakarta, Indonesia
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-slate-400" />
                support@ticketwave.id
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-slate-400" />
                +62 812 3456 7890
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between border-t border-slate-800 pt-6 text-xs text-slate-500 md:flex-row">
          <p>© 2026 TicketWave. All rights reserved.</p>
          <p>Semua transaksi aman dan terenkripsi.</p>
        </div>
      </div>
    </footer>
  );
}
