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

export default function PaymentMethod() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        Metode Pembayaran
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Kanal dipilih di halaman Midtrans setelah server menyediakan tautan resmi. Pilihan di bawah hanya informasi kanal; ketersediaannya mengikuti sesi Midtrans.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = false;
          return (
            <button
              key={m.id}
              type="button"
              disabled
              aria-label={m.nama}
              className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-left transition ${
                active
                  ? "border-[#0080f2] bg-blue-50/50 ring-1 ring-[#0080f2] dark:border-[#0080f2] dark:bg-blue-950/40 dark:ring-[#0080f2]"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  active
                    ? "bg-[#0080f2] text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {m.nama}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
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
