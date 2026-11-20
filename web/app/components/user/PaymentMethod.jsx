"use client";

import { useRef } from "react";
import { Banknote, Check, ShieldAlert, Store, Wallet } from "lucide-react";

export const PAYMENT_METHODS = [
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

export default function PaymentMethod({
  selectedPaymentMethod = null,
  onSelectPaymentMethod,
  error = null,
  disabled = false,
  sectionRef = null,
}) {
  const cardRefs = useRef([]);

  const handleSelect = (methodId) => {
    if (disabled) return;
    if (typeof onSelectPaymentMethod === "function") {
      onSelectPaymentMethod(methodId);
    }
  };

  const handleKeyDown = (e, index, methodId) => {
    if (disabled) return;

    if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
      e.preventDefault();
      handleSelect(methodId);
      return;
    }

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % PAYMENT_METHODS.length;
      const nextMethod = PAYMENT_METHODS[nextIndex];
      handleSelect(nextMethod.id);
      cardRefs.current[nextIndex]?.focus();
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex =
        (index - 1 + PAYMENT_METHODS.length) % PAYMENT_METHODS.length;
      const prevMethod = PAYMENT_METHODS[prevIndex];
      handleSelect(prevMethod.id);
      cardRefs.current[prevIndex]?.focus();
    }
  };

  return (
    <div
      ref={sectionRef}
      id="payment-method-section"
      tabIndex={-1}
      className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors outline-none dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3
          id="payment-method-heading"
          className="text-base font-semibold text-slate-900 dark:text-white"
        >
          Metode Pembayaran <span className="text-[#0080f2]">*</span>
        </h3>
        {selectedPaymentMethod && (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/80 bg-cyan-50 px-2.5 py-0.5 text-[11px] font-medium text-[#0080f2] dark:border-cyan-800/60 dark:bg-cyan-950/50 dark:text-cyan-300">
            <Check size={12} strokeWidth={2.5} />
            {
              PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)
                ?.nama
            }
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Pilih salah satu metode pembayaran sebelum melanjutkan. Pilihan akhir metode pembayaran akan dikonfirmasi pada halaman Midtrans.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <ShieldAlert size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      <div
        role="radiogroup"
        aria-labelledby="payment-method-heading"
        aria-required="true"
        className="mt-4 grid gap-3 sm:grid-cols-3"
      >
        {PAYMENT_METHODS.map((m, idx) => {
          const Icon = m.icon;
          const active = selectedPaymentMethod === m.id;

          return (
            <button
              key={m.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={m.nama}
              disabled={disabled}
              data-payment-method={m.id}
              data-selected={active ? "true" : "false"}
              onClick={() => handleSelect(m.id)}
              onKeyDown={(e) => handleKeyDown(e, idx, m.id)}
              className={`group relative flex w-full cursor-pointer items-start justify-between gap-2.5 rounded-xl border p-3.5 text-left transition-colors duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0080f2] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900 ${
                active
                  ? "border-2 border-[#0080f2] bg-cyan-50/60 dark:border-cyan-400 dark:bg-cyan-950/35"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/70"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? "bg-[#0080f2] text-white dark:bg-cyan-500 dark:text-slate-950"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700/80 dark:group-hover:text-slate-200"
                  }`}
                >
                  <Icon size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p
                      className={`text-xs font-semibold transition-colors ${
                        active
                          ? "text-[#0080f2] dark:text-cyan-300"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {m.nama}
                    </p>
                    {active && (
                      <span className="inline-flex items-center rounded-md bg-[#0080f2]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#0080f2] dark:bg-cyan-400/15 dark:text-cyan-300">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-0.5 text-[11px] leading-snug ${
                      active
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {m.deskripsi}
                  </p>
                </div>
              </div>

              {active && (
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0080f2] text-white dark:bg-cyan-400 dark:text-slate-950"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
