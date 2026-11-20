import { api } from './client';
import {
  Agency,
  Booking,
  BookingDetailResponse,
  CheckoutPayload,
  EventDetailResponse,
  EventItem,
  EventStatus,
  SyncPaymentStatusResponse,
  TicketPhase,
  User,
} from '../types';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

// ---------- PUBLIC EVENTS ----------
export async function fetchPublicEvents(params?: {
  city?: string;
  event_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}) {
  return api.get<PaginatedResponse<EventItem>>('/public/events', params);
}

export async function fetchPublicEventDetail(eventId: number | string) {
  return api.get<EventDetailResponse>(`/public/events/${eventId}`);
}

export async function fetchPublicCities() {
  return api.get<{ cities: string[] }>('/public/events/cities');
}

// ---------- CHECKOUT & ORDERS ----------
export async function createCheckout(payload: CheckoutPayload) {
  return api.post<{
    booking: Booking;
    payment_url: string;
    expired_at: string;
    tickets_preview: any[];
    total_tickets: number;
  }>('/checkout', payload);
}

export async function fetchBookingDetail(bookingCode: string) {
  return api.get<BookingDetailResponse>(`/checkout/${encodeURIComponent(bookingCode)}`);
}

export async function cancelBooking(bookingCode: string) {
  return api.post<{ booking: Booking }>(`/checkout/${encodeURIComponent(bookingCode)}/cancel`);
}

export async function syncBookingPaymentStatus(bookingCode: string) {
  return api.post<SyncPaymentStatusResponse>(
    `/checkout/${encodeURIComponent(bookingCode)}/sync-payment-status`,
    {}
  );
}

// ---------- AUTH ----------
export async function loginApi(email: string, password: string) {
  return api.post<{ access_token: string; refresh_token: string; user: User }>('/auth/login', {
    email,
    password,
  });
}

export async function registerApi(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  return api.post<{ user: User; verification_token?: string }>('/auth/register', payload);
}

export async function fetchMeApi() {
  return api.get<User | { user: User }>('/auth/me', {}, { silent: true });
}

export async function verifyEmailApi(token: string) {
  return api.get(`/auth/verify-email/${encodeURIComponent(token)}`);
}

export async function requestPasswordResetApi(email: string) {
  return api.post<{ reset_token?: string }>('/auth/request-password-reset', { email });
}

export async function resetPasswordApi(token: string, new_password: string) {
  return api.post('/auth/reset-password', { token, new_password });
}

// ---------- ADMIN: AGENCIES ----------
export async function fetchAdminAgencies(params?: {
  search?: string;
  page?: number;
  per_page?: number;
}) {
  return api.get<PaginatedResponse<Agency>>('/agencies', params);
}

export async function fetchAdminAgencyDetail(agencyId: number | string) {
  return api.get<Agency>(`/agencies/${agencyId}`);
}

export async function createAdminAgency(payload: {
  name: string;
  pic_name: string;
  email: string;
  phone: string;
  address?: string;
}) {
  return api.post<Agency>('/agencies', payload);
}

export async function updateAdminAgency(
  agencyId: number | string,
  payload: Partial<{
    name: string;
    pic_name: string;
    email: string;
    phone: string;
    address: string | null;
  }>
) {
  return api.put<Agency>(`/agencies/${agencyId}`, payload);
}

export async function deleteAdminAgency(agencyId: number | string) {
  return api.delete(`/agencies/${agencyId}`);
}

export async function uploadAgencyLogo(agencyId: number | string, fileUri: string) {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || 'logo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('logo', { uri: fileUri, name: filename, type } as any);
  return api.upload<Agency>(`/agencies/${agencyId}/logo`, formData);
}

// ---------- ADMIN: EVENTS ----------
export async function fetchAdminEvents(params?: {
  agency_id?: number | string;
  status?: string;
  event_type?: string;
  city?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  return api.get<PaginatedResponse<EventItem>>('/events', params);
}

export async function fetchAdminEventDetail(eventId: number | string) {
  return api.get<EventItem>(`/events/${eventId}`);
}

export async function createAdminEvent(payload: any) {
  return api.post<EventItem>('/events', payload);
}

export async function updateAdminEvent(eventId: number | string, payload: any) {
  return api.put<EventItem>(`/events/${eventId}`, payload);
}

export async function updateAdminEventStatus(eventId: number | string, status: EventStatus) {
  return api.patch<EventItem>(`/events/${eventId}/status`, { status });
}

export async function deleteAdminEvent(eventId: number | string) {
  return api.delete(`/events/${eventId}`);
}

export async function uploadEventMedia(
  eventId: number | string,
  mediaType: 'poster' | 'banner',
  fileUri: string
) {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || `${mediaType}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append(mediaType, { uri: fileUri, name: filename, type } as any);
  return api.upload<EventItem>(`/events/${eventId}/${mediaType}`, formData);
}

// ---------- ADMIN: TICKET PHASES ----------
export async function fetchTicketPhases(ticketTypeId: number | string) {
  return api.get<{
    ticket_type: { id: number; name: string; base_price: number };
    phases: TicketPhase[];
    total: number;
  }>(`/ticket-types/${ticketTypeId}/phases`);
}

export async function createTicketPhase(
  ticketTypeId: number | string,
  payload: {
    phase_name: 'early_bird' | 'presale' | 'normal';
    start_date: string;
    end_date: string;
    discount_percent: number;
  }
) {
  return api.post<TicketPhase>(`/ticket-types/${ticketTypeId}/phases`, payload);
}

export async function updateTicketPhase(
  phaseId: number | string,
  payload: Partial<{
    phase_name: 'early_bird' | 'presale' | 'normal';
    start_date: string;
    end_date: string;
    discount_percent: number;
  }>
) {
  return api.put<TicketPhase>(`/phases/${phaseId}`, payload);
}

export async function deleteTicketPhase(phaseId: number | string) {
  return api.delete(`/phases/${phaseId}`);
}

// ---------- OFFICER SCAN SERVICE (PARITY WITH NEXT.JS) ----------
function trustedTicket(ticket: any) {
  if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket)) return null;
  return Object.fromEntries(
    Object.entries(ticket).filter(
      ([key]) => !['gate', 'seat_section', 'notes', 'note'].includes(key)
    )
  );
}

function hasCode(ticket: any): boolean {
  return typeof ticket?.ticket_code === 'string' && Boolean(ticket.ticket_code.trim());
}

function scanFailure(error: any, code: string) {
  const details = error?.data?.errors || {};
  const rejected =
    [400, 404, 409].includes(error?.status) &&
    ['TIDAK VALID', 'SUDAH DIGUNAKAN'].includes(details.status);
  return {
    success: false,
    status: (rejected ? details.status : 'GAGAL MEMERIKSA') as any,
    code,
    message:
      (typeof error?.data?.message === 'string' && error.data.message) ||
      error?.message ||
      'Gagal menghubungi server. Silakan coba lagi.',
    ticket: trustedTicket(details.ticket),
    first_checked_in_at: details.first_checked_in_at,
    first_checked_in_by: details.first_checked_in_by,
    server_verified: rejected,
  };
}

export async function fetchOfficerStatsAsync() {
  const res = await api.get<{ success_count: number; gate_quota: number }>(
    '/scan/stats',
    {},
    { silent: true }
  );
  const data = res?.data;
  if (
    res?.success !== true ||
    !data ||
    !Number.isInteger(data.success_count) ||
    data.success_count < 0 ||
    !Number.isInteger(data.gate_quota) ||
    data.gate_quota < data.success_count
  ) {
    throw new Error('Respons statistik server tidak sesuai.');
  }
  return { checked_in: data.success_count, valid_or_used: data.gate_quota };
}

export async function fetchScanHistoryWithMeta() {
  try {
    const res = await api.get<any[]>('/scan/history', {}, { silent: true });
    if (
      res?.success !== true ||
      !Array.isArray(res.data) ||
      !res.data.every((item) => hasCode(item) && typeof item.id === 'string')
    ) {
      throw new Error('Respons riwayat server tidak sesuai.');
    }
    return {
      success: true,
      data: res.data.map(trustedTicket),
      total: res.data.length,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Gagal memuat riwayat.',
      data: [],
      total: null,
    };
  }
}

export async function inspectTicketCodeAsync(rawCode: string) {
  const code = typeof rawCode === 'string' ? rawCode.trim() : '';
  if (!code) return scanFailure(new Error('Kode tiket atau QR token wajib diisi.'), code);
  try {
    const res = await api.post<any>('/scan/validate', { code });
    const data = res?.data;
    if (
      res?.success !== true ||
      !['VALID', 'DIBATALKAN', 'SUDAH DIGUNAKAN'].includes(data?.status) ||
      !hasCode(data?.ticket)
    ) {
      throw new Error('Respons validasi server tidak sesuai.');
    }
    return {
      ...data,
      ticket: trustedTicket(data.ticket),
      code: data.code || code,
      message: data.message || res.message,
      server_verified: true,
    };
  } catch (error: any) {
    return scanFailure(error, code);
  }
}

export async function executeCheckIn(ticket: any) {
  const code = typeof ticket === 'string' ? ticket.trim() : ticket?.ticket_code;
  if (typeof code !== 'string' || !code.trim()) {
    return scanFailure(new Error('Kode tiket wajib diisi untuk check-in.'), code || '');
  }
  try {
    const payload = { code };
    const res = await api.post<any>('/scan/check-in', payload);
    if (
      res?.success !== true ||
      !hasCode(res.data) ||
      (typeof ticket === 'object' && res.data.ticket_code !== code) ||
      res.data.status !== 'CHECK-IN SELESAI' ||
      typeof res.data.checked_in_at !== 'string' ||
      !Number.isFinite(Date.parse(res.data.checked_in_at))
    ) {
      throw new Error(
        'Konfirmasi check-in belum dapat dipastikan. Periksa ulang status tiket sebelum mencoba lagi.'
      );
    }
    return {
      success: true,
      status: 'CHECK-IN SELESAI',
      ticket: trustedTicket(res.data),
      message: res.message,
      server_verified: true,
    };
  } catch (error: any) {
    const outcome = scanFailure(error, code);
    if (!outcome.server_verified) {
      outcome.status = 'CHECK-IN BELUM TERKONFIRMASI';
      outcome.message +=
        ' Periksa ulang status tiket sebelum mencoba check-in lagi. Jangan izinkan masuk tanpa konfirmasi server.';
    }
    return outcome;
  }
}
