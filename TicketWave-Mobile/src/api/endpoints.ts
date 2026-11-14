import api from './client';
import {
  Agency,
  Booking,
  BookingDetailResponse,
  CheckoutPayload,
  EventDetailResponse,
  EventItem,
  EventStatus,
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
