/**
 * Utilitas manajemen kode booking yang dibuat / dicari oleh user di perangkat ini.
 * Backend saat ini mendukung Guest Checkout (user_id = null) dan mengekspos
 * endpoint GET /api/checkout/<booking_code> untuk mengambil detail booking & tiket,
 * namun belum memiliki endpoint GET /api/orders atau GET /api/tickets berbasis user_id.
 *
 * Seluruh data booking dan tiket tetap diambil secara langsung (real-time) dari
 * endpoint backend GET /api/checkout/<booking_code>.
 */

import api from "@/app/lib/api";

const STORAGE_KEY = "ticketwave_booking_codes";

export function getSavedBookingEntries() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item?.booking_code !== "string" || !item.booking_code.trim())) {
      throw new Error("Format bookmark tidak valid.");
    }
    // Only codes are bookmarks; legacy cached metadata is never authoritative.
    return [...new Set(parsed.map((item) => item.booking_code))].map((booking_code) => ({ booking_code }));
  } catch {
    throw new Error("Daftar kode booking di perangkat tidak dapat dibaca. Periksa izin penyimpanan browser dan coba lagi.");
  }
}

export function saveBookingEntry({ booking_code }) {
  if (typeof window === "undefined" || !booking_code) return;
  const code = String(booking_code).trim().toUpperCase();
  if (!code) return;

  try {
    const existing = getSavedBookingEntries();
    const filtered = existing.filter((item) => item.booking_code !== code);
    const nextEntry = { booking_code: code };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([nextEntry, ...filtered]));
  } catch (err) {
    console.error("[BookingStorage] Failed to save booking code:", err);
  }
}

export function getSavedPaymentUrl() {
  // Payment URLs must come from a fresh server response.
  return null;
}

/**
 * Mengambil detail lengkap untuk seluruh kode booking yang tersimpan
 * langsung dari endpoint backend GET /api/checkout/<booking_code>.
 */
export async function fetchAllSavedBookings() {
  const entries = getSavedBookingEntries();
  if (entries.length === 0) return { bookings: [], errors: [], total: 0 };

  const results = await Promise.allSettled(
    entries.map(async (entry) => {
      try {
        const res = await api.get(
          `/checkout/${encodeURIComponent(entry.booking_code)}`,
          {},
          { silent: true }
        );
        if (res?.success === true && res.data?.booking?.booking_code === entry.booking_code && typeof res.data.booking.status === "string" && Array.isArray(res.data.tickets)) {
          return res.data;
        }
        throw new Error("Respons detail booking tidak valid.");
      } catch (err) {
        // Retain bookmarks on errors, including unauthorized requests.
        throw err;
      }
    })
  );

  const bookings = [];
  const errors = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") bookings.push(result.value);
    else errors.push({
      booking_code: entries[index].booking_code,
      message: result.reason?.message || "Gagal memuat pesanan. Silakan coba lagi.",
      status: result.reason?.status || 0,
    });
  });
  return { bookings, errors, total: entries.length };
}
