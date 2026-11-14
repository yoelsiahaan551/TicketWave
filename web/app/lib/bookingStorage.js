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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBookingEntry({ booking_code, payment_url = null, recipient_email = null }) {
  if (typeof window === "undefined" || !booking_code) return;
  const code = String(booking_code).trim().toUpperCase();
  if (!code) return;

  try {
    const existing = getSavedBookingEntries();
    const filtered = existing.filter((item) => item.booking_code !== code);
    const prev = existing.find((item) => item.booking_code === code);

    const nextEntry = {
      booking_code: code,
      payment_url: payment_url || prev?.payment_url || null,
      recipient_email: recipient_email || prev?.recipient_email || null,
      saved_at: prev?.saved_at || new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([nextEntry, ...filtered]));
  } catch (err) {
    console.error("[BookingStorage] Failed to save booking code:", err);
  }
}

export function removeSavedBookingCode(booking_code) {
  if (typeof window === "undefined" || !booking_code) return;
  const code = String(booking_code).trim().toUpperCase();
  try {
    const existing = getSavedBookingEntries();
    const next = existing.filter((item) => item.booking_code !== code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error("[BookingStorage] Failed to remove booking code:", err);
  }
}

export const removeBookingEntry = removeSavedBookingCode;

export function getSavedPaymentUrl(booking_code) {
  if (!booking_code) return null;
  const code = String(booking_code).trim().toUpperCase();
  const found = getSavedBookingEntries().find((item) => item.booking_code === code);
  return found?.payment_url || null;
}

/**
 * Mengambil detail lengkap untuk seluruh kode booking yang tersimpan
 * langsung dari endpoint backend GET /api/checkout/<booking_code>.
 */
export async function fetchAllSavedBookings() {
  const entries = getSavedBookingEntries();
  if (entries.length === 0) return [];

  const results = await Promise.allSettled(
    entries.map(async (entry) => {
      const res = await api.get(`/checkout/${encodeURIComponent(entry.booking_code)}`);
      if (res.success && res.data?.booking) {
        return {
          ...res.data,
          booking: {
            ...res.data.booking,
            payment_url: res.data.booking.payment_url || entry.payment_url || null,
            recipient_email: entry.recipient_email || null,
          },
        };
      }
      throw new Error("Booking not found");
    })
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value);
}
