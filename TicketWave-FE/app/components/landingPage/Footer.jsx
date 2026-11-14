import Image from "next/image";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid lg:grid-cols-4 gap-12">

          {/* Logo */}

          <div>

            <div className="flex items-center gap-3">

              <Image
                src="/logo/ticketwave.png"
                alt="TicketWave Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />

              <h2 className="text-xl font-bold tracking-tight">
                TicketWave
              </h2>

            </div>

            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Platform pembelian tiket konser, festival,
              olahraga, dan berbagai event terbesar di Indonesia.
            </p>

            <div className="flex gap-2.5 mt-6">
  {[FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn].map(
    (Icon, i) => (
      <button
        key={i}
        aria-label="Social link"
        className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center text-slate-300 hover:text-white"
      >
        <Icon size={16} />
      </button>
    )
  )}
</div>

          </div>

          {/* Company */}

          <div>

            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-200 mb-4">
              Company
            </h3>

            <ul className="space-y-2.5 text-sm text-slate-400">

              <li className="hover:text-white transition cursor-pointer">About Us</li>
              <li className="hover:text-white transition cursor-pointer">Career</li>
              <li className="hover:text-white transition cursor-pointer">Blog</li>
              <li className="hover:text-white transition cursor-pointer">Press</li>

            </ul>

          </div>

          {/* Support */}

          <div>

            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-200 mb-4">
              Support
            </h3>

            <ul className="space-y-2.5 text-sm text-slate-400">

              <li className="hover:text-white transition cursor-pointer">Help Center</li>
              <li className="hover:text-white transition cursor-pointer">Refund Policy</li>
              <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition cursor-pointer">Terms & Conditions</li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-200 mb-4">
              Contact
            </h3>

            <ul className="space-y-2.5 text-sm text-slate-400">

              <li>Jakarta, Indonesia</li>
              <li>support@ticketwave.id</li>
              <li>+62 812 3456 7890</li>

            </ul>

          </div>

        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between text-slate-500">

          <p>
            © 2026 TicketWave. All rights reserved.
          </p>


        </div>

      </div>

    </footer>
  );
}