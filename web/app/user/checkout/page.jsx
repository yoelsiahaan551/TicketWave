"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowLeft,
  ShieldAlert,
  UserCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import CheckoutSummary from "@/app/components/user/CheckoutSummary";
import PaymentMethod from "@/app/components/user/PaymentMethod";
import EmptyState from "@/app/components/user/EmptyState";
import { useIsMounted } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/api";
import { saveBookingEntry } from "@/app/lib/bookingStorage";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [data] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("ticketwave_checkout");
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return null;
  });
  const ready = useIsMounted();
  const [metode, setMetode] = useState("transfer_bank");
  const [submitting, setSubmitting] = useState(false);
  const [pesan, setPesan] = useState(null);

  const [manualBuyerName, setManualBuyerName] = useState(null);
  const [manualBuyerEmail, setManualBuyerEmail] = useState(null);
  const [manualBuyerPhone, setManualBuyerPhone] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState("");

  const buyerName = manualBuyerName !== null ? manualBuyerName : user?.name || "";
  const buyerEmail = manualBuyerEmail !== null ? manualBuyerEmail : user?.email || "";
  const buyerPhone = manualBuyerPhone !== null ? manualBuyerPhone : user?.phone || "";

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);

  const formatTanggal = (d) => {
    if (!d) return "Jadwal Festival";
    try {
      return new Date(d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const items = data?.items || [];
  const total = items.reduce((acc, i) => acc + i.harga * i.jumlah, 0);
  const totalTiket = items.reduce((acc, i) => acc + i.jumlah, 0);

  const konfirmasiPesanan = async () => {
    if (!items.length || !data?.eventId) {
      setPesan({
        tipe: "error",
        teks: "Data event atau pilihan tiket tidak valid. Silakan pilih kembali dari detail event.",
      });
      return;
    }

    if (items.length > 1) {
      setPesan({
        tipe: "error",
        teks: "Sistem hanya mendukung 1 kategori tiket per transaksi. Silakan pilih 1 kategori tiket saja.",
      });
      return;
    }

    if (items[0].jumlah > 10) {
      setPesan({
        tipe: "error",
        teks: "Maksimal pemesanan tiket adalah 10 tiket per transaksi.",
      });
      return;
    }

    if (!buyerName.trim() || buyerName.trim().length < 2) {
      setPesan({
        tipe: "error",
        teks: "Nama lengkap pembeli wajib diisi (minimal 2 karakter).",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyerEmail.trim() || !emailRegex.test(buyerEmail.trim())) {
      setPesan({
        tipe: "error",
        teks: "Format email pembeli tidak valid.",
      });
      return;
    }

    if (!buyerPhone.trim() || buyerPhone.trim().length < 10) {
      setPesan({
        tipe: "error",
        teks: "Nomor telepon pembeli wajib diisi minimal 10 digit.",
      });
      return;
    }

    if (
      recipientEmail &&
      recipientEmail.trim() &&
      !emailRegex.test(recipientEmail.trim())
    ) {
      setPesan({
        tipe: "error",
        teks: "Format email penerima tidak valid.",
      });
      return;
    }

    setSubmitting(true);
    setPesan(null);

    const primaryItem = items[0];
    const ticketTypeId = Number(primaryItem.ticket_type_id || primaryItem.id);
    const quantity = Number(primaryItem.jumlah);

    const payload = {
      event_id: Number(data.eventId),
      ticket_type_id: ticketTypeId,
      quantity,
      buyer_name: buyerName.trim(),
      buyer_email: buyerEmail.trim(),
      buyer_phone: buyerPhone.trim(),
    };

    if (recipientEmail && recipientEmail.trim()) {
      payload.recipient_email = recipientEmail.trim();
    }

    try {
      const res = await api.post("/checkout", payload);
      if (res.success && res.data?.booking) {
        const bookingObj = res.data.booking;
        saveBookingEntry({
          booking_code: bookingObj.booking_code,
          payment_url: res.data.payment_url || bookingObj.payment_url || null,
          recipient_email: res.data.recipient_email || bookingObj.recipient_email || buyerEmail.trim(),
          event_name: data.eventNama,
        });

        setPesan({
          tipe: "sukses",
          teks: `Pesanan berhasil dibuat! Kode Booking Anda: ${bookingObj.booking_code}. Mengarahkan ke detail pesanan...`,
        });

        try {
          sessionStorage.removeItem("ticketwave_checkout");
        } catch {
          // ignore
        }
        router.push(`/user/pesanan/${bookingObj.booking_code}?new=1`);
      } else {
        setPesan({
          tipe: "error",
          teks: res.message || "Gagal membuat pesanan.",
        });
      }
    } catch (err) {
      setPesan({
        tipe: "error",
        teks: err.message || "Terjadi kesalahan saat menghubungi server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (ready && !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState
          judul="Belum ada tiket yang dipilih"
          deskripsi="Pilih event dan tiket terlebih dahulu untuk melanjutkan ke checkout."
          aksiLabel="Jelajahi Event"
          aksiHref="/user/event"
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href={`/user/event/${data.eventId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400 dark:hover:text-[#0080f2]"
      >
        <ArrowLeft size={17} />
        Kembali ke Detail Event
      </Link>

      <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Konfirmasi Checkout
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Kiri: ringkasan event + metode + form pembeli */}
        <div className="space-y-6">
          {/* Ringkasan Event */}
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row">
              <img
                src={data.gambar}
                alt={data.eventNama}
                className="h-40 w-full object-cover sm:h-auto sm:w-52"
              />

              <div className="p-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {data.eventNama}
                </h2>

                <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-slate-400" />
                    {formatTanggal(data.eventTanggal)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {data.eventWaktu}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    {data.venue ? `${data.venue}, ${data.lokasi}` : data.lokasi}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian item */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Tiket Dipilih
            </h3>

            <div className="mt-4 space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.ticket_type_id || item.id || idx}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">
                      {item.nama}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {item.jumlah} tiket × {formatRupiah(item.harga)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatRupiah(item.harga * item.jumlah)}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Total {totalTiket} tiket (Maksimal 10 tiket per transaksi)
            </p>
          </div>

          {/* Metode pembayaran */}
          <PaymentMethod value={metode} onChange={setMetode} />

          {/* Form Data Pembeli */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Data Pembeli &amp; Penerima E-Ticket
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Data ini dikirim ke endpoint <code className="font-medium">POST /api/checkout</code> untuk penerbitan kode booking dan e-ticket.
                </p>
              </div>

              {ready && isAuthenticated && user ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                  <UserCheck size={13} />
                  Terisi Otomatis
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Sparkles size={13} />
                  Guest Checkout
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nama Lengkap Pembeli *
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setManualBuyerName(e.target.value)}
                  placeholder="Nama lengkap sesuai identitas"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Email Pembeli *
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setManualBuyerEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nomor Telepon / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setManualBuyerPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Email Penerima Tiket (Opsional)
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Kosongkan jika dikirim ke email pembeli"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kanan: ringkasan harga */}
        <div className="h-fit space-y-4 lg:sticky lg:top-28">
          <CheckoutSummary items={items} total={total} />

          {pesan && (
            <div
              className="flex items-start gap-2.5 rounded-xl border border-slate-300 bg-slate-100 p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {pesan.tipe === "error" ? (
                <ShieldAlert size={16} className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-400" />
              ) : (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-400" />
              )}
              <span>{pesan.teks}</span>
            </div>
          )}

          <button
            type="button"
            onClick={konfirmasiPesanan}
            disabled={submitting || totalTiket === 0}
            className="w-full rounded-xl bg-[#0080f2] hover:bg-[#0070d4] py-3 text-sm font-medium text-white shadow-xs transition disabled:opacity-60"
          >
            {submitting
              ? "Memproses Pesanan..."
              : `Konfirmasi Pesanan — ${formatRupiah(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
