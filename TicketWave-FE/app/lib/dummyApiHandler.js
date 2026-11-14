/**
 * Dummy API Handler for Local Frontend Testing
 * Memberikan respons data lokal yang realistis untuk dashboard Admin dan User
 * ketika sesi Dummy Auth sedang aktif, sehingga tidak ada request ke endpoint
 * backend terproteksi yang gagal dengan error "Missing Authorization Header".
 *
 * Mendukung persistensi data lokal (localStorage) agar operasi CRUD
 * (Create, Read, Update, Delete, Status Change, Media Upload) tetap tersimpan
 * setelah halaman di-reload (F5) dan konsisten di seluruh halaman Admin & User.
 */

import {
  saveRegisteredDummyUser,
  matchDummyLogin,
  getRegisteredDummyUsers,
  DUMMY_ACCOUNTS,
} from '@/app/lib/dummyAuth';

export const DUMMY_AGENCIES = [
  {
    id: 1,
    name: "Wave Entertainment Indonesia",
    email: "contact@wave-ent.id",
    phone: "081299887766",
    address: "Jl. Sudirman Kav. 52-53, Jakarta Selatan",
    pic_name: "Andi Pratama",
    description: "Promotor festival musik dan konser arena terkemuka di Indonesia.",
    has_officer_account: true,
    created_at: "2026-10-15T08:00:00.000Z",
  },
  {
    id: 2,
    name: "Soundscape Live Productions",
    email: "info@soundscape.live",
    phone: "081122334455",
    address: "Jl. Gatot Subroto No. 18, Bandung",
    pic_name: "Dewi Lestari",
    description: "Spesialis tur konser artis indie dan festival budaya nusantara.",
    has_officer_account: true,
    created_at: "2026-10-20T10:30:00.000Z",
  },
];

export const DUMMY_EVENTS = [
  {
    id: 1,
    name: "TicketWave Festival 2026 — Jakarta",
    artist_name: "Hindia, Feast, Reality Club, Pamungkas",
    event_type: "festival",
    event_date: "2026-12-20",
    event_time: "15:00:00",
    days_count: 2,
    city: "Jakarta",
    venue: "Gelora Bung Karno Senayan",
    description: "Festival musik tahunan terbesar persembahan TicketWave dengan panggung spektakuler dan tata suara modern.",
    status: "on_sale",
    category: "Music Festival",
    poster_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    banner_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
    price_from: 250000,
    agency_id: 1,
    agency: DUMMY_AGENCIES[0],
    ticket_types: [
      { id: 101, name: "Early Bird", price: 250000, base_price: 250000, quota: 500, sold_count: 500, remaining: 0 },
      { id: 102, name: "Presale Festival", price: 400000, base_price: 400000, quota: 1500, sold_count: 1120, remaining: 380 },
      { id: 103, name: "VIP Lounge", price: 850000, base_price: 850000, quota: 300, sold_count: 240, remaining: 60 },
    ],
    festival_artists: [
      { id: 1, day_number: 1, artist_name: "Hindia" },
      { id: 2, day_number: 1, artist_name: "Feast" },
      { id: 3, day_number: 2, artist_name: "Reality Club" },
      { id: 4, day_number: 2, artist_name: "Pamungkas" },
    ],
  },
  {
    id: 2,
    name: "Neon Symphony Arena Tour — Surabaya",
    artist_name: "Weird Genius & Special Guests",
    event_type: "single",
    event_date: "2026-11-28",
    event_time: "19:00:00",
    city: "Surabaya",
    venue: "Grand City Convention Hall",
    description: "Pertunjukan musik elektronik berpadu tata cahaya visual imersif kelas dunia.",
    status: "on_sale",
    category: "Concert",
    poster_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    banner_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80",
    price_from: 350000,
    agency_id: 1,
    agency: DUMMY_AGENCIES[0],
    ticket_types: [
      { id: 201, name: "General Admission", price: 350000, base_price: 350000, quota: 800, sold_count: 480, remaining: 320 },
      { id: 202, name: "VIP Standing", price: 650000, base_price: 650000, quota: 250, sold_count: 195, remaining: 55 },
    ],
  },
  {
    id: 3,
    name: "Sunset Acoustic Session — Bandung",
    artist_name: "Fourtwnty & Danilla",
    event_type: "single",
    event_date: "2026-12-05",
    event_time: "16:30:00",
    city: "Bandung",
    venue: "Dago Tea House Amphitheater",
    description: "Menikmati senja pegunungan Bandung diiringi alunan melodi akustik yang syahdu.",
    status: "published",
    category: "Acoustic",
    poster_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    banner_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80",
    price_from: 180000,
    agency_id: 2,
    agency: DUMMY_AGENCIES[1],
    ticket_types: [
      { id: 301, name: "Tribune", price: 180000, base_price: 180000, quota: 400, sold_count: 110, remaining: 290 },
      { id: 302, name: "Center VIP", price: 320000, base_price: 320000, quota: 150, sold_count: 45, remaining: 105 },
    ],
  },
  {
    id: 4,
    name: "Rock Renaissance Tour — Yogyakarta",
    artist_name: "Barasuara & The Sigit",
    event_type: "single",
    event_date: "2027-01-16",
    event_time: "19:30:00",
    city: "Yogyakarta",
    venue: "Stadion Mandala Krida",
    description: "Konser rock penuh energi yang mengguncang panggung istimewa Yogyakarta.",
    status: "draft",
    category: "Concert",
    poster_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    banner_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
    price_from: 200000,
    agency_id: 2,
    agency: DUMMY_AGENCIES[1],
    ticket_types: [
      { id: 401, name: "Presale 1", price: 200000, base_price: 200000, quota: 600, sold_count: 0, remaining: 600 },
    ],
  },
];

export const DUMMY_PHASES = [
  {
    id: 1,
    phase_name: "early_bird",
    start_date: "2026-11-01",
    end_date: "2026-11-20",
    discount_percent: 15,
    ticket_type_id: 101,
  },
  {
    id: 2,
    phase_name: "presale",
    start_date: "2026-11-21",
    end_date: "2026-12-10",
    discount_percent: 10,
    ticket_type_id: 102,
  },
];

export const DUMMY_ORDERS = [
  {
    id: 5001,
    booking_code: "TW-202611-90021",
    event_id: 1,
    event_name: "TicketWave Festival 2026 — Jakarta",
    event_date: "2026-12-20",
    venue: "Gelora Bung Karno Senayan",
    ticket_type_name: "Presale Festival",
    quantity: 2,
    price_per_ticket: 400000,
    total_amount: 800000,
    status: "completed",
    payment_method: "BCA Virtual Account",
    paid_at: "2026-11-13T10:15:00.000Z",
    created_at: "2026-11-13T10:00:00.000Z",
    tickets: [
      { id: 8001, ticket_code: "TWV-JKT-001889", status: "active", seat: "Festival Standing A" },
      { id: 8002, ticket_code: "TWV-JKT-001890", status: "active", seat: "Festival Standing A" },
    ],
  },
];

export const DUMMY_TICKETS = [
  {
    id: 8001,
    ticket_code: "TWV-JKT-001889",
    order_id: 5001,
    booking_code: "TW-202611-90021",
    event_name: "TicketWave Festival 2026 — Jakarta",
    event_date: "2026-12-20",
    venue: "Gelora Bung Karno Senayan",
    ticket_type_name: "Presale Festival",
    seat: "Festival Standing A",
    qr_code: "TWV-JKT-001889",
    status: "valid",
    user_name: "Tes User",
  },
  {
    id: 8002,
    ticket_code: "TWV-JKT-001890",
    order_id: 5001,
    booking_code: "TW-202611-90021",
    event_name: "TicketWave Festival 2026 — Jakarta",
    event_date: "2026-12-20",
    venue: "Gelora Bung Karno Senayan",
    ticket_type_name: "Presale Festival",
    seat: "Festival Standing A",
    qr_code: "TWV-JKT-001890",
    status: "valid",
    user_name: "Tes User",
  },
];

// Keys for localStorage persistence
const STORAGE_KEY_EVENTS = 'ticketwave_dummy_events';
const STORAGE_KEY_AGENCIES = 'ticketwave_dummy_agencies';
const STORAGE_KEY_PHASES = 'ticketwave_dummy_phases';

export function getStoredEvents() {
  if (typeof window === 'undefined') return [...DUMMY_EVENTS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.some((e) => Array.isArray(e.ticket_types) && e.ticket_types.length > 0)
      ) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(DUMMY_EVENTS));
  } catch {
    // fallback
  }
  return [...DUMMY_EVENTS];
}

export function saveStoredEvents(events) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function getStoredAgencies() {
  if (typeof window === 'undefined') return [...DUMMY_AGENCIES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AGENCIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_AGENCIES, JSON.stringify(DUMMY_AGENCIES));
  } catch {
    // fallback
  }
  return [...DUMMY_AGENCIES];
}

export function saveStoredAgencies(agencies) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_AGENCIES, JSON.stringify(agencies));
  } catch {
    // ignore
  }
}

export function getStoredPhases() {
  if (typeof window === 'undefined') return [...DUMMY_PHASES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHASES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_PHASES, JSON.stringify(DUMMY_PHASES));
  } catch {
    // fallback
  }
  return [...DUMMY_PHASES];
}

export function saveStoredPhases(phases) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PHASES, JSON.stringify(phases));
  } catch {
    // ignore
  }
}

export function updateDummyMedia(id, type, url) {
  const numId = Number(id);
  if (type === 'poster' || type === 'banner') {
    const events = getStoredEvents();
    const idx = events.findIndex(e => e.id === numId);
    if (idx !== -1) {
      if (type === 'poster') events[idx].poster_url = url;
      if (type === 'banner') events[idx].banner_url = url;
      saveStoredEvents(events);
    }
  } else if (type === 'logo') {
    const agencies = getStoredAgencies();
    const idx = agencies.findIndex(a => a.id === numId);
    if (idx !== -1) {
      agencies[idx].logo_url = url;
      saveStoredAgencies(agencies);
    }
  }
}

// Storage keys for extended dummy persistence
const STORAGE_KEY_ORDERS = 'ticketwave_dummy_orders';
const STORAGE_KEY_TICKETS = 'ticketwave_dummy_tickets';
const STORAGE_KEY_KASIR = 'ticketwave_dummy_kasir';
const STORAGE_KEY_FAVORITES = 'ticketwave_dummy_favorites';

export const DUMMY_USERS = [
  {
    id: 9001,
    name: "Admin TicketWave",
    email: "admin@ticketwave.com",
    role: "admin",
    phone: "081999888777",
    email_verified: true,
    created_at: "2026-10-10T08:00:00.000Z",
    is_active: true,
  },
  {
    id: 9006,
    name: "Petugas Scanner",
    email: "officer@ticketwave.com",
    role: "officer",
    phone: "081999000002",
    email_verified: true,
    created_at: "2026-10-12T09:30:00.000Z",
    badge_id: "OFF-2026-084",
    assigned_gate: "Gate A - VIP & Early Bird",
    is_active: true,
  },
  {
    id: 9007,
    name: "Officer Test",
    email: "officer@ticketwave.test",
    role: "officer",
    phone: "081999000012",
    email_verified: true,
    created_at: "2026-10-14T11:00:00.000Z",
    badge_id: "OFF-2026-012",
    assigned_gate: "Gate B - Regular Entry",
    is_active: true,
  },
  {
    id: 9002,
    name: "Test User",
    email: "test@example.com",
    role: "user",
    phone: "081234567890",
    email_verified: true,
    created_at: "2026-10-15T14:20:00.000Z",
    is_active: true,
  },
  {
    id: 9005,
    name: "Tes User",
    email: "user@example.com",
    role: "user",
    phone: "081234567890",
    email_verified: true,
    created_at: "2026-10-16T16:00:00.000Z",
    is_active: true,
  },
  {
    id: 9010,
    name: "Dian Sastrowardoyo",
    email: "dian.sastro@example.com",
    role: "user",
    phone: "081112233445",
    email_verified: true,
    created_at: "2026-10-18T10:15:00.000Z",
    is_active: true,
  },
  {
    id: 9011,
    name: "Reza Rahadian",
    email: "reza.rahadian@example.com",
    role: "user",
    phone: "081122334455",
    email_verified: true,
    created_at: "2026-10-20T11:45:00.000Z",
    is_active: true,
  },
  {
    id: 9012,
    name: "Nicholas Saputra",
    email: "nicholas.s@example.com",
    role: "user",
    phone: "081133445566",
    email_verified: true,
    created_at: "2026-10-22T13:30:00.000Z",
    is_active: true,
  },
  {
    id: 9013,
    name: "Maya Kartika",
    email: "maya.officer@ticketwave.com",
    role: "officer",
    phone: "081144556677",
    email_verified: true,
    created_at: "2026-10-25T08:10:00.000Z",
    badge_id: "OFF-2026-033",
    assigned_gate: "Gate VIP Utara",
    is_active: true,
  },
  {
    id: 9014,
    name: "Hendra Gunawan",
    email: "hendra.admin@ticketwave.com",
    role: "admin",
    phone: "081155667788",
    email_verified: true,
    created_at: "2026-10-28T09:00:00.000Z",
    is_active: true,
  },
];

export const DUMMY_FAVORITES = [
  {
    id: 'fav-1',
    type: 'artist',
    name: 'Hindia',
    genre: 'Indie Rock / Alternative',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    upcoming_events_count: 2,
    added_at: '2026-11-10T12:00:00.000Z',
  },
  {
    id: 'fav-2',
    type: 'artist',
    name: 'Feast',
    genre: 'Rock / Protest',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    upcoming_events_count: 1,
    added_at: '2026-11-11T14:30:00.000Z',
  },
  {
    id: 'fav-3',
    type: 'artist',
    name: 'Weird Genius',
    genre: 'Electronic / Dance',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
    upcoming_events_count: 1,
    added_at: '2026-11-12T09:15:00.000Z',
  },
  {
    id: 'fav-4',
    type: 'event',
    name: 'TicketWave Festival 2026 — Jakarta',
    event_id: 1,
    date: '20 Desember 2026',
    venue: 'Gelora Bung Karno Senayan',
    city: 'Jakarta',
    price_from: 250000,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
    added_at: '2026-11-13T08:00:00.000Z',
  },
];

export const DUMMY_KASIR_TRANSACTIONS = [
  {
    id: 'TXC-202611-0081',
    booking_code: 'TW-CASH-202611-901',
    event_id: 1,
    event_name: 'TicketWave Festival 2026 — Jakarta',
    ticket_type_id: 102,
    ticket_type_name: 'Presale Festival',
    quantity: 2,
    unit_price: 400000,
    total_amount: 800000,
    cash_received: 1000000,
    change_amount: 200000,
    buyer_name: 'Bambang Sudarsono',
    buyer_phone: '081299112233',
    buyer_email: 'bambang.s@gmail.com',
    officer_name: 'Petugas Scanner',
    gate: 'Gate A - Box Office',
    created_at: '2026-11-13T10:15:00.000Z',
    status: 'paid',
    payment_method: 'Tunai (Cash Loket)',
    tickets: [
      { ticket_code: 'TWC-JKT-881201', attendee_name: 'Bambang Sudarsono', status: 'valid' },
      { ticket_code: 'TWC-JKT-881202', attendee_name: 'Bambang Sudarsono', status: 'valid' }
    ]
  }
];

export function getStoredOrders() {
  if (typeof window === 'undefined') return [...DUMMY_ORDERS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(DUMMY_ORDERS));
  } catch {}
  return [...DUMMY_ORDERS];
}

export function saveStoredOrders(orders) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch {}
}

export function getStoredTickets() {
  if (typeof window === 'undefined') return [...DUMMY_TICKETS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(DUMMY_TICKETS));
  } catch {}
  return [...DUMMY_TICKETS];
}

export function saveStoredTickets(tickets) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  } catch {}
}

export function getStoredUsers() {
  let registered = [];
  try {
    registered = getRegisteredDummyUsers();
  } catch {}

  const sanitizedRegistered = (registered || []).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || "-",
    role: u.role || "user",
    email_verified: u.email_verified !== false,
    created_at: u.created_at || new Date().toISOString(),
    is_active: true,
    isDemo: true,
  }));

  const all = [...DUMMY_USERS, ...sanitizedRegistered];
  const unique = [];
  const seen = new Set();
  for (const u of all) {
    const key = (u.email || '').toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(u);
    }
  }
  return unique;
}

export function getStoredKasirTransactions() {
  if (typeof window === 'undefined') return [...DUMMY_KASIR_TRANSACTIONS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KASIR);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_KASIR, JSON.stringify(DUMMY_KASIR_TRANSACTIONS));
  } catch {}
  return [...DUMMY_KASIR_TRANSACTIONS];
}

export function saveStoredKasirTransactions(txs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_KASIR, JSON.stringify(txs));
  } catch {}
}

export function getStoredFavorites() {
  if (typeof window === 'undefined') return [...DUMMY_FAVORITES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(DUMMY_FAVORITES));
  } catch {}
  return [...DUMMY_FAVORITES];
}

export function saveStoredFavorites(favs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favs));
  } catch {}
}

export function processKasirTransaction(body, officerUser = null) {
  const eventId = Number(body.event_id);
  const ticketTypeId = Number(body.ticket_type_id);
  const quantity = Math.max(1, Number(body.quantity || 1));
  const buyerName = (body.buyer_name || '').trim();
  const buyerPhone = (body.buyer_phone || '').trim();
  const buyerEmail = (body.buyer_email || '').trim() || 'cashier@ticketwave.id';
  const cashReceived = Number(body.cash_received || 0);
  const notes = (body.notes || '').trim() || null;

  if (!eventId) {
    return { success: false, status: 400, message: "Pilih event terlebih dahulu." };
  }
  if (!ticketTypeId) {
    return { success: false, status: 400, message: "Pilih kategori tiket terlebih dahulu." };
  }
  if (!buyerName) {
    return { success: false, status: 400, message: "Nama pembeli wajib diisi." };
  }
  if (!buyerPhone) {
    return { success: false, status: 400, message: "No. telepon/WhatsApp pembeli wajib diisi." };
  }

  const events = getStoredEvents();
  const evIdx = events.findIndex(e => e.id === eventId);
  if (evIdx === -1) {
    return { success: false, status: 404, message: "Event tidak ditemukan." };
  }

  const event = events[evIdx];
  if (!Array.isArray(event.ticket_types) || event.ticket_types.length === 0) {
    event.ticket_types = [
      { id: (event.id * 10) + 1, name: "Presale Festival", price: 350000, base_price: 350000, quota: 150, remaining: 85, sold_count: 65, description: "Akses reguler festival area standing" },
      { id: (event.id * 10) + 2, name: "VIP Early Entry", price: 750000, base_price: 750000, quota: 50, remaining: 22, sold_count: 28, description: "Akses barisan depan + lanyard eksklusif" }
    ];
  }

  let ttIdx = (event.ticket_types || []).findIndex(t => t.id === ticketTypeId);
  if (ttIdx === -1) {
    ttIdx = 0;
  }

  const ticketType = event.ticket_types[ttIdx];
  const unitPrice = Number(ticketType.price || ticketType.base_price || 0);
  const totalAmount = unitPrice * quantity;

  // Cek ketersediaan kuota (Rule 5)
  const remaining = ticketType.remaining !== undefined
    ? ticketType.remaining
    : (ticketType.quota - (ticketType.sold_count || 0));

  if (remaining < quantity) {
    return {
      success: false,
      status: 400,
      message: `Kuota tiket tidak mencukupi. Sisa tiket tersedia: ${remaining} tiket.`,
    };
  }

  if (cashReceived < totalAmount) {
    return {
      success: false,
      status: 400,
      message: `Uang tunai kurang. Total tagihan Rp ${totalAmount.toLocaleString('id-ID')}, uang diterima Rp ${cashReceived.toLocaleString('id-ID')}.`,
    };
  }

  const changeAmount = cashReceived - totalAmount;

  // Deduct quota
  ticketType.sold_count = (ticketType.sold_count || 0) + quantity;
  ticketType.remaining = remaining - quantity;
  saveStoredEvents(events);

  // Generate Booking Code & Tickets
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const bookingCode = `TW-CASH-${dateStr}-${randCode}`;

  const generatedTickets = [];
  const storedTickets = getStoredTickets();

  for (let i = 1; i <= quantity; i++) {
    const tktCode = `TW-CASH-${Date.now().toString().slice(-6)}${i}`;
    const tkt = {
      id: Date.now() + i,
      ticket_code: tktCode,
      booking_code: bookingCode,
      event_id: event.id,
      event_name: event.name,
      event_date: event.event_date,
      venue: `${event.venue}, ${event.city}`,
      ticket_type_name: ticketType.name,
      seat: `Box Office Loket #${i}`,
      qr_code: tktCode,
      attendee_name: buyerName,
      status: "valid",
      user_name: buyerName,
      created_at: new Date().toISOString(),
    };
    generatedTickets.push(tkt);
    storedTickets.unshift(tkt);
  }
  saveStoredTickets(storedTickets);

  // Record Transaction
  const kasirTxs = getStoredKasirTransactions();
  const newTx = {
    id: `TXC-${Date.now()}`,
    booking_code: bookingCode,
    event_id: event.id,
    event_name: event.name,
    ticket_type_id: ticketType.id,
    ticket_type_name: ticketType.name,
    quantity,
    unit_price: unitPrice,
    total_amount: totalAmount,
    cash_received: cashReceived,
    change_amount: changeAmount,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    buyer_email: buyerEmail,
    officer_name: officerUser?.name || "Petugas Kasir",
    gate: officerUser?.assigned_gate || "Gate A - Box Office",
    created_at: new Date().toISOString(),
    status: "paid",
    payment_method: "Tunai (Cash Loket)",
    notes,
    tickets: generatedTickets.map(t => ({
      ticket_code: t.ticket_code,
      attendee_name: t.attendee_name,
      status: t.status,
    })),
  };

  kasirTxs.unshift(newTx);
  saveStoredKasirTransactions(kasirTxs);

  // Sync to stored orders
  const orders = getStoredOrders();
  orders.unshift({
    id: Date.now(),
    booking_code: bookingCode,
    event_id: event.id,
    event_name: event.name,
    event_date: event.event_date,
    venue: event.venue,
    ticket_type_name: ticketType.name,
    quantity,
    price_per_ticket: unitPrice,
    total_amount: totalAmount,
    status: "completed",
    payment_method: "Tunai (Cash Loket)",
    paid_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    buyer_email: buyerEmail,
    tickets: generatedTickets,
  });
  saveStoredOrders(orders);

  return {
    success: true,
    status: 201,
    data: {
      transaction: newTx,
      booking: {
        booking_code: bookingCode,
        event_name: event.name,
        buyer_name: buyerName,
        total_amount: totalAmount,
        status: "paid",
      },
      tickets: generatedTickets,
      change_amount: changeAmount,
    },
    message: `Transaksi tunai berhasil! ${quantity} tiket diterbitkan. Kembalian: Rp ${changeAmount.toLocaleString('id-ID')}`,
  };
}

/**
 * Handle endpoint call locally when Dummy Session is active.
 * Return null if endpoint should not be handled locally.
 */
export function handleDummyApiRequest(endpoint, options = {}, demoUser = null) {
  const method = (options.method || 'GET').toUpperCase();
  const cleanEndpoint = endpoint.split('?')[0].replace(/\/$/, '');

  // 0. /auth/login
  if (cleanEndpoint === '/auth/login' && method === 'POST') {
    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    } catch {}

    const email = (body.email || '').trim();
    const password = body.password || '';

    if (!email || !password) {
      return {
        success: false,
        status: 400,
        message: "Email dan password harus diisi.",
      };
    }

    const dummyResult = matchDummyLogin(email, password);
    if (dummyResult.success) {
      return {
        success: true,
        status: 200,
        data: {
          access_token: `dummy_access_token_${dummyResult.user.id}`,
          refresh_token: `dummy_refresh_token_${dummyResult.user.id}`,
          user: dummyResult.user,
        },
        message: "Login berhasil (Demo Mode)",
      };
    } else {
      return {
        success: false,
        status: 400,
        message: dummyResult.message || "Email atau password yang Anda masukkan salah. Silakan periksa kembali.",
      };
    }
  }

  // 0b. /auth/logout
  if (cleanEndpoint === '/auth/logout') {
    return {
      success: true,
      status: 200,
      message: "Logout berhasil (Demo Mode)",
    };
  }

  // 0c. /auth/request-password-reset
  if (cleanEndpoint === '/auth/request-password-reset' && method === 'POST') {
    return {
      success: true,
      status: 200,
      message: "Jika email terdaftar, tautan reset password telah dikirim (Demo Mode).",
    };
  }

  // 0d. /auth/reset-password
  if (cleanEndpoint === '/auth/reset-password' && method === 'POST') {
    return {
      success: true,
      status: 200,
      message: "Password berhasil direset secara lokal (Demo Mode).",
    };
  }

  // 0e. /auth/verify-email
  if (cleanEndpoint.startsWith('/auth/verify-email')) {
    return {
      success: true,
      status: 200,
      message: "Email berhasil diverifikasi (Demo Mode).",
    };
  }

  // 0f. /auth/register
  if (cleanEndpoint === '/auth/register' && method === 'POST') {
    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    } catch {}

    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();
    const password = body.password || '';

    if (!name || !email || !password) {
      return {
        success: false,
        status: 400,
        message: "Nama, email, dan password wajib diisi.",
      };
    }

    const newId = 9100 + Math.floor(Math.random() * 800);
    const newUser = {
      id: newId,
      name,
      email,
      phone,
      password,
      role: "user",
      email_verified: true,
      created_at: new Date().toISOString(),
      isDemo: true,
    };

    saveRegisteredDummyUser(newUser);

    return {
      success: true,
      status: 201,
      data: {
        user: {
          id: newId,
          name,
          email,
          phone,
          role: "user",
        },
        verification_token: `mock_verify_${Date.now()}`,
      },
      message: "Akun berhasil didaftarkan secara lokal (Demo Mode).",
    };
  }

  // 1. /auth/me
  if (cleanEndpoint === '/auth/me') {
    return {
      success: true,
      data: demoUser || {
        id: 9001,
        name: "Admin TicketWave",
        email: "admin@ticketwave.com",
        role: "admin",
      },
      message: "User retrieved (Demo Mode)",
    };
  }

  // 2. /events and /public/events
  if (cleanEndpoint === '/events' || cleanEndpoint === '/public/events') {
    const events = getStoredEvents();
    if (method === 'GET') {
      return {
        success: true,
        data: {
          items: events,
          total_items: events.length,
          page: 1,
          per_page: 50,
          total_pages: 1,
        },
        message: "Events retrieved (Demo Mode)",
      };
    }

    if (method === 'POST') {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch {}

      const newId = Date.now();
      const newEvent = {
        id: newId,
        name: body.name || "Event Baru",
        event_type: body.event_type || "single",
        artist_name: body.artist_name || "",
        event_date: body.event_date || "2026-12-30",
        event_time: body.event_time || "19:00:00",
        days_count: body.days_count || 1,
        venue: body.venue || "Venue",
        city: body.city || "Jakarta",
        description: body.description || "",
        status: body.status || "on_sale",
        category: "Concert",
        price_from: (body.ticket_types?.[0]?.base_price) || 250000,
        agency_id: Number(body.agency_id) || 1,
        poster_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
        banner_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
        ticket_types: (body.ticket_types || []).map((t, idx) => ({
          id: newId * 10 + idx,
          name: t.name || "Regular",
          base_price: Number(t.base_price) || 250000,
          price: Number(t.base_price) || 250000,
          quota: Number(t.quota) || 100,
          sold_count: 0,
          remaining: Number(t.quota) || 100,
        })),
        festival_artists: body.festival_artists || [],
      };

      events.unshift(newEvent);
      saveStoredEvents(events);

      return {
        success: true,
        data: newEvent,
        message: "Event berhasil dibuat secara lokal (Demo Mode).",
      };
    }
  }

  // 3. /public/events/cities
  if (cleanEndpoint === '/public/events/cities') {
    const events = getStoredEvents();
    const cities = Array.from(new Set(events.map(e => e.city).filter(Boolean)));
    return {
      success: true,
      data: { cities },
      message: "Cities retrieved (Demo Mode)",
    };
  }

  // 4. /events/:id or /public/events/:id
  const eventMatch = cleanEndpoint.match(/^\/(?:public\/)?events\/(\d+)$/);
  if (eventMatch) {
    const eventId = Number(eventMatch[1]);
    const events = getStoredEvents();
    const foundIdx = events.findIndex(e => e.id === eventId);
    const found = foundIdx !== -1 ? events[foundIdx] : events[0];

    if (method === 'GET') {
      const agencies = getStoredAgencies();
      const agency = agencies.find(a => a.id === found?.agency_id) || agencies[0];
      return {
        success: true,
        data: {
          ...found,
          event: found,
          agency,
          lineup: found?.festival_artists || [],
          ticket_types: found?.ticket_types || [],
        },
        message: "Event detail retrieved (Demo Mode)",
      };
    }

    if (method === 'PUT') {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch {}

      if (foundIdx !== -1) {
        events[foundIdx] = {
          ...events[foundIdx],
          ...body,
        };
        saveStoredEvents(events);
      }

      return {
        success: true,
        data: events[foundIdx] || found,
        message: "Perubahan event berhasil disimpan (Demo Mode).",
      };
    }

    if (method === 'DELETE') {
      const hasSoldTickets = (found?.ticket_types || []).some(t => (t.sold_count || 0) > 0);
      if (hasSoldTickets) {
        return {
          success: false,
          status: 409,
          message: "Gagal menghapus event. Event yang sudah memiliki penjualan tiket tidak dapat dihapus (HTTP 409).",
        };
      }
      const filtered = events.filter(e => e.id !== eventId);
      saveStoredEvents(filtered);
      return {
        success: true,
        data: { id: eventId },
        message: `Event "${found?.name || eventId}" berhasil dihapus (Demo Mode).`,
      };
    }
  }

  // 5. /events/:id/status
  const statusMatch = cleanEndpoint.match(/^\/events\/(\d+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const eventId = Number(statusMatch[1]);
    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    } catch {}

    const events = getStoredEvents();
    const idx = events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      events[idx].status = body.status || events[idx].status;
      saveStoredEvents(events);
    }

    return {
      success: true,
      data: events[idx],
      message: `Status event berhasil diperbarui menjadi ${body.status} (Demo Mode).`,
    };
  }

  // 6. /agencies
  if (cleanEndpoint === '/agencies') {
    const agencies = getStoredAgencies();
    if (method === 'GET') {
      return {
        success: true,
        data: {
          items: agencies,
          total_items: agencies.length,
          page: 1,
          per_page: 50,
        },
        message: "Agencies retrieved (Demo Mode)",
      };
    }

    if (method === 'POST') {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch {}

      const newId = Date.now();
      const newAgency = {
        id: newId,
        name: body.name || "Agency Baru",
        pic_name: body.pic_name || "PIC Baru",
        email: body.email || "agency@demo.test",
        phone: body.phone || "081234567890",
        address: body.address || "",
        has_officer_account: false,
        created_at: new Date().toISOString(),
      };

      agencies.unshift(newAgency);
      saveStoredAgencies(agencies);

      return {
        success: true,
        data: newAgency,
        message: "Agency berhasil dibuat secara lokal (Demo Mode).",
      };
    }
  }

  // 7. /agencies/:id
  const agencyMatch = cleanEndpoint.match(/^\/agencies\/(\d+)$/);
  if (agencyMatch) {
    const agencyId = Number(agencyMatch[1]);
    const agencies = getStoredAgencies();
    const idx = agencies.findIndex(a => a.id === agencyId);
    const found = idx !== -1 ? agencies[idx] : agencies[0];

    if (method === 'GET') {
      return {
        success: true,
        data: found,
        message: "Agency detail retrieved (Demo Mode)",
      };
    }

    if (method === 'PUT') {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch {}

      if (idx !== -1) {
        agencies[idx] = { ...agencies[idx], ...body };
        saveStoredAgencies(agencies);
      }

      return {
        success: true,
        data: agencies[idx] || found,
        message: "Data agency berhasil diperbarui (Demo Mode).",
      };
    }

    if (method === 'DELETE') {
      const events = getStoredEvents();
      const hasEvents = events.some(e => e.agency_id === agencyId);
      if (hasEvents) {
        return {
          success: false,
          status: 409,
          message: "Gagal menghapus agency. Pastikan agency tidak memiliki event terkait (HTTP 409).",
        };
      }
      const filtered = agencies.filter(a => a.id !== agencyId);
      saveStoredAgencies(filtered);
      return {
        success: true,
        data: { id: agencyId },
        message: `Agency "${found?.name || agencyId}" berhasil dihapus (Demo Mode).`,
      };
    }
  }

  // 8. /ticket-types/:ttId/phases
  const ttPhasesMatch = cleanEndpoint.match(/^\/ticket-types\/(\d+)\/phases$/);
  if (ttPhasesMatch) {
    const ttId = Number(ttPhasesMatch[1]);
    const allPhases = getStoredPhases();

    if (method === 'GET') {
      const filtered = allPhases.filter(p => p.ticket_type_id === ttId);
      return {
        success: true,
        data: {
          phases: filtered,
          total: filtered.length,
          ticket_type: { id: ttId, name: "Kategori Tiket", base_price: 350000 },
        },
        message: "Phases retrieved (Demo Mode)",
      };
    }

    if (method === 'POST') {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch {}

      const newPhase = {
        id: Date.now(),
        phase_name: body.phase_name || "early_bird",
        start_date: body.start_date || "2026-11-20",
        end_date: body.end_date || "2026-11-30",
        discount_percent: Number(body.discount_percent) || 10,
        ticket_type_id: ttId,
      };

      allPhases.push(newPhase);
      saveStoredPhases(allPhases);

      return {
        success: true,
        data: newPhase,
        message: "Fase harga tiket berhasil dibuat (Demo Mode).",
      };
    }
  }

  // 9. /phases/:id
  const phaseMatch = cleanEndpoint.match(/^\/phases\/(\d+)$/);
  if (phaseMatch) {
    const phaseId = Number(phaseMatch[1]);
    const allPhases = getStoredPhases();
    const idx = allPhases.findIndex(p => p.id === phaseId);
    const found = idx !== -1 ? allPhases[idx] : allPhases[0] || DUMMY_PHASES[0];

    if (method === 'GET') {
      return {
        success: true,
        data: found,
        message: "Phase detail retrieved (Demo Mode)",
      };
    }

    if (method === 'PUT') {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch {}

      if (idx !== -1) {
        allPhases[idx] = { ...allPhases[idx], ...body };
        saveStoredPhases(allPhases);
      }

      return {
        success: true,
        data: allPhases[idx] || found,
        message: "Fase harga berhasil diperbarui (Demo Mode).",
      };
    }

    if (method === 'DELETE') {
      const filtered = allPhases.filter(p => p.id !== phaseId);
      saveStoredPhases(filtered);
      return {
        success: true,
        data: { id: phaseId },
        message: "Fase harga berhasil dihapus (Demo Mode).",
      };
    }
  }

  // 9b. /admin/dashboard
  if (cleanEndpoint === '/admin/dashboard' && method === 'GET') {
    const events = getStoredEvents();
    const agencies = getStoredAgencies();
    const orders = getStoredOrders();
    const kasirTxs = getStoredKasirTransactions();

    let soldCount = 0;
    let totalRevenue = 0;

    events.forEach(ev => {
      (ev.ticket_types || []).forEach(tt => {
        const sold = Number(tt.sold_count || 0);
        soldCount += sold;
        totalRevenue += sold * Number(tt.base_price || tt.price || 0);
      });
    });

    const totalBookings = orders.length + kasirTxs.length;

    const recentBookings = [...orders, ...kasirTxs]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        booking_code: o.booking_code,
        event_name: o.event_name,
        buyer_name: o.buyer_name || "Pembeli",
        quantity: o.quantity || 1,
        total_price: o.total_amount || 0,
        status: o.status || "completed",
        created_at: o.created_at || new Date().toISOString(),
      }));

    return {
      success: true,
      status: 200,
      data: {
        metrics: {
          total_events: events.length,
          total_agencies: agencies.length,
          tickets_sold: soldCount,
          total_revenue: totalRevenue,
          total_bookings: totalBookings,
        },
        recent_bookings: recentBookings,
        recent_events: events.slice(0, 5),
        isSimulated: true,
      },
      message: "Dashboard metrics retrieved (Simulasi Demo)",
    };
  }

  // 9c. /users (Admin user management directory)
  if (cleanEndpoint === '/users' && method === 'GET') {
    const allUsers = getStoredUsers();

    // Parse query params safely
    let search = '';
    let roleFilter = 'all';
    let page = 1;
    let perPage = 15;

    if (endpoint.includes('?')) {
      try {
        const queryPart = endpoint.split('?')[1];
        const params = new URLSearchParams(queryPart);
        search = (params.get('search') || '').toLowerCase().trim();
        roleFilter = (params.get('role') || 'all').toLowerCase().trim();
        page = Math.max(1, parseInt(params.get('page') || '1', 10));
        perPage = Math.max(1, parseInt(params.get('per_page') || '15', 10));
      } catch {}
    }

    const filtered = allUsers.filter(u => {
      if (roleFilter !== 'all' && (u.role || '').toLowerCase() !== roleFilter) return false;
      if (search) {
        const nameMatch = (u.name || '').toLowerCase().includes(search);
        const emailMatch = (u.email || '').toLowerCase().includes(search);
        const phoneMatch = (u.phone || '').toLowerCase().includes(search);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    return {
      success: true,
      status: 200,
      data: {
        items: paginated,
        total_items: totalItems,
        page,
        per_page: perPage,
        total_pages: totalPages,
        isSimulated: true,
      },
      message: "User list retrieved (Simulasi Direktori Akun)",
    };
  }

  // 9d. /events/:id/ticket-types (Standalone ticket type creation)
  const createTicketTypeMatch = cleanEndpoint.match(/^\/events\/(\d+)\/ticket-types$/);
  if (createTicketTypeMatch && method === 'POST') {
    const eventId = Number(createTicketTypeMatch[1]);
    const events = getStoredEvents();
    const evIdx = events.findIndex(e => e.id === eventId);

    if (evIdx === -1) {
      return {
        success: false,
        status: 404,
        message: "Event tidak ditemukan",
      };
    }

    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    } catch {}

    const name = (body.name || '').trim();
    const basePrice = Number(body.base_price || 0);
    const quota = Number(body.quota || 0);
    const description = (body.description || '').trim() || null;

    if (!name) {
      return { success: false, status: 422, message: "Nama kategori tiket wajib diisi." };
    }
    if (basePrice <= 0) {
      return { success: false, status: 422, message: "Harga dasar harus lebih besar dari 0." };
    }
    if (quota <= 0) {
      return { success: false, status: 422, message: "Kuota tiket harus lebih besar dari 0." };
    }

    const event = events[evIdx];
    event.ticket_types = event.ticket_types || [];

    const existing = event.ticket_types.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      return {
        success: false,
        status: 409,
        message: `Kategori tiket "${name}" sudah ada pada event ini.`,
      };
    }

    const newTicketType = {
      id: Date.now(),
      name,
      base_price: basePrice,
      price: basePrice,
      quota,
      sold_count: 0,
      remaining: quota,
      description,
      event_id: eventId,
    };

    event.ticket_types.push(newTicketType);
    saveStoredEvents(events);

    return {
      success: true,
      status: 201,
      data: newTicketType,
      message: `Kategori tiket "${name}" berhasil ditambahkan secara lokal (Mode Hybrid).`,
    };
  }

  // 10. /orders, /user/orders, /user/bookings
  if (cleanEndpoint === '/orders' || cleanEndpoint === '/user/orders' || cleanEndpoint === '/user/bookings') {
    if (method === 'GET') {
      const orders = getStoredOrders();
      return {
        success: true,
        data: {
          items: orders,
          total_items: orders.length,
          page: 1,
          per_page: 50,
          total_pages: 1,
          isSimulated: true,
        },
        message: "Orders retrieved (Demo Mode)",
      };
    }
  }

  // 11. /tickets, /user/tickets
  if (cleanEndpoint === '/tickets' || cleanEndpoint === '/user/tickets') {
    if (method === 'GET') {
      const tickets = getStoredTickets();
      return {
        success: true,
        data: {
          items: tickets,
          total_items: tickets.length,
          page: 1,
          per_page: 100,
          total_pages: 1,
          isSimulated: true,
        },
        message: "Tickets retrieved (Demo Mode)",
      };
    }
  }

  // 11b. /kasir/checkout
  if (cleanEndpoint === '/kasir/checkout' && method === 'POST') {
    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    } catch {}

    const result = processKasirTransaction(body, demoUser);
    return result;
  }

  // 11c. /kasir/transactions
  if (cleanEndpoint === '/kasir/transactions' && method === 'GET') {
    const txs = getStoredKasirTransactions();
    return {
      success: true,
      status: 200,
      data: {
        items: txs,
        total_items: txs.length,
        total_revenue: txs.reduce((sum, t) => sum + (t.total_amount || 0), 0),
        total_tickets_sold: txs.reduce((sum, t) => sum + (t.quantity || 0), 0),
        isSimulated: true,
      },
      message: "Riwayat transaksi kasir berhasil diambil (Mode Simulasi)",
    };
  }

  // 11d. /user/favorites
  if (cleanEndpoint === '/user/favorites') {
    if (method === 'GET') {
      const favs = getStoredFavorites();
      return {
        success: true,
        status: 200,
        data: {
          items: favs,
          total_items: favs.length,
          isSimulated: true,
        },
        message: "Favorit pengguna berhasil dimuat",
      };
    }

    if (method === 'POST') {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch {}
      const favs = getStoredFavorites();
      const newFav = {
        id: body.id || `fav-${Date.now()}`,
        type: body.type || 'artist',
        name: body.name || 'Favorit Baru',
        genre: body.genre || null,
        image: body.image || null,
        event_id: body.event_id || null,
        date: body.date || null,
        venue: body.venue || null,
        price_from: body.price_from || null,
        added_at: new Date().toISOString(),
      };
      const existingIdx = favs.findIndex(f => f.name.toLowerCase() === newFav.name.toLowerCase());
      if (existingIdx === -1) {
        favs.unshift(newFav);
        saveStoredFavorites(favs);
      }
      return {
        success: true,
        status: 201,
        data: newFav,
        message: `"${newFav.name}" ditambahkan ke favorit`,
      };
    }
  }

  const deleteFavMatch = cleanEndpoint.match(/^\/user\/favorites\/([^/]+)$/);
  if (deleteFavMatch && method === 'DELETE') {
    const favId = decodeURIComponent(deleteFavMatch[1]);
    const favs = getStoredFavorites();
    const filtered = favs.filter(f => String(f.id) !== favId && f.name !== favId);
    saveStoredFavorites(filtered);
    return {
      success: true,
      status: 200,
      data: { id: favId },
      message: "Item berhasil dihapus dari daftar favorit",
    };
  }

  // 12. /user/profile
  if (cleanEndpoint === '/user/profile') {
    return {
      success: true,
      data: demoUser || {
        id: 9002,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
      message: "Profile retrieved (Demo Mode)",
    };
  }

  // 13. /checkout
  if (cleanEndpoint === '/checkout' && method === 'POST') {
    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    } catch {}
    const bookingCode = `TW-${Date.now().toString(36).toUpperCase()}`;
    return {
      success: true,
      status: 201,
      data: {
        booking_code: bookingCode,
        total_amount: body.total_amount || 350000,
        status: "pending",
        payment_url: null,
      },
      message: "Pesanan berhasil dibuat (Demo Mode).",
    };
  }

  const checkoutCodeMatch = cleanEndpoint.match(/^\/checkout\/([^/]+)$/);
  if (checkoutCodeMatch && method === 'GET') {
    const code = decodeURIComponent(checkoutCodeMatch[1]);
    const matchedOrder = DUMMY_ORDERS.find(o => o.booking_code === code) || DUMMY_ORDERS[0];
    return {
      success: true,
      status: 200,
      data: {
        booking_code: code,
        order_number: code,
        event_name: matchedOrder?.event_name || "TicketWave Festival 2026 — Jakarta",
        venue: matchedOrder?.venue || "Gelora Bung Karno Senayan",
        event_date: matchedOrder?.event_date || "2026-12-20",
        total_amount: matchedOrder?.total_amount || 350000,
        status: matchedOrder?.status || "paid",
        items: [
          { ticket_type_name: matchedOrder?.ticket_type_name || "Presale Festival", quantity: 1, price: 350000 }
        ]
      },
      message: "Checkout data retrieved (Demo Mode)",
    };
  }

  const cancelCheckoutMatch = cleanEndpoint.match(/^\/checkout\/([^/]+)\/cancel$/);
  if (cancelCheckoutMatch && method === 'POST') {
    return {
      success: true,
      status: 200,
      message: "Pesanan berhasil dibatalkan (Demo Mode).",
    };
  }

  // Default fallback for any mutation in demo mode
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return {
      success: true,
      data: { id: Date.now() },
      message: "Operasi berhasil disimpan secara lokal (Demo Mode).",
    };
  }

  // Default fallback for any unhandled GET request in demo mode
  if (method === 'GET') {
    return {
      success: true,
      data: {},
      message: "Data retrieved (Demo Mode Fallback)",
    };
  }

  return null;
}
