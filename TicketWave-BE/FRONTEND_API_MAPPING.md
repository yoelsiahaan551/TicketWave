# Frontend API Mapping - TicketWave

> **Framework:** Next.js  
> **State Management:** Zustand + React Query  
> **Last Updated:** 2026-11-03

---

## 📋 Table of Contents

1. [API Endpoints Summary](#api-endpoints-summary)
2. [Page-by-Page API Mapping](#page-by-page-api-mapping)
3. [State Management per Page](#state-management-per-page)
4. [API Helper Functions](#api-helper-functions)

---

## 1. API Endpoints Summary

### Public Endpoints (No Auth Required)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/public/events` | GET | List events on sale |
| `/api/public/events/{id}` | GET | Event detail with ticket types |
| `/api/public/events/cities` | GET | Available cities for filter |
| `/api/checkout` | POST | Create booking (guest checkout) |
| `/api/checkout/{booking_code}` | GET | Get booking detail |
| `/api/checkout/{booking_code}/cancel` | POST | Cancel pending booking |

### Auth Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login (get tokens) |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/verify-email/{token}` | GET | Verify email (skip for now) |
| `/api/auth/request-password-reset` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |

### Admin Endpoints (Auth Required: Admin Role)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agencies` | GET | List agencies |
| `/api/agencies` | POST | Create agency |
| `/api/agencies/{id}` | GET | Agency detail |
| `/api/agencies/{id}` | PUT | Update agency |
| `/api/agencies/{id}` | DELETE | Delete agency |
| `/api/events` | GET | List events (all) |
| `/api/events` | POST | Create event |
| `/api/events/{id}` | GET | Event detail |
| `/api/events/{id}` | PUT | Update event |
| `/api/events/{id}/status` | PATCH | Update event status |
| `/api/events/{id}` | DELETE | Delete event |
| `/api/ticket-types/{id}/phases` | GET | List phases |
| `/api/ticket-types/{id}/phases` | POST | Create phase |
| `/api/phases/{id}` | GET | Phase detail |
| `/api/phases/{id}` | PUT | Update phase |
| `/api/phases/{id}` | DELETE | Delete phase |

---

## 2. Page-by-Page API Mapping

### Landing Page

**APIs:**
```
GET /api/public/events?per_page=6
```

**Request:**
```javascript
// Query params
{
  per_page: 6,  // Show only 6 featured events
  page: 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Hindia Live in Jakarta",
        "artist_name": "Hindia",
        "event_date": "2024-12-15",
        "city": "Jakarta",
        "venue": "ICE BSD City",
        "poster_url": "https://...",
        "price_from": 350000.0,
        "status": "on_sale"
      }
    ],
    "total_items": 20
  }
}
```

**State:**
- React Query: `useQuery(['featuredEvents'])`
- No global state needed

**Loading State:**
- Show skeleton cards while fetching
- Error state: "Failed to load events"

---

### Login Page

**APIs:**
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "phone_number": "081234567890",
      "email_verified": false
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": null
}
```

**State:**
- **Zustand (auth store):**
  - Save `access_token`, `refresh_token`
  - Save `user` object
  - Set `isAuthenticated = true`
- Local: form inputs (email, password)

**After Login:**
- Redirect ke halaman sebelumnya atau home
- Kalau admin/officer → redirect ke dashboard

---

### Register Page

**APIs:**
```
POST /api/auth/register
```

**Request:**
```json
{
  "email": "newuser@example.com",
  "phone_number": "081234567890",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "role": "user"
    }
  }
}
```

**Response (Error - Validation):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Email already registered."],
    "password": ["Length must be at least 8."]
  }
}
```

**State:**
- Local: form inputs
- After success: redirect to login page

**Validation (Frontend):**
- Email format
- Password min 8 chars
- Phone number format (08xxx)

---

### Event List Page (Public)

**APIs:**
```
GET /api/public/events
GET /api/public/events/cities
```

**Request (with filters):**
```javascript
// Query params
{
  page: 1,
  per_page: 12,
  city: 'Jakarta',           // optional
  event_type: 'single',      // optional
  search: 'hindia',          // optional
  date_from: '2024-12-01',   // optional
  date_to: '2024-12-31'      // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Hindia Live in Jakarta",
        "artist_name": "Hindia",
        "event_date": "2024-12-15",
        "event_time": "19:00:00",
        "city": "Jakarta",
        "venue": "ICE BSD City",
        "poster_url": "https://...",
        "price_from": 350000.0,
        "status": "on_sale"
      }
    ],
    "page": 1,
    "per_page": 12,
    "total_items": 45,
    "total_pages": 4
  }
}
```

**Cities API Response:**
```json
{
  "success": true,
  "data": {
    "cities": ["Jakarta", "Bandung", "Surabaya", "Yogyakarta"]
  }
}
```

**State:**
- React Query: 
  - `useQuery(['events', { page, city, search, ... }])`
  - `useQuery(['cities'])`
- Local: filter values (city, event_type, search, date_from, date_to, page)

**UI States:**
- Loading: skeleton grid
- Empty: "No events found"
- Error: "Failed to load events" with retry button

---

### Event Detail Page (Public)

**APIs:**
```
GET /api/public/events/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "name": "Hindia Live in Jakarta 2024",
      "artist_name": "Hindia",
      "event_type": "single",
      "event_date": "2024-12-15",
      "event_time": "19:00:00",
      "venue": "ICE BSD City",
      "city": "Jakarta",
      "description": "Konser spesial Hindia dengan full band",
      "poster_url": "https://...",
      "banner_url": "https://...",
      "status": "on_sale"
    },
    "agency": {
      "id": 2,
      "name": "XYZ Entertainment",
      "email": "john@xyz.com",
      "phone": "081234567890"
    },
    "lineup": [],  // Untuk festival
    "ticket_types": [
      {
        "id": 2,
        "name": "Regular",
        "base_price": 350000.0,
        "description": "Standing area",
        "quota": 1500,
        "sold_count": 100,
        "stock_available": 1400,
        "final_price": 350000.0,
        "active_phase": null
      },
      {
        "id": 1,
        "name": "VIP",
        "base_price": 750000.0,
        "description": "VIP seating",
        "quota": 500,
        "sold_count": 50,
        "stock_available": 450,
        "final_price": 675000.0,
        "active_phase": {
          "phase_name": "Early Bird",
          "discount_percent": 10,
          "end_date": "2024-11-30T23:59:59"
        }
      }
    ]
  }
}
```

**State:**
- React Query: `useQuery(['event', eventId])`
- Local: selected ticket quantities per type
  ```javascript
  {
    [ticketTypeId]: quantity  // e.g., { 1: 2, 2: 3 }
  }
  ```

**UI Logic:**
- Show "Sold Out" badge kalau `stock_available === 0`
- Show discount badge kalau `active_phase !== null`
- Disable quantity selector kalau sold out
- Max quantity: 10 atau `stock_available` (whichever is lower)

**Actions:**
- Click "Buy Ticket" → save selected data ke Zustand cart (optional) → navigate to Checkout

---

### Checkout Page

**APIs:**
```
POST /api/checkout
```

**Request:**
```json
{
  "event_id": 1,
  "ticket_type_id": 2,
  "quantity": 2,
  "buyer_name": "John Doe",
  "buyer_email": "john@example.com",
  "buyer_phone": "081234567890",
  "recipient_email": "recipient@example.com"  // optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking created successfully. Please complete payment within 15 minutes.",
  "data": {
    "booking": {
      "id": 2,
      "booking_code": "TKTW-20261103-71AD4D",
      "status": "pending_payment",
      "quantity": 2,
      "unit_price": 350000,
      "total_price": 700000,
      "expired_at": "2026-11-03T06:53:19.122075"
    },
    "payment_url": "https://app.midtrans.com/snap/v2/vtweb/TKTW-20261103-71AD4D",
    "expired_at": "2026-11-03T06:53:19.122075",
    "tickets_preview": [
      {
        "id": 3,
        "ticket_code": "TKT-AEF149AF",
        "status": "valid"
      },
      {
        "id": 4,
        "ticket_code": "TKT-F184A84A",
        "status": "valid"
      }
    ],
    "total_tickets": 2
  }
}
```

**Response (Error - Not Enough Stock):**
```json
{
  "success": false,
  "message": "Not enough stock. Available: 5",
  "errors": null
}
```

**Response (Error - Validation):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "buyer_email": ["Not a valid email address."],
    "quantity": ["Must be between 1 and 10."]
  }
}
```

**State:**
- Zustand (cart): event_id, ticket_type_id, quantity, event_name, ticket_name, unit_price
- Local: form inputs (buyer_name, buyer_email, buyer_phone, recipient_email)
- After success: save `booking_code` to sessionStorage

**After Checkout Success:**
- Option 1: Redirect ke payment_url (Midtrans Snap)
- Option 2: Redirect ke Booking Status page (show booking_code + payment button)

---

### Booking Status Page

**APIs:**
```
GET /api/checkout/{booking_code}
POST /api/checkout/{booking_code}/cancel  (optional)
```

**Get Booking Detail Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": 2,
      "booking_code": "TKTW-20261103-71AD4D",
      "status": "pending_payment",
      "quantity": 2,
      "unit_price": 350000,
      "discount_percent": 0,
      "total_price": 700000,
      "buyer_name": "John Doe",
      "buyer_email": "john@example.com",
      "buyer_phone": "081234567890",
      "expired_at": "2026-11-03T06:53:19.122075",
      "paid_at": null,
      "payment_method": null,
      "created_at": "2026-11-03T06:38:19.132387"
    },
    "event": {
      "id": 1,
      "name": "Hindia Live in Jakarta 2024",
      "event_date": "2024-12-15",
      "event_time": "19:00:00",
      "venue": "ICE BSD City",
      "city": "Jakarta"
    },
    "ticket_type": {
      "id": 2,
      "name": "Regular",
      "base_price": 350000.0
    },
    "tickets": [
      {
        "id": 3,
        "ticket_code": "TKT-AEF149AF",
        "qr_token": "I16LAvPoTkNVR-sCKpq3jVQoUKjALg_PiBT4UmU8eXk",
        "status": "valid",
        "checked_in_at": null
      },
      {
        "id": 4,
        "ticket_code": "TKT-F184A84A",
        "qr_token": "6QslFLK4JLzhVwR14dLdT-XDG79C19RYRU8FYideRuM",
        "status": "valid",
        "checked_in_at": null
      }
    ]
  }
}
```

**Cancel Booking Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "booking_code": "TKTW-20261103-71AD4D",
      "status": "cancelled"
    }
  }
}
```

**State:**
- React Query: `useQuery(['booking', bookingCode], { refetchInterval: 30000 })` 
  - Auto-refetch every 30s kalau status = pending_payment
  - Stop refetch kalau status = paid/expired/cancelled
- Local: countdown timer (dari expired_at)

**UI Logic:**
- Show countdown timer kalau pending_payment
- Show payment button kalau pending_payment
- Show cancel button kalau pending_payment
- Show tickets (dengan QR code) kalau paid
- Show "Booking Expired" kalau status = expired
- Auto-refresh status kalau pending (user balik dari payment gateway)

---

### Admin Dashboard

**APIs:**
```
GET /api/events?per_page=10  (recent events)
GET /api/agencies?per_page=5  (recent agencies)
```

**State:**
- React Query: 
  - `useQuery(['recentEvents'])`
  - `useQuery(['recentAgencies'])`
- No complex state

**Display:**
- Stats cards: total events, total agencies, total bookings (upcoming)
- Recent events table
- Quick actions

---

### Agency Management (Admin)

**APIs:**
```
GET /api/agencies
POST /api/agencies
PUT /api/agencies/{id}
DELETE /api/agencies/{id}
```

**List Request:**
```javascript
// Query params
{
  page: 1,
  per_page: 20
}
```

**List Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "ABC Productions",
        "email": "contact@abc.com",
        "phone": "081234567890",
        "address": "Jakarta",
        "pic_name": "John Doe",
        "logo_url": null,
        "has_officer_account": false,
        "created_at": "2026-10-12T03:36:51.966092"
      }
    ],
    "total_items": 5
  }
}
```

**Create/Update Request:**
```json
{
  "name": "ABC Productions",
  "email": "contact@abc.com",
  "phone": "081234567890",
  "address": "Jakarta",
  "pic_name": "John Doe"
}
```

**State:**
- React Query: `useQuery(['agencies'])`
- React Query mutations:
  - `useMutation(['createAgency'])`
  - `useMutation(['updateAgency'])`
  - `useMutation(['deleteAgency'])`
- Local: form inputs, modal open/close

---

### Event Management (Admin)

**APIs:**
```
GET /api/events
POST /api/events
PUT /api/events/{id}
PATCH /api/events/{id}/status
DELETE /api/events/{id}
```

**Create Event Request (multipart/form-data):**
```javascript
const formData = new FormData();

// JSON data as string
formData.append('data', JSON.stringify({
  agency_id: 2,
  name: "Hindia Live in Jakarta",
  artist_name: "Hindia",
  event_type: "single",
  event_date: "2024-12-15",
  event_time: "19:00:00",
  venue: "ICE BSD City",
  city: "Jakarta",
  description: "Konser spesial...",
  ticket_types: [
    {
      name: "VIP",
      base_price: 750000,
      quota: 500,
      description: "VIP seating",
      phases: [
        {
          phase_name: "Early Bird",
          start_date: "2024-11-01T00:00:00",
          end_date: "2024-11-30T23:59:59",
          discount_percent: 10
        }
      ]
    }
  ]
}));

// Files
formData.append('poster', posterFile);
formData.append('banner', bannerFile);
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": 3,
      "name": "Hindia Live in Jakarta",
      "poster_url": "https://res.cloudinary.com/...",
      "banner_url": "https://res.cloudinary.com/...",
      "status": "draft"
    }
  }
}
```

**Update Status Request:**
```json
{
  "status": "on_sale"
}
```

**State:**
- React Query: `useQuery(['events'])`
- Mutations: create, update, delete, updateStatus
- Local: complex form state (event info, ticket types, phases, files)

**Form Complexity:**
- Multi-step form recommended (Step 1: Basic info, Step 2: Ticket types, Step 3: Upload images)
- Nested arrays: ticket_types, phases, lineup (for festival)

---

### Ticket Phase Management (Admin)

**APIs:**
```
GET /api/ticket-types/{id}/phases
POST /api/ticket-types/{id}/phases
PUT /api/phases/{id}
DELETE /api/phases/{id}
```

**Create Phase Request:**
```json
{
  "phase_name": "Early Bird",
  "start_date": "2024-11-01T00:00:00",
  "end_date": "2024-11-30T23:59:59",
  "discount_percent": 10
}
```

**Response (Error - Overlap):**
```json
{
  "success": false,
  "message": "Phase overlap detected with existing phase: Presale (2024-11-15 to 2024-12-10)",
  "errors": null
}
```

**State:**
- React Query: `useQuery(['phases', ticketTypeId])`
- Mutations: create, update, delete
- Local: form inputs, date range picker

---

## 3. State Management per Page

### Global State (Zustand)

```javascript
// auth store
{
  user: { id, email, role, ... } | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  login: (tokens, user) => void,
  logout: () => void,
  refreshAccessToken: () => Promise<void>
}

// cart store (optional)
{
  selectedEvent: { event_id, event_name, ... } | null,
  selectedTicket: { ticket_type_id, name, price, quantity } | null,
  setCart: (event, ticket) => void,
  clearCart: () => void
}
```

### Server State (React Query)

```javascript
// Featured events (Landing)
useQuery(['featuredEvents'], fetchFeaturedEvents)

// Event list (Public)
useQuery(['events', filters], () => fetchEvents(filters))

// Event detail
useQuery(['event', eventId], () => fetchEvent(eventId))

// Booking detail
useQuery(['booking', bookingCode], () => fetchBooking(bookingCode), {
  refetchInterval: (data) => 
    data?.booking?.status === 'pending_payment' ? 30000 : false
})

// Admin - Agencies
useQuery(['agencies'], fetchAgencies)

// Admin - Events
useQuery(['adminEvents'], fetchAdminEvents)
```

---

## 4. API Helper Functions

### Recommended Structure

```javascript
// lib/api.js

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper: get auth header
export const getAuthHeader = () => {
  const token = // get from Zustand store
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data;
};

// Public API
export const publicApi = {
  getEvents: (params) => apiFetch(`/api/public/events?${new URLSearchParams(params)}`),
  getEventDetail: (id) => apiFetch(`/api/public/events/${id}`),
  getCities: () => apiFetch('/api/public/events/cities'),
};

// Checkout API
export const checkoutApi = {
  createBooking: (data) => apiFetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getBooking: (code) => apiFetch(`/api/checkout/${code}`),
  cancelBooking: (code) => apiFetch(`/api/checkout/${code}/cancel`, {
    method: 'POST',
  }),
};

// Auth API
export const authApi = {
  login: (data) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  register: (data) => apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  refreshToken: (refreshToken) => apiFetch('/api/auth/refresh', {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  }),
};
```

---

## ❓ Questions?

Refer to:
- **PUBLIC_CHECKOUT_API_DOCS.md** - Complete API reference with examples
- **FRONTEND_USER_FLOWS.md** - User journey & page transitions
- **FRONTEND_COMPONENT_LIBRARY.md** - Reusable components
