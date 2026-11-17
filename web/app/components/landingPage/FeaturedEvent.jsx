"use client";

import { useEffect, useMemo, useState } from "react";
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
  validEventId,
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
  const [detailReload, setDetailReload] = useState(0);
  const [detail, setDetail] = useState({ id: null, data: null, error: null });
  useEffect(() => {
    if (!featuredId) return;
    let ignore = false;
    api
      .get(`/public/events/${featuredId}`)
      .then((res) => {
        if (!validEventId(res?.data?.event?.id) || String(res.data.event.id) !== String(featuredId) || !Array.isArray(res?.data?.ticket_types)) throw new Error("Respons detail tiket tidak valid.");
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
  }, [featuredId, detailReload]);

  const detailLoading = Boolean(featuredId) && detail.id !== featuredId;
  const ticketTypes = useMemo(
    () => detail.id === featuredId ? detail.data?.ticket_types || [] : [],
    [detail, featuredId]
  );

  const ticketStats = useMemo(() => {
    if (!ticketTypes.length) return null;
    const prices = ticketTypes.map(effectiveTicketPrice).filter((p) => p !== null);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center animate-pulse">
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
      <section className="py-24 bg-slate-950 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Featured Event
          </span>
          {listError ? (
            <>
              <AlertTriangle className="mx-auto mt-8 text-slate-400" size={32} />
              <h2 className="text-2xl font-bold tracking-tight text-white mt-4">Event unggulan gagal dimuat</h2>
              <p className="text-xs text-slate-400 mt-2">{listError}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium shadow-xs hover:bg-slate-200 transition"
              >
                <RefreshCw size={14} />
                Coba Lagi
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-6">Belum ada event unggulan</h2>
              <p className="text-xs text-slate-400 mt-2">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* IMAGE */}

          <div className="relative group">

            <div className="absolute inset-0 bg-slate-500/5 blur-[100px] opacity-20 rounded-full"></div>

            <img
              src={bannerOf(featured)}
              alt={featured.name}
              onError={handleImageError}
              className="relative w-full aspect-[4/3] object-cover rounded-2xl border border-slate-800 shadow-xl group-hover:scale-[1.02] duration-500 transition"
            />

            {/* Floating Badge (fase harga aktif / tipe event) */}

            <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-xs rounded-xl shadow-md px-4 py-3 border border-slate-100">

              <div className="flex items-center gap-1.5">

                <Star
                  className="fill-slate-400 text-slate-400"
                  size={16}
                />

                <span className="font-semibold text-xs sm:text-sm text-slate-900 capitalize">
                  {ticketStats?.phase
                    ? `${String(ticketStats.phase.phase_name).replace(/_/g, " ")} -${ticketStats.phase.discount_percent}%`
                    : eventTypeLabel(featured)}
                </span>

              </div>

              <p className="text-slate-500 text-xs mt-0.5">
                {featured.city || "Indonesia"}
              </p>

            </div>

            {/* Floating Ticket (sisa kuota dari backend) */}

            {ticketStats && (
              <div className="absolute bottom-5 right-5 bg-slate-900 text-white rounded-xl px-4 py-3 shadow-md border border-slate-700">

                <Ticket size={18} />

                <h2 className="font-semibold text-sm mt-1.5">
                  {ticketStats.remaining.toLocaleString("id-ID")} Left
                </h2>

              </div>
            )}

          </div>

          {/* CONTENT */}

          <div>

            <span className="inline-flex items-center gap-2 rounded-full bg-blue-950/40 border border-blue-900/50 text-[#0080f2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider">

              FEATURED EVENT

            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-6 leading-tight tracking-tight">

              {title}

              {subtitle && (
                <span className="block text-slate-200 text-xl sm:text-2xl mt-1.5 font-semibold">

                  {subtitle}

                </span>
              )}

            </h2>

            <p className="text-slate-400 mt-5 leading-relaxed text-sm line-clamp-4">

              {featured.description || "Informasi lengkap event tersedia di halaman detail."}

            </p>

            {/* INFO */}

            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">

                <Calendar className="text-slate-400" size={18} />

                <p className="text-slate-400 mt-2 text-xs">

                  Date

                </p>

                <h3 className="text-white font-medium text-sm mt-0.5">

                  {formatEventDate(featured, { day: "numeric", month: "long", year: "numeric" })}

                </h3>

              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">

                <Clock className="text-slate-400" size={18} />

                <p className="text-slate-400 mt-2 text-xs">

                  Time

                </p>

                <h3 className="text-white font-medium text-sm mt-0.5">

                  {formatEventTime(featured) || "Menyusul"}

                </h3>

              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">

                <MapPin className="text-slate-400" size={18} />

                <p className="text-slate-400 mt-2 text-xs">

                  Venue

                </p>

                <h3 className="text-white font-medium text-sm mt-0.5">

                  {[featured.venue, featured.city].filter(Boolean).join(", ") || "Menyusul"}

                </h3>

              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">

                <Ticket className="text-slate-400" size={18} />

                <p className="text-slate-400 mt-2 text-xs">

                  Price

                </p>

                <h3 className="text-[#0080f2] font-bold text-base mt-0.5">

                  {detailLoading ? "Memuat…" : price !== null ? formatRupiah(price) : "Lihat detail"}

                </h3>

              </div>

            </div>

            {/* Sisa kuota tiket */}

            <div className="mt-8">

              {detailLoading ? (
                <div className="h-2 rounded-full bg-slate-800 animate-pulse" />
              ) : detail.error ? (
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <AlertTriangle size={14} />
                  Data kategori tiket gagal dimuat: {detail.error}
                  <button type="button" className="underline" onClick={() => { setDetail({ id: null, data: null, error: null }); setDetailReload((key) => key + 1); }}>Coba Lagi</button>
                </p>
              ) : ticketStats ? (
                <>
                  <div className="flex justify-between mb-1.5 text-xs">

                    <span className="text-slate-400">

                      Ticket Remaining

                    </span>

                    <span className="text-slate-300 font-medium">

                      {ticketStats.percent}%

                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

                    <div
                      className="h-full bg-[#0080f2]"
                      style={{ width: `${ticketStats.percent}%` }}
                    ></div>

                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">Kategori tiket belum tersedia untuk event ini.</p>
              )}

            </div>

            {/* BUTTON */}

            <div className="flex flex-wrap gap-4 mt-8">

              {purchasable ? (
                <Link
                  href={`/user/event/${featured.id}#pilih-tiket`}
                  className="px-6 py-3 rounded-xl bg-[#0080f2] hover:bg-[#0070d4] text-white font-medium shadow-xs transition cursor-pointer text-sm"
                >

                  Book Ticket

                </Link>
              ) : (
                <span className="px-6 py-3 rounded-xl bg-slate-800 text-slate-400 font-medium text-sm cursor-not-allowed">
                  Tidak Tersedia
                </span>
              )}

              <Link
                href={`/user/event/${featured.id}`}
                className="px-6 py-3 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 font-medium transition flex items-center gap-2 text-sm"
              >

                Learn More

                <ArrowRight size={16} />

              </Link>

            </div>

          </div>

        </div>

      </div>



    </section>
  );
}
