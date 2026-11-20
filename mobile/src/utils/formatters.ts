export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'TBA';
  }
  return 'Rp' + Number(amount).toLocaleString('id-ID');
}

export function formatTanggal(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatTanggalSingkat(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatWaktu(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  // e.g. "19:00:00" -> "19:00 WIB"
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]} WIB`;
  }
  return timeStr;
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'on_sale':
      return 'On Sale';
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'sales_closed':
      return 'Sales Closed';
    case 'ongoing':
      return 'Ongoing';
    case 'finished':
      return 'Finished';
    case 'archived':
      return 'Archived';
    case 'paid':
      return 'Dibayar';
    case 'pending_payment':
      return 'Menunggu Bayar';
    case 'cancelled':
      return 'Dibatalkan';
    case 'expired':
      return 'Kadaluarsa';
    case 'denied':
      return 'Ditolak';
    case 'refunded':
      return 'Dikembalikan';
    case 'failed':
      return 'Gagal';
    case 'valid':
      return 'Valid / Aktif';
    case 'used':
      return 'Sudah Check-In';
    default:
      return status;
  }
}

/**
 * Returns the effective display status of a ticket based on its parent booking status.
 * Matches Next.js web behavior:
 * - If booking is 'paid', returns the individual ticket's status ('valid', 'used', etc.)
 * - If booking is 'cancelled', 'expired', 'denied', 'refunded', or 'failed', the ticket status reflects it
 * - If booking is 'pending_payment', returns 'pending_payment'
 */
export function getTicketDisplayStatus(
  bookingStatus?: string | null,
  ticketStatus?: string | null
): string {
  if (bookingStatus === 'paid') return ticketStatus || 'valid';
  if (
    bookingStatus &&
    ['cancelled', 'expired', 'denied', 'refunded', 'failed'].includes(bookingStatus)
  ) {
    return bookingStatus;
  }
  return 'pending_payment';
}

