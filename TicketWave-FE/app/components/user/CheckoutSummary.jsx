"use client";

export default function CheckoutSummary({
  items = [],
  biayaLayanan = 0,
  diskon = 0,
  total,
}) {
  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.harga * item.jumlah,
    0
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-black text-slate-900 dark:text-white">
        Ringkasan Pembayaran
      </h3>

      <div className="mt-5 space-y-3.5">
        {items.map((item, i) => (
          <div
            key={item.ticket_type_id || item.id || i}
            className="flex items-center justify-between text-sm"
          >
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {item.nama} × {item.jumlah}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatRupiah(item.harga)} / tiket
              </p>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatRupiah(item.harga * item.jumlah)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {biayaLayanan > 0 && (
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Biaya layanan</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatRupiah(biayaLayanan)}
            </span>
          </div>
        )}

        {diskon > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Diskon Fase</span>
            <span className="font-semibold">-{formatRupiah(diskon)}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-slate-800">
        <span className="font-bold text-slate-900 dark:text-white">
          Total Pembayaran
        </span>
        <span className="text-xl font-black text-[#0080f2] dark:text-[#0080f2]">
          {formatRupiah(total)}
        </span>
      </div>

      <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
        Saat pesanan dikonfirmasi, server akan mengunci kuota tiket selama{" "}
        <strong className="font-semibold text-slate-700 dark:text-slate-200">
          15 menit
        </strong>{" "}
        dan menerbitkan kode booking unik beserta tautan pembayaran Midtrans.
      </p>
    </div>
  );
}
