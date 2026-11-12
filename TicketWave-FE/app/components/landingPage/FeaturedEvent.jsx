"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Star,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Info,
  X,
} from "lucide-react";
import api from "@/app/lib/api";
import { useLandingEvents } from "@/app/components/landingPage/useLandingEvents";
import {
  bannerOf,
  handleImageError,
  formatRupiah,
  priceFromOf,
  effectiveTicketPrice,
  stockOf,
  formatEventDate,
  formatEventTime,
  isPurchasable,
  eventTypeLabel,
} from "@/app/components/landingPage/eventDisplay";

/** Event unggulan = event on_sale terdekat yang sudah punya tanggal (fallback: event pertama). */
function pickFeatured(events) {
  if (!events.length) return null;
  return events.find((e) => e.event_date) || events[0];
}

export default function FeaturedEvent() {
  const { events, loading: listLoading, error: listError, retry } = useLandingEvents();
  const featured = useMemo(() => pickFeatured(events), [events]);
  const featuredId = featured?.id ?? null;

  // Detail (GET /api/public/events/<id>) untuk kategori tiket, harga aktif & sisa kuota
  const [detail, setDetail] = useState({ id: null, data: null, error: null });
  const [bookingNotice, setBookingNotice] = useState(false);
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const handleUnavailableBooking = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookingNotice(true);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setBookingNotice(false);
    }, 4500);
  };

  useEffect(() => {
    if (!featuredId) return;
    let ignore = false;
    api
      .get(`/public/events/${featuredId}`)
      .then((res) => {
        if (!ignore) setDetail({ id: featuredId, data: res?.data || null, error: null });
      })
      .catch((err) => {
        if (!ignore) {
          setDetail({
            id: featuredId,
            data: null,
            error: err?.message || "Gagal memuat detail tiket.",
          });
        }
      });
    return () => {
      ignore = true;
    };
  }, [featuredId]);

  const detailLoading = Boolean(featuredId) && detail.id !== featuredId;
  const ticketTypes = detail.id === featuredId ? detail.data?.ticket_types || [] : [];

  const ticketStats = useMemo(() => {
    if (!ticketTypes.length) return null;
    const prices = ticketTypes.map(effectiveTicketPrice).filter((p) => p > 0);
    const remaining = ticketTypes.reduce((sum, t) => sum + stockOf(t), 0);
    const quota = ticketTypes.reduce((sum, t) => sum + Number(t.quota || 0), 0);
    const phase = ticketTypes.find((t) => t.active_phase)?.active_phase || null;
    return {
      minPrice: prices.length ? Math.min(...prices) : null,
      remaining,
      quota,
      percent: quota > 0 ? Math.round((remaining / quota) * 100) : 0,
      phase,
    };
  }, [ticketTypes]);

  if (listLoading) {
    return (
      <section className="py-28 bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center animate-pulse">
          <div className="h-[420px] rounded-[35px] bg-slate-800" />
          <div className="space-y-6">
            <div className="h-9 w-44 rounded-full bg-slate-800" />
            <div className="h-16 w-3/4 rounded-2xl bg-slate-800" />
            <div className="h-24 w-full rounded-2xl bg-slate-800" />
            <div className="grid grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="h-28 rounded-2xl bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (listError || !featured) {
    return (
      <section className="py-28 bg-slate-950 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="bg-cyan-500/20 text-cyan-300 px-5 py-2 rounded-full">
            FEATURED EVENT
          </span>
          {listError ? (
            <>
              <AlertTriangle className="mx-auto mt-10 text-red-400" size={40} />
              <h2 className="text-3xl font-black text-white mt-5">Event unggulan gagal dimuat</h2>
              <p className="text-gray-400 mt-4">{listError}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-xl hover:scale-105 transition"
              >
                <RefreshCw size={18} />
                Coba Lagi
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-black text-white mt-10">Belum ada event unggulan</h2>
              <p className="text-gray-400 mt-4">
                Event unggulan akan tampil setelah ada event yang dibuka penjualannya.
              </p>
            </>
          )}
        </div>
      </section>
    );
  }

  const title = featured.artist_name || featured.name;
  const subtitle = featured.artist_name ? featured.name : null;
  const price = ticketStats?.minPrice ?? priceFromOf(featured);
  const purchasable = isPurchasable(featured);

  return (
    <section className="py-28 bg-slate-950 overflow-hidden">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* IMAGE */}

          <div className="relative group">

            <div className="absolute inset-0 bg-cyan-500 blur-[120px] opacity-25 rounded-full"></div>

            <img
              src={bannerOf(featured)}
              alt={featured.name}
              onError={handleImageError}
              className="relative w-full aspect-[4/3] object-cover rounded-[35px] shadow-2xl group-hover:scale-105 duration-700 transition"
            />

            {/* Floating Badge (fase harga aktif / tipe event) */}

            <div className="absolute top-6 left-6 bg-white rounded-2xl shadow-xl px-5 py-4">

              <div className="flex items-center gap-2">

                <Star
                  fill="#FFD700"
                  color="#FFD700"
                  size={18}
                />

                <span className="font-bold capitalize">
                  {ticketStats?.phase
                    ? `${String(ticketStats.phase.phase_name).replace(/_/g, " ")} -${ticketStats.phase.discount_percent}%`
                    : eventTypeLabel(featured)}
                </span>

              </div>

              <p className="text-gray-500 text-sm">
                {featured.city || "Indonesia"}
              </p>

            </div>

            {/* Floating Ticket (sisa kuota dari backend) */}

            {ticketStats && (
              <div className="absolute bottom-6 right-6 bg-cyan-500 text-white rounded-2xl px-5 py-4 shadow-xl">

                <Ticket />

                <h2 className="font-bold mt-2">
                  {ticketStats.remaining.toLocaleString("id-ID")} Left
                </h2>

              </div>
            )}

          </div>

          {/* CONTENT */}

          <div>

            <span className="bg-cyan-500/20 text-cyan-300 px-5 py-2 rounded-full">

              FEATURED EVENT

            </span>

            <h2 className="text-4xl md:text-6xl font-black text-white mt-8 leading-tight">

              {title}

              {subtitle && (
                <span className="block text-cyan-400">

                  {subtitle}

                </span>
              )}

            </h2>

            <p className="text-gray-400 mt-8 leading-8 line-clamp-4">

              {featured.description || "Informasi lengkap event tersedia di halaman detail."}

            </p>

            {/* INFO */}

            <div className="grid grid-cols-2 gap-5 mt-10">

              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">

                <Calendar className="text-cyan-400" />

                <p className="text-gray-400 mt-3">

                  Date

                </p>

                <h3 className="text-white font-bold">

                  {formatEventDate(featured, { day: "numeric", month: "long", year: "numeric" })}

                </h3>

              </div>

              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">

                <Clock className="text-cyan-400" />

                <p className="text-gray-400 mt-3">

                  Time

                </p>

                <h3 className="text-white font-bold">

                  {formatEventTime(featured) || "Menyusul"}

                </h3>

              </div>

              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">

                <MapPin className="text-cyan-400" />

                <p className="text-gray-400 mt-3">

                  Venue

                </p>

                <h3 className="text-white font-bold">

                  {[featured.venue, featured.city].filter(Boolean).join(", ") || "Menyusul"}

                </h3>

              </div>

              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">

                <Ticket className="text-cyan-400" />

                <p className="text-gray-400 mt-3">

                  Price

                </p>

                <h3 className="text-cyan-400 font-bold text-xl">

                  {detailLoading ? "Memuat…" : price !== null ? formatRupiah(price) : "Lihat detail"}

                </h3>

              </div>

            </div>

            {/* Sisa kuota tiket */}

            <div className="mt-10">

              {detailLoading ? (
                <div className="h-3 rounded-full bg-slate-800 animate-pulse" />
              ) : detail.error ? (
                <p className="flex items-center gap-2 text-sm text-red-300">
                  <AlertTriangle size={16} />
                  Data kategori tiket gagal dimuat dari server: {detail.error}
                </p>
              ) : ticketStats ? (
                <>
                  <div className="flex justify-between mb-2">

                    <span className="text-gray-400">

                      Ticket Remaining

                    </span>

                    <span className="text-cyan-400">

                      {ticketStats.percent}%

                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      style={{ width: `${ticketStats.percent}%` }}
                    ></div>

                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">Kategori tiket belum tersedia untuk event ini.</p>
              )}

            </div>

            {/* BUTTON */}

            <div className="flex flex-wrap gap-5 mt-12">

              {purchasable ? (
                <button
                  type="button"
                  onClick={handleUnavailableBooking}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-xl hover:scale-105 transition cursor-pointer"
                >

                  Book Ticket

                </button>
              ) : (
                <span className="px-8 py-4 rounded-full bg-slate-800 text-slate-400 font-bold cursor-not-allowed">
                  Tidak Tersedia
                </span>
              )}

              <Link
                href={`/user/event/${featured.id}`}
                className="px-8 py-4 rounded-full border border-slate-700 text-white hover:bg-white hover:text-black transition flex items-center gap-2"
              >

                Learn More

                <ArrowRight size={18} />

              </Link>

            </div>

          </div>

        </div>

      </div>

      {bookingNotice && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-amber-200 bg-slate-900 px-5 py-4 text-sm font-medium text-white shadow-2xl"
        >
          <Info size={18} className="shrink-0 text-amber-400" />
          <span>Fitur pemesanan tiket belum tersedia saat ini.</span>
          <button
            type="button"
            onClick={() => setBookingNotice(false)}
            aria-label="Tutup notifikasi"
            className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

    </section>
  );
}
