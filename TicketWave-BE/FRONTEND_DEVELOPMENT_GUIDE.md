# Frontend Development Guide - TicketWave

> **Target Framework:** Next.js  
> **Recommended State Management:** Zustand + React Query  
> **Backend:** Flask REST API  
> **Last Updated:** 2026-11-03

---

## 📋 Table of Contents

1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [API Standards](#api-standards)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [File Upload](#file-upload)
7. [State Management Recommendation](#state-management-recommendation)

---

## 1. Backend Architecture Overview

### Tech Stack Backend

| Layer | Technology |
|-------|------------|
| Framework | Flask |
| Database | Supabase PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Marshmallow |
| Auth | JWT (Flask-JWT-Extended) |
| File Storage | Cloudinary |
| Payment | Midtrans (upcoming) |

### API Base URL

```
Development: http://localhost:5000
Production: TBD (will be deployed to Railway)
```

### User Roles

- **Admin** - Full access, manage all events & agencies
- **Officer** - Manage events dari agency sendiri, kasir, check-in
- **User** - Browse events, beli tiket, lihat history (upcoming)

---

## 2. Authentication Flow

### Traditional Email + Password (Current Implementation)

TicketWave menggunakan **traditional authentication** (email + password), **bukan OAuth Google** untuk sekarang.

#### Registration Flow

```
1. User input: email, phone_number, password (min 8 chars)
   POST /api/auth/register

2. Backend:
   - Create user (role: "user")
   - Generate email verification token
   - Return success (email verification pending)
   
3. Email verification (SKIP FOR NOW):
   - Backend belum kirim email (SMTP not configured)
   - Frontend bisa skip verification untuk development
   - Production nanti akan kirim email verification

4. User bisa langsung login (verification check temporarily disabled)
```

#### Login Flow

```
1. User input: email, password
   POST /api/auth/login

2. Backend return:
   {
     "access_token": "eyJ...",
     "refresh_token": "eyJ...",
     "user": {
       "id": 1,
       "email": "user@example.com",
       "role": "user",
       "email_verified": false
     }
   }

3. Frontend:
   - Save access_token (for API calls)
   - Save refresh_token (for token refresh)
   - Save user info (for UI personalization)

4. Use access_token di header:
   Authorization: Bearer <access_token>
```

#### Token Expiry

- **Access Token:** 2 days
- **Refresh Token:** 30 days

#### Token Refresh Flow

```
1. Access token expired (API return 401)
2. Call POST /api/auth/refresh
   Headers: Authorization: Bearer <refresh_token>
3. Get new access_token
4. Retry original request with new token
```

#### Protected Endpoints

Endpoint yang butuh authentication:
- Admin endpoints: `/api/agencies`, `/api/events` (POST/PUT/DELETE), `/api/ticket-types`, `/api/phases`
- User endpoints (upcoming): `/api/user/bookings`, `/api/user/tickets`

Endpoint yang **TIDAK** butuh authentication:
- Public event browsing: `/api/public/events`
- Checkout: `/api/checkout` (guest checkout allowed)

---

## 3. API Standards

### HTTP Methods

| Method | Usage |
|--------|-------|
| GET | Retrieve data (list or detail) |
| POST | Create new resource |
| PUT | Update entire resource |
| PATCH | Partial update (e.g., status change) |
| DELETE | Remove resource |

### Common Headers

```
Content-Type: application/json
Authorization: Bearer <access_token>  (for protected endpoints)
```

### Pagination (for List Endpoints)

Query parameters:
```
?page=1&per_page=12
```

Response includes:
```json
{
  "data": {
    "items": [...],
    "page": 1,
    "per_page": 12,
    "total_items": 45,
    "total_pages": 4
  }
}
```

### Filtering & Search

Common query params:
```
?search=hindia          # Search in name/artist
?city=Jakarta           # Filter by city
?event_type=single      # Filter by type
?date_from=2024-12-01   # Filter date range
?date_to=2024-12-31
```

---

## 4. Response Format

### Success Response

**Status: 200, 201**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

**Status: 400, 401, 403, 404, 500**

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": ["Error detail"]
  }
}
```

atau

```json
{
  "success": false,
  "message": "Error message",
  "errors": null
}
```

### HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, business logic error |
| 401 | Unauthorized | Token missing, invalid, or expired |
| 403 | Forbidden | User tidak punya akses (wrong role) |
| 404 | Not Found | Resource tidak ditemukan |
| 500 | Server Error | Backend error (rare, check backend logs) |

---

## 5. Error Handling

### Common Error Scenarios

#### 1. Validation Error (400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Not a valid email address."],
    "password": ["Length must be at least 8."]
  }
}
```

**Frontend should:**
- Display field-specific errors below each input
- Highlight invalid fields

#### 2. Authentication Error (401)

```json
{
  "success": false,
  "message": "Token has expired",
  "errors": null
}
```

**Frontend should:**
- Try refresh token first
- If refresh fails, redirect to login
- Clear stored tokens

#### 3. Permission Error (403)

```json
{
  "success": false,
  "message": "Admin access required",
  "errors": null
}
```

**Frontend should:**
- Show "Access Denied" message
- Redirect to home or appropriate page

#### 4. Not Found (404)

```json
{
  "success": false,
  "message": "Event not found",
  "errors": null
}
```

**Frontend should:**
- Show 404 page atau "Resource not found"
- Offer link back to list/home

#### 5. Business Logic Error (400)

```json
{
  "success": false,
  "message": "Not enough stock. Available: 5",
  "errors": null
}
```

**Frontend should:**
- Show error message in toast/alert
- Allow user to adjust quantity

---

## 6. File Upload

### Upload Poster/Banner (Cloudinary)

**Endpoint:** `POST /api/events` or `PUT /api/events/<id>`

**Format:** `multipart/form-data`

**Fields:**
- Regular fields as JSON string in `data` field
- Files as separate fields: `poster`, `banner`

**Example structure:**
```
Content-Type: multipart/form-data

data: {"name": "Event Name", "city": "Jakarta", ...}
poster: <file binary>
banner: <file binary>
```

**Accepted formats:**
- jpg, jpeg, png, gif, webp
- Max size: 5MB per file

**Response includes:**
```json
{
  "poster_url": "https://res.cloudinary.com/...",
  "banner_url": "https://res.cloudinary.com/..."
}
```

**Frontend should:**
- Use FormData API
- Show upload progress
- Preview image before upload
- Show uploaded image URL

---

## 7. State Management Recommendation

### Recommended Stack: Zustand + React Query

#### Why This Combo?

**Zustand** untuk **persistent/client state:**
- User authentication (token, user info)
- Cart/checkout draft (selected tickets sebelum checkout)
- UI preferences

**React Query** untuk **server state:**
- Event list, event detail
- Booking status
- User history
- Auto-caching & background refetch
- Loading & error states handled automatically

#### State Categories

| State Type | Library | Examples |
|------------|---------|----------|
| Authentication | Zustand | User, tokens, isLoggedIn |
| Checkout Draft | Zustand | Selected tickets, quantity |
| Server Data | React Query | Events, bookings, tickets |
| UI State | React useState | Modal open/close, form inputs |

#### Benefits

1. **Separation of Concerns**
   - Persistent state (Zustand) vs Server state (React Query)
   - Clear boundary antara local draft vs fetched data

2. **Next.js Friendly**
   - Both work dengan App Router & Pages Router
   - SSR compatible

3. **Developer Experience**
   - Minimal boilerplate
   - Easy debugging
   - TypeScript support

4. **Performance**
   - Small bundle size
   - Smart caching (React Query)
   - Prevent unnecessary re-renders

---

## 📚 Next Steps

After reading this guide, check out:

1. **FRONTEND_PAGE_PRIORITY.md** - Urutan development pages
2. **FRONTEND_API_MAPPING.md** - Endpoint apa aja yang dibutuhkan per page
3. **FRONTEND_USER_FLOWS.md** - User journey dari landing sampai checkout
4. **FRONTEND_COMPONENT_LIBRARY.md** - Reusable components yang perlu dibuat

---

## 🔮 Future: OAuth Google

Untuk sekarang pakai traditional auth (email + password). OAuth Google akan diimplementasi nanti sebagai **login alternatif**.

See: **AUTH_OAUTH_FUTURE_NOTES.md** untuk planning OAuth integration.

---

## ❓ Questions?

Refer to:
- Full API docs: `PUBLIC_CHECKOUT_API_DOCS.md`, `TICKET_PHASE_API_DOCS.md`, `AUTH_API_DOCS.md`
- Backend implementation: `PUBLIC_CHECKOUT_IMPLEMENTATION_SUMMARY.md`
- Project overview: `PROJECT_HANDOFF.md`
