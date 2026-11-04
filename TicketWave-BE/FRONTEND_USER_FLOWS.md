# Frontend User Flows - TicketWave

> **Framework:** Next.js  
> **Last Updated:** 2026-11-03

---

## 📋 Table of Contents

1. [Complete User Journey Map](#complete-user-journey-map)
2. [Flow Diagrams](#flow-diagrams)
3. [Decision Trees](#decision-trees)
4. [Page Transitions](#page-transitions)
5. [Error Handling Flows](#error-handling-flows)

---

## 1. Complete User Journey Map

### Journey 1: Guest User - Browse & Buy Ticket

```
1. Landing Page
   ↓ Click "Cari Event" atau "Lihat Semua Event"
   
2. Event List Page
   ↓ Browse, filter by city/date
   ↓ Click event card
   
3. Event Detail Page
   ↓ View ticket options
   ↓ Select ticket type & quantity
   ↓ Click "Beli Tiket"
   
4. Checkout Page
   ↓ Fill buyer info (name, email, phone)
   ↓ Click "Lanjut ke Pembayaran"
   
5. Booking Created
   ↓ Get booking_code
   ↓ Redirect to payment_url (Midtrans) OR Booking Status Page
   
6. [User pays at Midtrans]
   ↓ Payment success
   ↓ Redirect back to app
   
7. Booking Status Page
   ↓ Status = "paid"
   ↓ View tickets with QR codes
   ↓ Download e-ticket (future)
```

**Duration:** ~5-10 minutes (guest user, no registration needed)

---

### Journey 2: New User - Register & Buy Ticket

```
1. Landing Page
   ↓ Click "Daftar" atau "Login"
   
2. Register Page
   ↓ Input email, phone, password
   ↓ Submit
   ↓ Success message: "Registrasi berhasil, silakan login"
   
3. Login Page
   ↓ Input email, password
   ↓ Submit
   ↓ Token saved, redirect to home
   
4. [Continue as Journey 1: Browse & Buy]
   ↓ BUT: user_id akan terisi di booking
   ↓ Future: bisa lihat history di profile
```

**Duration:** ~2-3 minutes untuk register/login + 5-10 minutes untuk booking

---

### Journey 3: Returning User - Check Booking Status

```
1. Landing Page / Any Page
   ↓ User punya booking_code (dari email atau saved)
   
2. Navigate to Booking Status Page
   ↓ URL: /booking/{booking_code}
   ↓ OR: Search form input booking_code
   
3. Booking Status Page
   ↓ View booking detail
   ↓ If pending: countdown timer + payment button
   ↓ If paid: view tickets + download e-ticket
   ↓ If expired: show "Booking sudah kadaluarsa"
```

**Duration:** ~30 seconds (quick check)

---

### Journey 4: Admin - Create Event

```
1. Login as Admin
   ↓ Email: admin@ticketwave.com
   ↓ Password: admin123
   
2. Admin Dashboard
   ↓ Click "Tambah Event"
   
3. Create Event Page - Step 1: Basic Info
   ↓ Select agency
   ↓ Input: name, artist, type, date, venue, city, description
   ↓ Upload poster & banner
   ↓ Click "Next"
   
4. Create Event Page - Step 2: Ticket Types
   ↓ Add ticket type (name, price, quota, description)
   ↓ Add phases (Early Bird, Presale, Normal)
   ↓ Click "Next"
   
5. Create Event Page - Step 3: Review & Submit
   ↓ Preview all data
   ↓ Click "Simpan"
   
6. Event Created (status: draft)
   ↓ Redirect to Event List
   ↓ Admin can update status: draft → published → on_sale
```

**Duration:** ~10-15 minutes

---

### Journey 5: Admin - Manage Ticket Phases

```
1. Admin Dashboard
   ↓ Navigate to Event List
   
2. Event List Page
   ↓ Click event name
   
3. Event Detail / Edit Page
   ↓ View ticket types
   ↓ Click "Manage Phases" on a ticket type
   
4. Phase Management Modal/Page
   ↓ View existing phases (Early Bird, Presale, Normal)
   ↓ Click "Add Phase"
   
5. Add Phase Form
   ↓ Input: phase_name, start_date, end_date, discount_percent
   ↓ Validation: check overlap dates
   ↓ Submit
   
6. Phase Created
   ↓ Update phase list
   ↓ Frontend recalculate active phase
   ↓ Public sees new price
```

---

## 2. Flow Diagrams

### Checkout Flow (Detailed)

```
START: User di Event Detail Page
  |
  ├─ Select ticket type & quantity
  |
  ├─ Click "Beli Tiket"
  |
  ├─ Navigate to Checkout Page
  |     ├─ Show summary (event, ticket, quantity, price)
  |     └─ Show form (buyer info)
  |
  ├─ User fill form
  |     ├─ buyer_name
  |     ├─ buyer_email
  |     ├─ buyer_phone
  |     └─ recipient_email (optional)
  |
  ├─ Click "Lanjut ke Pembayaran"
  |
  ├─ API: POST /api/checkout
  |     |
  |     ├─ SUCCESS (201)
  |     |   ├─ Get booking_code
  |     |   ├─ Get payment_url
  |     |   ├─ Stock reserved (15 min)
  |     |   └─ Tickets created
  |     |
  |     └─ ERROR (400/404)
  |         ├─ Validation error → show field errors
  |         ├─ Not enough stock → show alert, adjust quantity
  |         └─ Event not available → redirect to event list
  |
  ├─ After success: TWO OPTIONS
  |
  ├─ OPTION A: Redirect to payment_url (Midtrans Snap)
  |     ├─ User pay at Midtrans
  |     ├─ Midtrans webhook update booking status
  |     └─ Redirect back to /booking/{booking_code}
  |
  └─ OPTION B: Redirect to Booking Status Page
        ├─ Show booking_code
        ├─ Show countdown (15 min)
        ├─ Show "Pay Now" button (link to payment_url)
        └─ User click "Pay Now" → open payment_url
```

---

### Payment Flow (with Midtrans)

```
START: Booking created (status: pending_payment)
  |
  ├─ User click "Pay Now" button
  |
  ├─ Redirect to payment_url (Midtrans Snap)
  |     ├─ User select payment method
  |     ├─ User complete payment
  |     └─ Payment success/fail
  |
  ├─ Midtrans send webhook to backend
  |     ├─ POST /api/checkout/payment/notification
  |     ├─ Backend update booking status
  |     |   ├─ settlement → paid
  |     |   ├─ pending → pending_payment
  |     |   └─ expire/cancel → cancelled (stock returned)
  |     └─ Backend send e-ticket email (future)
  |
  ├─ Midtrans redirect user back to app
  |     └─ URL: /booking/{booking_code}?status=success
  |
  └─ Booking Status Page
        ├─ Auto-fetch booking (React Query refetch)
        ├─ Status updated to "paid"
        ├─ Show tickets with QR codes
        └─ Show success message
```

---

### Booking Expiry Flow

```
START: Booking created with expired_at (15 min)
  |
  ├─ Frontend show countdown timer
  |
  ├─ Every second: calculate remaining time
  |
  ├─ IF time remaining > 0
  |   ├─ Show: "Selesaikan pembayaran dalam XX:XX"
  |   └─ Payment button enabled
  |
  ├─ IF time remaining = 0 (expired)
  |   ├─ Show: "Booking sudah kadaluarsa"
  |   ├─ Payment button disabled
  |   └─ Suggest: "Silakan buat booking baru"
  |
  └─ Backend auto-update on next GET request
        ├─ Check: expired_at < now
        ├─ Update status: pending_payment → expired
        ├─ Return stock
        └─ Response: booking.status = "expired"
```

---

### Token Refresh Flow

```
START: User make API request
  |
  ├─ API call with access_token
  |
  ├─ Response: 401 Unauthorized (token expired)
  |
  ├─ Frontend detect 401
  |
  ├─ Call refresh token API
  |     ├─ POST /api/auth/refresh
  |     ├─ Headers: Authorization: Bearer {refresh_token}
  |     |
  |     ├─ SUCCESS
  |     |   ├─ Get new access_token
  |     |   ├─ Update Zustand auth store
  |     |   └─ Retry original request with new token
  |     |
  |     └─ ERROR (401)
  |         ├─ Refresh token expired/invalid
  |         ├─ Clear auth store (logout)
  |         ├─ Redirect to login
  |         └─ Show: "Sesi berakhir, silakan login lagi"
  |
  └─ Original request success with new token
```

---

## 3. Decision Trees

### Should User Login or Continue as Guest?

```
User at Checkout Page
  |
  ├─ Is user logged in?
  |
  ├─ YES
  |   ├─ Pre-fill form from user profile (email, phone)
  |   ├─ user_id will be saved in booking
  |   └─ Future: booking auto-saved to user history
  |
  └─ NO (Guest)
      ├─ Show form empty (user must fill manually)
      ├─ user_id = null in booking
      ├─ Booking identified by booking_code only
      └─ Future: option to "Simpan ke akun" (create account)
```

**Recommendation:**
- **Allow guest checkout** (lower friction, higher conversion)
- Show optional "Login untuk checkout lebih cepat" banner
- After payment success, offer "Buat akun untuk lihat history"

---

### What to Show Based on Booking Status?

```
GET /api/checkout/{booking_code}
  |
  ├─ status = "pending_payment"
  |   ├─ Show countdown timer
  |   ├─ Show "Pay Now" button (link to payment_url)
  |   ├─ Show "Cancel Booking" button
  |   └─ Auto-refetch every 30s (check if user paid)
  |
  ├─ status = "paid"
  |   ├─ Show success message
  |   ├─ Show tickets with QR codes
  |   ├─ Show "Download E-Ticket" button (future)
  |   └─ No countdown, no payment button
  |
  ├─ status = "expired"
  |   ├─ Show "Booking sudah kadaluarsa"
  |   ├─ Show "Buat Booking Baru" button (link to event detail)
  |   └─ No actions available
  |
  └─ status = "cancelled"
      ├─ Show "Booking dibatalkan"
      ├─ Show reason (kalau ada)
      └─ Show "Buat Booking Baru" button
```

---

### Navigation After Login

```
User login successfully
  |
  ├─ Check user role
  |
  ├─ role = "admin"
  |   └─ Redirect to: /admin/dashboard
  |
  ├─ role = "officer"
  |   └─ Redirect to: /officer/dashboard
  |
  └─ role = "user"
      ├─ Check: is there a redirect URL? (from protected page)
      |
      ├─ YES
      |   └─ Redirect to: saved URL (e.g., /checkout)
      |
      └─ NO
          └─ Redirect to: / (home/landing)
```

---

## 4. Page Transitions

### Animation Recommendations

```
Landing → Event List
  └─ Fade in + slide up

Event List → Event Detail
  └─ Fade in + scale up (modal-like) OR full page transition

Event Detail → Checkout
  └─ Slide left (next step feeling)

Checkout → Booking Status
  └─ Fade in + success animation (checkmark)

Booking Status (pending) → (paid)
  └─ Confetti animation + success message
```

---

### URL Structure

```
Public Pages:
  /                           → Landing
  /events                     → Event List
  /events/{id}                → Event Detail
  /checkout                   → Checkout (with state/query params)
  /booking/{booking_code}     → Booking Status
  /login                      → Login
  /register                   → Register

Admin Pages:
  /admin/dashboard            → Admin Dashboard
  /admin/agencies             → Agency Management
  /admin/events               → Event Management
  /admin/events/create        → Create Event
  /admin/events/{id}/edit     → Edit Event
  /admin/events/{id}/phases   → Manage Phases

Future (User Profile):
  /profile                    → User Profile
  /profile/bookings           → Booking History
  /profile/tickets            → My Tickets
```

---

### Navigation Guards

```javascript
// Protect admin routes
/admin/*
  └─ Require: isAuthenticated && role === "admin"
  └─ If not: redirect to /login?redirect=/admin/...

// Protect user routes (future)
/profile/*
  └─ Require: isAuthenticated
  └─ If not: redirect to /login?redirect=/profile

// Public routes (no guard)
/, /events, /events/{id}, /checkout, /booking/{code}
  └─ Anyone can access
```

---

## 5. Error Handling Flows

### API Call Failed

```
API request failed
  |
  ├─ Check error status
  |
  ├─ 400 (Bad Request)
  |   ├─ Validation error
  |   └─ Show field errors below inputs
  |
  ├─ 401 (Unauthorized)
  |   ├─ Try refresh token
  |   └─ If fail: redirect to login
  |
  ├─ 403 (Forbidden)
  |   ├─ Show "Access Denied"
  |   └─ Redirect to home
  |
  ├─ 404 (Not Found)
  |   ├─ Show "Resource not found"
  |   └─ Offer back button
  |
  └─ 500 (Server Error)
      ├─ Show "Terjadi kesalahan, coba lagi"
      └─ Offer retry button
```

---

### Network Error (Offline)

```
Network request failed
  |
  ├─ Show toast: "Tidak ada koneksi internet"
  |
  ├─ Disable submit buttons
  |
  └─ Listen for online event
      └─ When online: show "Koneksi pulih" + enable buttons
```

---

### Form Validation Error

```
User submit form
  |
  ├─ Frontend validation first
  |   ├─ Email format
  |   ├─ Required fields
  |   └─ Min/max length
  |
  ├─ If invalid
  |   ├─ Highlight error fields (red border)
  |   ├─ Show error messages below inputs
  |   └─ Prevent API call
  |
  └─ If valid
      └─ Proceed to API call
```

---

### Stock Not Available During Checkout

```
User submit checkout form
  |
  ├─ API: POST /api/checkout
  |
  └─ Response: 400 "Not enough stock. Available: 5"
      |
      ├─ Show alert/toast with error message
      |
      ├─ Update quantity selector max value (to 5)
      |
      └─ Suggest user to:
          ├─ Reduce quantity
          └─ OR choose different ticket type
```

---

### Booking Expired While User at Payment Page

```
User at Midtrans payment page
  |
  ├─ User takes > 15 minutes
  |
  ├─ Booking expired in backend
  |
  ├─ User complete payment
  |
  ├─ Midtrans webhook to backend
  |
  └─ Backend: booking.status = "expired"
      |
      ├─ Backend reject payment (or auto-refund)
      |
      └─ User redirect back to app
          |
          └─ Booking Status Page
              ├─ Show: "Booking sudah kadaluarsa"
              ├─ Show: "Pembayaran tidak dapat diproses"
              └─ Suggest: "Silakan buat booking baru"
```

**Prevention:**
- Show prominent countdown timer before payment
- Warn user at 5 min remaining
- Disable payment after expire

---

## 🎯 UX Best Practices

### Loading States
- Show skeleton loaders during data fetch
- Disable buttons during API calls (prevent double submit)
- Show spinner on button: "Loading..."

### Success Feedback
- Toast notification: "Booking berhasil dibuat!"
- Confetti animation saat payment success
- Success checkmark icon

### Error Feedback
- Toast for general errors (top-right corner)
- Inline errors for form fields (below input)
- Alert modal for critical errors (payment failed)

### Empty States
- Event list empty: "Belum ada event tersedia"
- Search no results: "Tidak ditemukan event dengan kata kunci '{query}'"
- Booking history empty: "Anda belum pernah membeli tiket"

### Progressive Disclosure
- Multi-step form untuk create event (jangan overwhelming user)
- Collapsible sections untuk event detail (description, lineup, terms)
- Modal untuk confirm actions (delete, cancel)

---

## ❓ Questions?

Refer to:
- **FRONTEND_API_MAPPING.md** - API details per page
- **FRONTEND_COMPONENT_LIBRARY.md** - Reusable components
- **FRONTEND_PAGE_PRIORITY.md** - Development sequence
