# 📚 Frontend Documentation - Complete Guide

> **Created:** 2026-11-03  
> **Framework:** Next.js  
> **Backend:** Flask REST API

---

## 🎯 Overview

Dokumentasi lengkap untuk frontend team TicketWave. Semua yang dibutuhkan untuk develop frontend dari awal sampai launch MVP.

---

## 📄 Available Documents

### 1. **FRONTEND_DEVELOPMENT_GUIDE.md** 
**Start Here!** ⭐

**Contents:**
- Backend architecture overview
- Authentication flow (traditional email + password)
- API standards & conventions
- Response format & error handling
- State management recommendations (Zustand + React Query)

**Read this first** untuk understand backend structure & API patterns.

---

### 2. **FRONTEND_PAGE_PRIORITY.md**
**Development Roadmap**

**Contents:**
- Priority levels (P0, P1, P2, P3)
- Dependency tree (page mana blocker page lain)
- Parallel development opportunities
- Timeline estimates (solo vs team)
- Recommended build order

**Use this** untuk planning sprint & task allocation.

---

### 3. **FRONTEND_API_MAPPING.md**
**API Reference per Page**

**Contents:**
- Complete endpoint list (public, auth, admin)
- Request/response examples per page
- State management strategy per page
- API helper function recommendations
- Error handling per endpoint

**Use this** saat implement API calls di setiap page.

---

### 4. **FRONTEND_USER_FLOWS.md**
**User Journey & Interactions**

**Contents:**
- Complete user journey maps (5 journeys)
- Detailed flow diagrams (checkout, payment, token refresh)
- Decision trees (login or guest? show what based on status?)
- Page transitions & URL structure
- Error handling flows

**Use this** untuk understand UX & page transitions.

---

### 5. **FRONTEND_COMPONENT_LIBRARY.md**
**Reusable Components Guide**

**Contents:**
- Component architecture & hierarchy
- Core components (Button, Input, Card, Modal, etc.)
- Feature components (EventCard, CheckoutSummary, etc.)
- Layout components (Header, Footer, Sidebar)
- Component build order & dependencies
- Accessibility guidelines
- Design system reference

**Use this** untuk build component library & maintain consistency.

---

### 6. **AUTH_OAUTH_FUTURE_NOTES.md**
**OAuth Google Implementation (Future)**

**Contents:**
- Why add OAuth Google (benefits)
- Architecture design (hybrid auth system)
- Database schema changes needed
- Backend implementation guide (Authlib)
- Frontend implementation guide
- Google Cloud setup steps
- Testing plan & migration strategy

**Use this** kalau nanti mau implement "Sign in with Google" (post-MVP).

---

## 🚀 Quick Start Guide

### For Solo Developer

**Week 1: Foundation**
1. Read: `FRONTEND_DEVELOPMENT_GUIDE.md`
2. Setup Next.js project + Zustand + React Query
3. Build: Landing, Login, Register pages
4. Test: Auth flow (login, token storage)

**Week 2: Public Flow**
1. Read: `FRONTEND_USER_FLOWS.md` (Journey 1)
2. Build: Event List, Event Detail pages
3. Test: API integration, filters, pagination

**Week 3: Checkout**
1. Read: `FRONTEND_API_MAPPING.md` (Checkout & Booking sections)
2. Build: Checkout, Booking Status pages
3. Test: Full flow (browse → checkout → payment)

**Week 4-5: Admin**
1. Build: Admin Dashboard, Agency, Event Management
2. Test: CRUD operations, file upload

**Total:** 5-6 weeks untuk MVP (solo)

---

### For Team (2+ Developers)

**Split Work:**

**Developer 1: Public Flow (3 weeks)**
- Week 1: Landing, Login, Register
- Week 2: Event List, Event Detail
- Week 3: Checkout, Booking Status

**Developer 2: Admin Flow (3 weeks)**
- Week 1: Setup, Admin Dashboard
- Week 2: Agency Management
- Week 3: Event Management, Phase Management

**Result:** MVP ready in 3 weeks!

---

## 📖 Reading Order

### First-Time Setup
1. `FRONTEND_DEVELOPMENT_GUIDE.md` - Understand backend & auth
2. `FRONTEND_PAGE_PRIORITY.md` - Plan development sequence
3. `FRONTEND_COMPONENT_LIBRARY.md` - Build core components

### During Development
1. `FRONTEND_API_MAPPING.md` - Reference saat implement API calls
2. `FRONTEND_USER_FLOWS.md` - Reference saat implement page transitions

### Future Planning
1. `AUTH_OAUTH_FUTURE_NOTES.md` - When ready to add OAuth Google

---

## 🔗 Related Backend Docs

Backend documentation yang juga penting:

- **PUBLIC_CHECKOUT_API_DOCS.md** - Detailed API docs untuk public & checkout
- **TICKET_PHASE_API_DOCS.md** - Ticket phase management API
- **AUTH_API_DOCS.md** - Authentication endpoints detail
- **PROJECT_HANDOFF.md** - Overall project status & tech stack

---

## 💡 Key Decisions Summary

### Tech Stack (Recommended)
- **Framework:** Next.js (App Router atau Pages Router)
- **State Management:** Zustand (persistent state) + React Query (server state)
- **UI Library:** Headless UI + Tailwind CSS (lightweight, customizable)
- **HTTP Client:** Built-in fetch or axios
- **Form Handling:** React Hook Form (optional)

### Authentication
- **Method:** Traditional email + password (for now)
- **Token Storage:** Zustand store + localStorage
- **Token Type:** JWT (access token + refresh token)
- **Expiry:** Access token 2 days, Refresh token 30 days
- **Future:** OAuth Google (post-MVP)

### API Integration
- **Base URL:** `http://localhost:5000` (dev), TBD (production)
- **Response Format:** `{ success, message, data }` atau `{ success, message, errors }`
- **Error Handling:** Try refresh token on 401, redirect to login if refresh fails
- **Caching:** React Query handles caching & refetching

### UX Patterns
- **Guest Checkout:** Allowed (no login required)
- **Booking Expiry:** 15 minutes countdown timer
- **Loading States:** Skeleton loaders + spinners
- **Error States:** Toast notifications + inline errors
- **Empty States:** Friendly messages + CTA buttons

---

## 🎨 Design System (Quick Reference)

### Colors
- Primary: #3B82F6 (blue)
- Success: #10B981 (green)
- Warning: #F59E0B (yellow)
- Danger: #EF4444 (red)
- Neutral: Gray scale 50-900

### Typography
- Font: Inter, system-ui
- Sizes: xs (12px) to 3xl (30px)
- Weights: 400, 500, 600, 700

### Spacing
- Scale: 4px, 8px, 16px, 24px, 32px, 48px
- Use Tailwind classes: p-4, m-8, space-y-4

### Components
- Border radius: 4px (buttons), 8px (cards), 12px (modals)
- Shadows: sm, md, lg
- Transitions: 150ms ease-in-out

---

## 📊 Progress Tracking

### Page Checklist

**P0 - Foundation:**
- [ ] Landing Page
- [ ] Login Page
- [ ] Register Page

**P1 - Core User Flow:**
- [ ] Event List Page
- [ ] Event Detail Page
- [ ] Checkout Page
- [ ] Booking Status Page

**P2 - Admin Flow:**
- [ ] Admin Dashboard
- [ ] Agency Management
- [ ] Event Management
- [ ] Phase Management

**P3 - Post-MVP:**
- [ ] User Profile & History
- [ ] Forgot Password
- [ ] OAuth Google

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Auth flow (register, login, refresh token)
- [ ] Public flow (browse events, view detail)
- [ ] Checkout flow (guest checkout)
- [ ] Payment flow (with Midtrans sandbox)
- [ ] Booking status (pending, paid, expired)
- [ ] Admin CRUD (agency, event, phase)

### Edge Cases
- [ ] Token expired during form submit
- [ ] Network error during API call
- [ ] Booking expired while at payment page
- [ ] Stock sold out during checkout
- [ ] Invalid booking code
- [ ] Concurrent requests (create multiple bookings)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## ❓ FAQ

### Q: Harus pakai Zustand + React Query? Bisa pakai Redux?
**A:** Bisa. Zustand + React Query adalah rekomendasi karena lightweight & simple. Redux Toolkit juga ok, tapi lebih banyak boilerplate.

### Q: Harus pakai Tailwind CSS?
**A:** Tidak harus. Tailwind recommended karena fast & utility-first. Bisa pakai CSS Modules, Styled Components, atau UI library lain (Chakra UI, MUI).

### Q: Bisa pakai App Router atau Pages Router?
**A:** Bebas. App Router lebih modern (Next.js 13+), Pages Router lebih stable & banyak resources. Pilih yang team lebih familiar.

### Q: Email verification harus diimplementasi sekarang?
**A:** Tidak. Backend sudah ada endpoint-nya, tapi email belum dikirim (SMTP not configured). Skip dulu untuk development. Production nanti setup SMTP.

### Q: Payment URL masih dummy, gimana test payment flow?
**A:** Sementara bisa mock payment success (manual update booking status via API atau database). Production nanti integrate Midtrans Snap API beneran.

### Q: Perlu implement file upload di frontend?
**A:** Ya, untuk admin create/edit event (poster & banner). Pakai FormData + multipart/form-data. Lihat `FRONTEND_API_MAPPING.md` section "Event Management".

---

## 🆘 Need Help?

### Documentation
- Check the 6 markdown files above
- Backend docs: `PUBLIC_CHECKOUT_API_DOCS.md`, `AUTH_API_DOCS.md`
- Project overview: `PROJECT_HANDOFF.md`

### Testing Backend API
- Run Flask server: `flask run`
- Test endpoints: Postman, curl, atau Python requests
- Check backend logs for errors

### Common Issues
- **CORS error:** Backend CORS should be open (check `app/config/config.py`)
- **401 Unauthorized:** Check token format `Bearer <token>`
- **404 Not Found:** Check API base URL & endpoint path
- **500 Server Error:** Check backend logs for Python errors

---

## 🎉 Ready to Build!

You have everything you need to start building the frontend. Follow the docs, build step by step, and test frequently. Good luck! 🚀

**Start with:** `FRONTEND_DEVELOPMENT_GUIDE.md`

**Questions?** Re-read the docs or ask for clarification!

---

**Last Updated:** 2026-11-03  
**Docs Version:** 1.0  
**Backend Progress:** ~60% (Public browsing + Checkout done)  
**Frontend Progress:** 0% (Ready to start!)
