// Only accept a provider session URL supplied by the backend.
export function getOfficialPaymentUrl(booking) {
  if (booking?.status !== "pending_payment" || typeof booking.payment_url !== "string") return null;
  try {
    const url = new URL(booking.payment_url);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (!["app.midtrans.com", "app.sandbox.midtrans.com"].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/snap\/v[1-4]\/(?:vtweb|redirection)\/([^/]+)\/?$/);
    if (!match) return null;
    const session = decodeURIComponent(match[1]);
    if (!session.trim() || /[\s/\\?#]/.test(session) || [...session].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) || session === booking.booking_code) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function getTicketDisplayStatus(booking, ticket) {
  if (booking?.status === "paid") return ticket?.status || "unknown";
  if (["cancelled", "expired"].includes(booking?.status)) return booking.status;
  return "pending_payment";
}
