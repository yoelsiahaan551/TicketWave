# Frontend Page Development Priority - TicketWave

> **Framework:** Next.js  
> **Last Updated:** 2026-11-03

---

## 📋 Table of Contents

1. [Priority Levels Explained](#priority-levels-explained)
2. [Dependency Tree](#dependency-tree)
3. [Page Priority List](#page-priority-list)
4. [Parallel Development Opportunities](#parallel-development-opportunities)
5. [Development Timeline Estimate](#development-timeline-estimate)

---

## 1. Priority Levels Explained

### P0 - Critical (Build First)
Pages yang jadi **fondasi** untuk pages lain. Harus selesai dulu sebelum yang lain bisa dikerjain.

### P1 - High Priority (Core Features)
Pages untuk **core user journey**. Ini yang bikin app functional.

### P2 - Important (Enhanced Experience)
Pages yang **improve UX** tapi bukan blocker untuk launch MVP.

### P3 - Nice to Have (Post-MVP)
Features tambahan yang bisa ditambah **setelah launch**.

---

## 2. Dependency Tree

```
P0: Foundation Pages
├─ Landing Page
├─ Login Page
└─ Register Page
    │
    ├─→ P1: Public User Flow
    │   ├─ Event List Page
    │   ├─ Event Detail Page
    │   ├─ Checkout Page
    │   └─ Booking Status Page
    │
    └─→ P2: Admin Flow (can develop parallel)
        ├─ Admin Dashboard
        ├─ Agency Management
        ├─ Event Management (Create/Edit)
        └─ Ticket Phase Management

P3: Post-MVP
├─ User Profile & History
├─ Officer Dashboard
├─ Kasir Offline
└─ QR Check-in Scanner
```

---

## 3. Page Priority List

### P0 - Foundation (Week 1)

#### 1. Landing Page
**Complexity:** ⭐ Low  
**Dependencies:** None  
**Purpose:** First impression, marketing, call-to-action

**Must Have:**
- Hero section dengan CTA "Cari Event" atau "Lihat Event"
- Featured events (upcoming events)
- How it works section
- Footer dengan links

**APIs Needed:**
- GET /api/public/events?per_page=6 (for featured events)

**State:**
- Local state only (no global state needed)

**Can Start:** Immediately ✅

---

#### 2. Login Page
**Complexity:** ⭐⭐ Medium  
**Dependencies:** None  
**Purpose:** User authentication

**Must Have:**
- Email + password form
- "Forgot Password?" link
- "Don't have account? Register" link
- Error handling (wrong credentials)
- Remember me checkbox (optional)

**APIs Needed:**
- POST /api/auth/login

**State:**
- Global auth state (Zustand): save tokens + user info
- Form state: local

**Can Start:** Immediately ✅

---

#### 3. Register Page
**Complexity:** ⭐⭐ Medium  
**Dependencies:** None  
**Purpose:** User registration

**Must Have:**
- Email, phone, password form
- Password strength indicator
- Terms & conditions checkbox
- Redirect to login after success

**Note:** Email verification skip for now (development mode)

**APIs Needed:**
- POST /api/auth/register

**State:**
- Form state: local
- Success → redirect to login

**Can Start:** Immediately ✅

---

### P1 - Core User Flow (Week 2-3)

#### 4. Event List Page (Public)
**Complexity:** ⭐⭐⭐ Medium-High  
**Dependencies:** Landing page (for navigation)  
**Purpose:** Browse all available events

**Must Have:**
- Grid/list view events
- Filter: city, event_type, date range
- Search bar
- Pagination (12 per page)
- Show: poster, name, city, date, price_from
- Click card → go to detail

**APIs Needed:**
- GET /api/public/events?page=1&per_page=12&city=...
- GET /api/public/events/cities (for filter dropdown)

**State:**
- React Query: cache event list
- Local: filter values, pagination

**Can Start:** After Landing ✅

---

#### 5. Event Detail Page (Public)
**Complexity:** ⭐⭐⭐⭐ High  
**Dependencies:** Event List (for navigation)  
**Purpose:** Show event details & ticket options

**Must Have:**
- Event info: poster, banner, description, date, venue, lineup (if festival)
- Ticket types dengan:
  - Name, description
  - Base price vs final price (show discount badge if active phase)
  - Stock available
  - Quantity selector (1-10)
- "Buy Ticket" button → Checkout
- Sold out indicator kalau stock = 0

**Nice to Have:**
- Image gallery (poster + banner)
- Share button (social media)
- Add to calendar

**APIs Needed:**
- GET /api/public/events/{id}

**State:**
- React Query: cache event detail
- Local: selected quantity per ticket type

**Can Start:** After Event List ✅

---

#### 6. Checkout Page
**Complexity:** ⭐⭐⭐⭐ High  
**Dependencies:** Event Detail (source data)  
**Purpose:** Collect buyer info & create booking

**Must Have:**
- Show summary: event, ticket type, quantity, total price
- Form: buyer_name, buyer_email, buyer_phone
- Optional: recipient_email (kalau beda dengan buyer)
- Show countdown timer kalau ada (15 min expiry nanti setelah booking created)
- "Proceed to Payment" button

**Flow:**
1. User klik "Buy" di Event Detail → bawa data (event_id, ticket_type_id, quantity)
2. User isi form buyer info
3. Submit → create booking
4. Redirect ke Booking Status page atau Payment URL

**APIs Needed:**
- POST /api/checkout

**State:**
- Zustand: cart draft (event_id, ticket_type_id, quantity) - optional
- Local: form inputs
- After checkout success: save booking_code

**Can Start:** After Event Detail ✅

---

#### 7. Booking Status Page
**Complexity:** ⭐⭐⭐ Medium-High  
**Dependencies:** Checkout (source booking_code)  
**Purpose:** Show booking detail & payment status

**Must Have:**
- Booking info: booking_code, status, total_price, expired_at
- Event info: name, date, venue
- Ticket type info
- Countdown timer (15 min until expired)
- Status badge: pending_payment / paid / expired / cancelled
- Payment button (redirect to payment_url) - only show kalau pending
- Ticket list (show all tickets dengan ticket_code & QR) - only show kalau paid

**Nice to Have:**
- Cancel booking button (kalau pending)
- Download e-ticket button (kalau paid) - future

**APIs Needed:**
- GET /api/checkout/{booking_code}
- POST /api/checkout/{booking_code}/cancel (optional)

**State:**
- React Query: fetch booking detail (auto-refetch every 30s kalau pending)
- Local: countdown timer

**Can Start:** After Checkout ✅

---

### P2 - Admin Flow (Week 3-4, Can Parallel with P1)

#### 8. Admin Dashboard
**Complexity:** ⭐⭐⭐ Medium  
**Dependencies:** Login (auth required)  
**Purpose:** Overview stats untuk admin

**Must Have:**
- Total events, agencies, ticket sales
- Revenue summary
- Recent events list
- Quick actions: create event, add agency

**APIs Needed:**
- GET /api/admin/stats (upcoming)
- GET /api/events?per_page=5 (recent)

**Can Start:** After Login (parallel with P1) ✅

---

#### 9. Agency Management Page (Admin)
**Complexity:** ⭐⭐ Medium  
**Dependencies:** Login + Admin Dashboard  
**Purpose:** CRUD agencies

**Must Have:**
- List agencies (table view)
- Create new agency (modal/form)
- Edit agency
- Delete agency (with confirmation)

**APIs Needed:**
- GET /api/agencies
- POST /api/agencies
- PUT /api/agencies/{id}
- DELETE /api/agencies/{id}

**Can Start:** After Admin Dashboard ✅

---

#### 10. Event Management Page (Admin)
**Complexity:** ⭐⭐⭐⭐⭐ Very High  
**Dependencies:** Agency Management (need agency data)  
**Purpose:** Create/edit events

**Must Have:**
- List events (table: name, status, date, agency)
- Create event form:
  - Basic info: name, artist, type (single/festival), venue, city, date/time
  - Upload: poster, banner (Cloudinary)
  - Ticket types (nested): name, base_price, quota, description
  - Festival: days + lineup per day
- Edit event (same form, pre-filled)
- Update status (draft → published → on_sale → ...)
- Delete event

**APIs Needed:**
- GET /api/events
- POST /api/events (multipart/form-data for files)
- GET /api/events/{id}
- PUT /api/events/{id}
- PATCH /api/events/{id}/status
- DELETE /api/events/{id}

**Can Start:** After Agency Management ✅

**Note:** Ini page paling complex! Allocate 4-5 hari.

---

#### 11. Ticket Phase Management (Admin)
**Complexity:** ⭐⭐⭐ Medium-High  
**Dependencies:** Event Management (need ticket_type_id)  
**Purpose:** Add/edit discount phases

**Must Have:**
- List phases for a ticket type
- Create phase: phase_name, start_date, end_date, discount_percent
- Edit phase
- Delete phase
- Validation: prevent overlap dates

**APIs Needed:**
- GET /api/ticket-types/{id}/phases
- POST /api/ticket-types/{id}/phases
- GET /api/phases/{id}
- PUT /api/phases/{id}
- DELETE /api/phases/{id}

**Can Start:** After Event Management ✅

---

### P3 - Post-MVP (Week 5+)

#### 12. User Profile & Booking History
**Complexity:** ⭐⭐⭐ Medium  
**Purpose:** User lihat history & manage profile

**Must Have:**
- User info (email, phone)
- Booking history (list bookings dengan status)
- Click booking → Booking Status page

**APIs Needed:**
- GET /api/user/bookings (upcoming)
- GET /api/auth/me

---

#### 13. Forgot Password Flow
**Complexity:** ⭐⭐ Medium  
**Purpose:** Reset password

**Pages:**
- Request reset (input email)
- Reset password (input new password + token dari email)

**APIs Needed:**
- POST /api/auth/request-password-reset
- POST /api/auth/reset-password

---

#### 14. Officer Dashboard
**Complexity:** ⭐⭐⭐⭐ High  
**Purpose:** Officer manage events & see stats

**Must Have:**
- Sales stats (scoped ke agency officer)
- Event list (only agency events)
- Kasir offline feature
- Check-in feature

---

#### 15. QR Scanner (Officer)
**Complexity:** ⭐⭐⭐⭐ High  
**Purpose:** Check-in tickets via QR scan

**Must Have:**
- Camera access
- Scan QR code
- Validate ticket
- Mark as checked-in

**APIs Needed:**
- POST /api/tickets/check-in (upcoming)

---

## 4. Parallel Development Opportunities

### Team Split Strategy

Kalau ada **2 developers**:

**Developer 1: Public Flow (P0 + P1)**
- Week 1: Landing, Login, Register
- Week 2: Event List, Event Detail
- Week 3: Checkout, Booking Status

**Developer 2: Admin Flow (P2)**
- Week 1: Setup + Admin Dashboard
- Week 2: Agency Management
- Week 3-4: Event Management + Phase Management

### Team Split Strategy (3+ Developers)

**Developer 1: Foundation**
- Landing, Login, Register

**Developer 2: Public User Flow**
- Event List, Detail, Checkout, Booking Status

**Developer 3: Admin Flow**
- Admin Dashboard, Agency, Event, Phase management

---

## 5. Development Timeline Estimate

### MVP Timeline (Full-Time Development)

| Week | Focus | Pages |
|------|-------|-------|
| Week 1 | Foundation | Landing, Login, Register |
| Week 2 | Public Flow | Event List, Event Detail |
| Week 3 | Checkout | Checkout, Booking Status |
| Week 4 | Admin | Dashboard, Agency, Event (Start) |
| Week 5 | Admin | Event (Finish), Phase Management |

**Total:** 5 weeks untuk MVP (1 developer full-time)

**With 2 developers:** 3-4 weeks

---

## 🎯 Recommended Development Order

### Solo Developer

1. ✅ Landing Page (Day 1-2)
2. ✅ Login Page (Day 3)
3. ✅ Register Page (Day 4)
4. ✅ Event List Page (Day 5-6)
5. ✅ Event Detail Page (Day 7-9)
6. ✅ Checkout Page (Day 10-12)
7. ✅ Booking Status Page (Day 13-14)
8. Admin Dashboard (Day 15-16)
9. Agency Management (Day 17-18)
10. Event Management (Day 19-24)
11. Phase Management (Day 25-27)

**Total:** ~27 working days (5-6 weeks)

---

## 📌 Quick Start Recommendation

**Start with these 3 pages (Week 1):**

1. **Landing Page** - Paling simple, no API calls complex
2. **Login Page** - Setup auth state (Zustand), test token flow
3. **Event List Page** - Setup React Query, test API integration

Setelah 3 ini selesai, kamu sudah punya:
- ✅ Routing setup
- ✅ Auth flow working
- ✅ API integration pattern
- ✅ State management setup

Terus lanjut ke Event Detail → Checkout → Booking Status (main user journey).

---

## ❓ Questions?

Refer to:
- **FRONTEND_API_MAPPING.md** - Detailed API per page
- **FRONTEND_USER_FLOWS.md** - User journey & flows
- **FRONTEND_COMPONENT_LIBRARY.md** - Reusable components
