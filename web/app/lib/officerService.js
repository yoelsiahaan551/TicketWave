import api from '@/app/lib/api';

// These fields are fabricated or echoed, not persisted by the current backend.
function trustedTicket(ticket) {
  if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket)) return null;
  return Object.fromEntries(Object.entries(ticket).filter(([key]) =>
    !['gate', 'seat_section', 'notes', 'note'].includes(key)));
}

function hasCode(ticket) {
  return typeof ticket?.ticket_code === 'string' && Boolean(ticket.ticket_code.trim());
}

function failure(error, code) {
  const details = error?.data?.errors || {};
  const rejected = [400, 404, 409].includes(error?.status) &&
    ['TIDAK VALID', 'SUDAH DIGUNAKAN'].includes(details.status);
  return {
    success: false,
    status: rejected ? details.status : 'GAGAL MEMERIKSA',
    code,
    message: (typeof error?.data?.message === 'string' && error.data.message) || error?.message || 'Gagal menghubungi server. Silakan coba lagi.',
    ticket: trustedTicket(details.ticket),
    first_checked_in_at: details.first_checked_in_at,
    first_checked_in_by: details.first_checked_in_by,
    server_verified: rejected,
  };
}

export async function getScanHistoryWithMeta() {
  try {
    const res = await api.get('/scan/history', {}, { silent: true });
    if (res?.success !== true || !Array.isArray(res.data) || !res.data.every((item) => hasCode(item) && typeof item.id === 'string')) throw new Error('Respons riwayat server tidak sesuai.');
    return { success: true, data: res.data.map(trustedTicket), total: res.data.length };
  } catch (error) {
    return { success: false, error: error?.message || 'Gagal memuat riwayat.', data: [], total: null };
  }
}

// Only these fields are database counts; other /stats fields are placeholders.
export async function getOfficerStatsAsync() {
  const res = await api.get('/scan/stats', {}, { silent: true });
  const data = res?.data;
  if (res?.success !== true || !Number.isInteger(data?.success_count) || data.success_count < 0 ||
      !Number.isInteger(data?.gate_quota) || data.gate_quota < data.success_count) {
    throw new Error('Respons statistik server tidak sesuai.');
  }
  return { checked_in: data.success_count, valid_or_used: data.gate_quota };
}

export async function inspectTicketCodeAsync(rawCode) {
  const code = typeof rawCode === 'string' ? rawCode.trim() : '';
  if (!code) return failure(new Error('Kode tiket atau QR token wajib diisi.'), code);
  try {
    const res = await api.post('/scan/validate', { code }, { silent: true });
    const data = res?.data;
    if (res?.success !== true || !['VALID', 'DIBATALKAN', 'SUDAH DIGUNAKAN'].includes(data?.status) ||
        !hasCode(data?.ticket)) throw new Error('Respons validasi server tidak sesuai.');
    return { ...data, ticket: trustedTicket(data.ticket), code: data.code || code, message: data.message || res.message, server_verified: true };
  } catch (error) {
    return failure(error, code);
  }
}

export async function executeCheckIn(ticket) {
  const code = typeof ticket === 'string' ? ticket.trim() : ticket?.ticket_code;
  if (typeof code !== 'string' || !code.trim()) return failure(new Error('Kode tiket wajib diisi untuk check-in.'), code);
  try {
    const payload = { code };

    const res = await api.post('/scan/check-in', payload, { silent: true });
    if (res?.success !== true || !hasCode(res.data) ||
        (typeof ticket === 'object' && res.data.ticket_code !== code) ||
        res.data.status !== 'CHECK-IN SELESAI' ||
        typeof res.data.checked_in_at !== 'string' || !Number.isFinite(Date.parse(res.data.checked_in_at))) {
      throw new Error('Konfirmasi check-in belum dapat dipastikan. Periksa ulang status tiket sebelum mencoba lagi.');
    }
    return { success: true, status: 'CHECK-IN SELESAI', ticket: trustedTicket(res.data), message: res.message, server_verified: true };
  } catch (error) {
    const outcome = failure(error, code);
    if (!outcome.server_verified) {
      outcome.status = 'CHECK-IN BELUM TERKONFIRMASI';
      outcome.message += ' Periksa ulang status tiket sebelum mencoba check-in lagi. Jangan izinkan masuk tanpa konfirmasi server.';
    }
    return outcome;
  }
}
