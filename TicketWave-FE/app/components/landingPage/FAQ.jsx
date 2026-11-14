"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    question: "Bagaimana cara membeli tiket?",
    answer:
      "Pilih event yang diinginkan, tentukan jumlah tiket, lakukan pembayaran, lalu e-ticket akan langsung tersedia pada akun Anda.",
  },
  {
    question: "Apakah tiket dapat direfund?",
    answer:
      "Setiap event memiliki kebijakan refund yang berbeda. Informasi refund dapat dilihat pada halaman detail event.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami mendukung QRIS, Virtual Account, Transfer Bank, E-Wallet, serta Kartu Kredit.",
  },
  {
    question: "Bagaimana jika saya kehilangan e-ticket?",
    answer:
      "Anda dapat membuka kembali menu My Ticket atau menghubungi Customer Support untuk mendapatkan tiket kembali.",
  },
];

export default function FAQ() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-28 bg-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            FAQ
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Frequently Asked Questions
          </h2>

          <p className="text-slate-500 mt-2 text-sm">
            Temukan jawaban dari pertanyaan yang paling sering diajukan.
          </p>

        </div>

        <div className="max-w-3xl mx-auto space-y-3">

          {faqData.map((faq, index) => (

            <div
              key={index}
              className="rounded-xl border border-slate-200/80 overflow-hidden shadow-xs"
            >

              <button
                onClick={() =>
                  setActive(active === index ? -1 : index)
                }
                className="w-full flex justify-between items-center p-4 sm:p-5 hover:bg-slate-50 transition"
              >

                <h3 className="text-sm sm:text-base font-semibold text-left text-slate-900">
                  {faq.question}
                </h3>

                {active === index ? (
                  <Minus className="text-slate-900 shrink-0 ml-3" size={18} />
                ) : (
                  <Plus className="text-slate-400 shrink-0 ml-3" size={18} />
                )}

              </button>

              {active === index && (

                <div className="px-4 sm:px-5 pb-4 sm:pb-5">

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}