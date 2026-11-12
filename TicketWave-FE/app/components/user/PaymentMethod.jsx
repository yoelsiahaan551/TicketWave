"use client";

import { Banknote, Store, Wallet } from "lucide-react";

const METHODS = [
  {
    id: "transfer_bank",
    nama: "Transfer Bank",
    deskripsi: "Melalui Midtrans Payment Gateway",
    icon: Banknote,
  },
  {
    id: "virtual_account",
    nama: "Virtual Account",
    deskripsi: "Konfirmasi otomatis via Midtrans",
    icon: Wallet,
  },
  {
    id: "qris",
    nama: "QRIS",
    deskripsi: "Scan dari e-wallet pilihan Anda",
    icon: Store,
  },
];

export default function PaymentMethod({ value, onChange }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-black text-slate-900 dark:text-white">
        Preferensi Metode Pembayaran
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Pilih preferensi kanal pembayaran Anda. Setelah checkout dikonfirmasi, sistem menghasilkan URL pembayaran Midtrans Snap untuk kode booking Anda.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[#0080f2] bg-[#0080f2]/10 ring-2 ring-[#0080f2]/20 dark:border-[#0080f2] dark:bg-[#0080f2]/20 dark:ring-[#0080f2]/20"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? "bg-[#0080f2] text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {m.nama}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {m.deskripsi}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
