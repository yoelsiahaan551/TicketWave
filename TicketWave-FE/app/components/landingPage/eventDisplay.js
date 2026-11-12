/**
 * Helper tampilan event untuk Landing Page.
 * Semua nilai berasal dari respons backend (GET /api/public/events & /api/public/events/<id>).
 * Tidak ada data event dummy di sini — hanya formatter & gambar fallback visual.
 */

export const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200";

export function handleImageError(e) {
  if (e?.currentTarget && e.currentTarget.src !== FALLBACK_POSTER) {
    e.currentTarget.src = FALLBACK_POSTER;
  }
}

export function posterOf(event) {
  return event?.poster_url || event?.banner_url || FALLBACK_POSTER;
}

export function bannerOf(event) {
  return event?.banner_url || event?.poster_url || FALLBACK_POSTER;
}

export function formatRupiah(value) {
  const n = Number(value);
  if (value === null || value === undefined || Number.isNaN(n)) return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

/** Harga "mulai dari" dari list endpoint. null jika backend tidak mengirim angka valid. */
export function priceFromOf(event) {
  const p = event?.price_from;
  return typeof p === "number" && !Number.isNaN(p) ? p : null;
}

/** Harga efektif satu ticket type dari detail endpoint (final_price atau base_price - diskon fase aktif). */
export function effectiveTicketPrice(t) {
  if (typeof t?.final_price === "number" && !Number.isNaN(t.final_price)) {
    return t.final_price;
  }
  const base = Number(t?.base_price || 0);
  if (t?.active_phase && t.active_phase.discount_percent !== undefined) {
    const disc = Number(t.active_phase.discount_percent || 0);
    return Math.round(base * (1 - disc / 100));
  }
  return base;
}

export function stockOf(t) {
  return t?.stock_available ?? t?.remaining ?? Math.max(0, (t?.quota || 0) - (t?.sold_count || 0));
}

export function formatEventDate(event, opts = { day: "numeric", month: "short", year: "numeric" }) {
  if (!event?.event_date) {
    if (event?.event_type === "festival") return `Festival ${event?.days_count || 1} Hari`;
    return "Jadwal menyusul";
  }
  try {
    const [y, m, d] = event.event_date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("id-ID", opts);
  } catch {
    return event.event_date;
  }
}

export function formatEventTime(event) {
  return event?.event_time ? `${event.event_time.slice(0, 5)} WIB` : null;
}

/** true bila tanggal event sudah lewat (berdasarkan event_date dari backend). */
export function isEventPast(event) {
  if (!event?.event_date) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  return event.event_date < todayStr;
}

/** Event bisa dibeli hanya jika status on_sale dan belum lewat. */
export function isPurchasable(event) {
  return event?.status === "on_sale" && !isEventPast(event);
}

export function eventTypeLabel(event) {
  return event?.event_type === "festival" ? "Festival" : "Konser";
}
