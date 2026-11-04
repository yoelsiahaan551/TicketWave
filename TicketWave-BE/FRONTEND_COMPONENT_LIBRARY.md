# Frontend Component Library - TicketWave

> **Framework:** Next.js  
> **Component Strategy:** Reusable, Composable, Accessible  
> **Last Updated:** 2026-11-03

---

## 📋 Table of Contents

1. [Component Architecture](#component-architecture)
2. [Core Components](#core-components)
3. [Feature Components](#feature-components)
4. [Layout Components](#layout-components)
5. [Component Dependencies](#component-dependencies)
6. [Accessibility Guidelines](#accessibility-guidelines)

---

## 1. Component Architecture

### Component Hierarchy

```
App
├─ Layout Components
│  ├─ Header (Navigation)
│  ├─ Footer
│  └─ Sidebar (Admin only)
│
├─ Core Components (Build First)
│  ├─ Button
│  ├─ Input
│  ├─ Card
│  ├─ Badge
│  ├─ Modal
│  ├─ Toast/Alert
│  └─ Loading (Spinner, Skeleton)
│
└─ Feature Components (Build After Core)
   ├─ EventCard
   ├─ EventDetail
   ├─ TicketTypeCard
   ├─ CheckoutSummary
   ├─ BookingStatusCard
   ├─ CountdownTimer
   ├─ QRCodeDisplay
   └─ FilterBar
```

---

## 2. Core Components

### Button

**Purpose:** Standard button untuk semua actions

**Variants:**
- Primary (call-to-action)
- Secondary (outline)
- Danger (delete, cancel)
- Ghost (subtle actions)

**Props:**
```typescript
{
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled: boolean
  loading: boolean  // Show spinner
  fullWidth: boolean
  onClick: () => void
  children: React.ReactNode
}
```

**Use Cases:**
- "Beli Tiket", "Lanjut ke Pembayaran" (primary)
- "Cancel", "Kembali" (secondary)
- "Hapus Event" (danger)
- "Edit", "Detail" (ghost)

**States:**
- Default
- Hover
- Active (pressed)
- Disabled
- Loading (spinner inside button)

---

### Input

**Purpose:** Form input untuk text, email, password, number

**Variants:**
- Text
- Email
- Password (with show/hide toggle)
- Number
- Tel (phone number)
- Textarea

**Props:**
```typescript
{
  type: 'text' | 'email' | 'password' | 'number' | 'tel'
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error: string | null  // Show error message
  required: boolean
  disabled: boolean
  icon: React.ReactNode  // Left icon
}
```

**Use Cases:**
- Login form (email, password)
- Register form (email, phone, password)
- Checkout form (buyer info)
- Event form (name, description, etc.)

**States:**
- Default
- Focus (blue border)
- Error (red border + error message below)
- Disabled (gray background)

---

### Card

**Purpose:** Container untuk group related content

**Variants:**
- Default (border + shadow)
- Elevated (more shadow, hover effect)
- Flat (no border, no shadow)

**Props:**
```typescript
{
  variant: 'default' | 'elevated' | 'flat'
  padding: 'sm' | 'md' | 'lg'
  hoverable: boolean  // Add hover effect
  onClick: () => void  // Make clickable
  children: React.ReactNode
}
```

**Use Cases:**
- EventCard (list item)
- TicketTypeCard
- BookingStatusCard
- Dashboard stat cards

---

### Badge

**Purpose:** Status indicator atau tag

**Variants:**
- Success (green) - "paid", "on_sale"
- Warning (yellow) - "pending_payment"
- Danger (red) - "expired", "cancelled"
- Info (blue) - "draft", "published"
- Discount (purple) - "10% OFF"

**Props:**
```typescript
{
  variant: 'success' | 'warning' | 'danger' | 'info' | 'discount'
  size: 'sm' | 'md'
  children: React.ReactNode
}
```

**Use Cases:**
- Booking status badge
- Event status badge
- Discount badge (active phase)
- Stock status ("Sold Out", "Tersisa 5")

---

### Modal

**Purpose:** Dialog untuk confirmations, forms, details

**Props:**
```typescript
{
  isOpen: boolean
  onClose: () => void
  title: string
  size: 'sm' | 'md' | 'lg' | 'xl'
  footer: React.ReactNode  // Action buttons
  children: React.ReactNode
}
```

**Use Cases:**
- Delete confirmation
- Create/edit forms (agency, phase)
- Image preview
- Terms & conditions

**Features:**
- Close on backdrop click
- Close button (X)
- Keyboard ESC to close
- Scroll inside modal body
- Focus trap (accessibility)

---

### Toast / Alert

**Purpose:** Temporary notifications

**Variants:**
- Success (green checkmark)
- Error (red X)
- Warning (yellow !)
- Info (blue i)

**Props:**
```typescript
{
  variant: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration: number  // Auto-dismiss after ms
  onClose: () => void
}
```

**Use Cases:**
- "Booking berhasil dibuat!"
- "Event berhasil dihapus"
- "Gagal memuat data, coba lagi"
- "Koneksi internet terputus"

**Position:** Top-right corner, stack multiple toasts

---

### Loading States

#### Spinner

**Purpose:** Loading indicator untuk buttons, full page

**Props:**
```typescript
{
  size: 'sm' | 'md' | 'lg'
  color: string
}
```

**Use Cases:**
- Inside button saat submit
- Center of page saat initial load
- Inside card saat refetch

#### Skeleton

**Purpose:** Content placeholder during load

**Components:**
- SkeletonText (shimmer lines)
- SkeletonCard (event card shape)
- SkeletonImage (image placeholder)

**Use Cases:**
- Event list loading
- Event detail loading
- Booking status loading

---

## 3. Feature Components

### EventCard

**Purpose:** Display event in grid/list

**Props:**
```typescript
{
  event: {
    id: number
    name: string
    artist_name: string
    event_date: string
    city: string
    venue: string
    poster_url: string
    price_from: number
    status: string
  }
  onClick: (id: number) => void
}
```

**Layout:**
```
┌─────────────────────┐
│   [Poster Image]    │
│                     │
├─────────────────────┤
│ Event Name          │
│ Artist Name         │
│ 📍 City, Venue      │
│ 📅 Date             │
│ 💰 Mulai dari Rp... │
│ [Badge: On Sale]    │
└─────────────────────┘
```

**States:**
- Default
- Hover (scale up slightly + shadow)
- Sold Out (gray overlay)

---

### TicketTypeCard

**Purpose:** Display ticket option di event detail

**Props:**
```typescript
{
  ticketType: {
    id: number
    name: string
    description: string
    base_price: number
    final_price: number
    stock_available: number
    active_phase: {
      phase_name: string
      discount_percent: number
      end_date: string
    } | null
  }
  selectedQuantity: number
  onQuantityChange: (quantity: number) => void
  onBuyClick: () => void
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ VIP                   [10% OFF]     │
│ Rp 750.000  →  Rp 675.000          │
│                                     │
│ VIP seating with exclusive access   │
│                                     │
│ Tersisa: 450 / 500                  │
│                                     │
│ Jumlah: [ - ] [ 1 ] [ + ]          │
│         [    Beli Tiket    ]        │
└─────────────────────────────────────┘
```

**Features:**
- Show discount badge kalau active_phase
- Show strike-through base_price kalau discount
- Quantity selector (1-10 atau stock_available)
- Disable kalau sold out
- Show countdown kalau phase ending soon

---

### CheckoutSummary

**Purpose:** Summary di checkout page

**Props:**
```typescript
{
  event: { name, date, venue }
  ticketType: { name, quantity, unit_price }
  totalPrice: number
}
```

**Layout:**
```
┌─────────────────────────────────┐
│ Ringkasan Pesanan               │
├─────────────────────────────────┤
│ Event: Hindia Live in Jakarta   │
│ Tanggal: 15 Des 2024            │
│ Venue: ICE BSD City             │
│                                 │
│ Tiket: Regular x 2              │
│ Harga: Rp 350.000 x 2           │
│                                 │
├─────────────────────────────────┤
│ Total: Rp 700.000               │
└─────────────────────────────────┘
```

---

### BookingStatusCard

**Purpose:** Display booking info di booking status page

**Props:**
```typescript
{
  booking: {
    booking_code: string
    status: string
    quantity: number
    total_price: number
    expired_at: string
    payment_url: string
  }
  event: { name, date, venue }
  onPayClick: () => void
  onCancelClick: () => void
}
```

**Layout (Pending):**
```
┌──────────────────────────────────────┐
│ Booking Code: TKTW-20261103-71AD4D   │
│ [Badge: Pending Payment]             │
│                                      │
│ ⏱️  Selesaikan pembayaran dalam:     │
│     14:32                            │
│                                      │
│ Event: Hindia Live in Jakarta        │
│ Tiket: Regular x 2                   │
│ Total: Rp 700.000                    │
│                                      │
│ [   Bayar Sekarang   ] [  Batal  ]  │
└──────────────────────────────────────┘
```

**Layout (Paid):**
```
┌──────────────────────────────────────┐
│ Booking Code: TKTW-20261103-71AD4D   │
│ [Badge: Paid] ✅                      │
│                                      │
│ ✨ Pembayaran berhasil!               │
│                                      │
│ Event: Hindia Live in Jakarta        │
│ Tiket: Regular x 2                   │
│                                      │
│ Tiket Anda:                          │
│ ┌────────────────┐                  │
│ │ [QR Code]      │ TKT-AEF149AF     │
│ └────────────────┘                  │
│ ┌────────────────┐                  │
│ │ [QR Code]      │ TKT-F184A84A     │
│ └────────────────┘                  │
│                                      │
│ [   Download E-Ticket   ]            │
└──────────────────────────────────────┘
```

---

### CountdownTimer

**Purpose:** Display remaining time untuk booking expiry

**Props:**
```typescript
{
  expiresAt: string  // ISO date string
  onExpire: () => void  // Callback when timer hits 0
}
```

**Display:**
- Format: "14:32" (MM:SS)
- Color: green (> 5 min), yellow (2-5 min), red (< 2 min)
- Update every second

**States:**
- Active (counting down)
- Expired ("00:00" + disabled)
- Warning (< 5 min, pulse animation)

---

### QRCodeDisplay

**Purpose:** Display QR code untuk ticket

**Props:**
```typescript
{
  ticketCode: string
  qrToken: string
  size: number  // QR code size in px
}
```

**Layout:**
```
┌─────────────────┐
│                 │
│   [QR Code]     │
│                 │
├─────────────────┤
│ TKT-AEF149AF    │
└─────────────────┘
```

**Library:** `qrcode.react` atau `react-qr-code`

**Use Cases:**
- Booking status page (show all tickets)
- Ticket detail modal
- E-ticket PDF (future)

---

### FilterBar

**Purpose:** Filter events di event list page

**Props:**
```typescript
{
  filters: {
    city: string
    event_type: string
    date_from: string
    date_to: string
    search: string
  }
  cities: string[]  // Available cities
  onFilterChange: (filters) => void
  onReset: () => void
}
```

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [Search: "hindia"          ] [🔍]                    │
│                                                      │
│ [City: Jakarta ▼] [Type: All ▼] [Date: Any ▼]      │
│                                                      │
│ [   Reset Filters   ]                                │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Dropdown untuk city (from API: /api/public/events/cities)
- Dropdown untuk event_type (single, festival, all)
- Date range picker untuk date_from & date_to
- Search input dengan debounce (wait 500ms before API call)
- Reset button (clear all filters)

---

## 4. Layout Components

### Header (Navigation)

**Purpose:** Top navigation bar

**Layout (Guest):**
```
┌──────────────────────────────────────────────┐
│ [Logo] TicketWave    [Events]  [Login] [Daftar] │
└──────────────────────────────────────────────┘
```

**Layout (Logged In User):**
```
┌──────────────────────────────────────────────────┐
│ [Logo] TicketWave  [Events]  [👤 Profile ▼]      │
│                                - Profile           │
│                                - Booking History   │
│                                - Logout            │
└──────────────────────────────────────────────────┘
```

**Layout (Admin):**
```
┌──────────────────────────────────────────────────┐
│ [Logo] TicketWave  [Dashboard]  [👤 Admin ▼]     │
│                                 - Dashboard        │
│                                 - Events           │
│                                 - Agencies         │
│                                 - Logout           │
└──────────────────────────────────────────────────┘
```

**Features:**
- Responsive (burger menu on mobile)
- Sticky on scroll
- Active link highlight

---

### Footer

**Purpose:** Bottom footer dengan links & info

**Layout:**
```
┌──────────────────────────────────────────────┐
│                                              │
│ TicketWave                                   │
│ Smart Digital Ticketing for Concerts         │
│                                              │
│ [About] [Contact] [Terms] [Privacy]         │
│                                              │
│ © 2024 TicketWave. All rights reserved.     │
└──────────────────────────────────────────────┘
```

---

### Sidebar (Admin Only)

**Purpose:** Side navigation untuk admin pages

**Layout:**
```
┌────────────────┐
│ TicketWave     │
├────────────────┤
│ 📊 Dashboard   │
│ 🏢 Agencies    │
│ 🎫 Events      │
│ 📈 Reports     │
│ ⚙️  Settings   │
└────────────────┘
```

**Features:**
- Collapsible on mobile
- Active page highlight
- Icon + label

---

## 5. Component Dependencies

### Build Order (Priority)

**Week 1 - Core Components:**
1. Button
2. Input
3. Card
4. Badge
5. Modal
6. Toast
7. Spinner & Skeleton

**Week 2 - Layout:**
1. Header
2. Footer
3. Sidebar (admin)

**Week 3 - Feature Components:**
1. EventCard (untuk landing & list page)
2. FilterBar (untuk event list)
3. TicketTypeCard (untuk event detail)

**Week 4 - Advanced Features:**
1. CheckoutSummary
2. CountdownTimer
3. BookingStatusCard
4. QRCodeDisplay

---

### Component Dependency Graph

```
Button
  └─ Used by: ALL components

Input
  └─ Used by: Forms, FilterBar, Search

Card
  ├─ EventCard
  ├─ TicketTypeCard
  ├─ BookingStatusCard
  └─ Dashboard stat cards

Badge
  ├─ EventCard (status)
  ├─ TicketTypeCard (discount)
  └─ BookingStatusCard (status)

Modal
  ├─ Delete confirmations
  ├─ Create/edit forms
  └─ Image preview

CountdownTimer
  └─ BookingStatusCard

QRCodeDisplay
  └─ BookingStatusCard (when paid)

FilterBar
  ├─ Input (search)
  └─ Dropdown components
```

---

## 6. Accessibility Guidelines

### Keyboard Navigation
- All interactive elements focusable with Tab
- Modal trap focus (Tab cycles inside modal)
- ESC closes modals
- Enter submits forms

### Screen Readers
- Proper ARIA labels: `aria-label`, `aria-labelledby`
- Live regions for toasts: `role="alert"`
- Form errors announced: `aria-describedby`
- Loading states: `aria-busy="true"`

### Color Contrast
- Text on background: min 4.5:1 ratio (WCAG AA)
- Interactive elements: min 3:1 ratio
- Don't rely on color alone (use icons + text)

### Focus States
- Visible focus ring (blue outline)
- Consistent across all components
- Don't remove outline (use custom styling)

### Semantic HTML
- Use `<button>` for actions (not `<div onClick>`)
- Use `<a>` for links (not `<button>`)
- Use `<form>` for forms
- Use `<label>` for inputs

### Error Messages
- Clear, specific error messages
- Associate with inputs: `aria-describedby`
- Announce errors to screen readers

---

## 🎨 Design System Reference

### Color Palette (Recommendation)

**Primary:**
- Primary 500: #3B82F6 (blue, for buttons, links)
- Primary 600: #2563EB (hover state)

**Status Colors:**
- Success: #10B981 (green)
- Warning: #F59E0B (yellow)
- Danger: #EF4444 (red)
- Info: #3B82F6 (blue)

**Neutral:**
- Gray 50: #F9FAFB (background)
- Gray 100: #F3F4F6 (card background)
- Gray 500: #6B7280 (text secondary)
- Gray 900: #111827 (text primary)

### Typography

**Font Family:**
- Sans: `Inter, system-ui, sans-serif`
- Mono: `'Courier New', monospace` (for booking codes)

**Font Sizes:**
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)

**Font Weights:**
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

### Spacing

Use multiples of 4px:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius

- sm: 4px (buttons, inputs)
- md: 8px (cards)
- lg: 12px (modals)
- full: 9999px (badges, avatars)

---

## 📚 Component Library Recommendations

Consider using existing UI libraries for faster development:

**Option 1: Headless UI + Tailwind CSS** ⭐ RECOMMENDED
- Headless UI: unstyled accessible components (Modal, Dropdown)
- Tailwind CSS: utility-first CSS
- Full control over styling
- Lightweight

**Option 2: shadcn/ui**
- Copy-paste components (not npm package)
- Built with Radix UI + Tailwind
- Customizable, modern design

**Option 3: Chakra UI**
- Complete component library
- Great accessibility
- More opinionated styling

**Option 4: Build from Scratch**
- Full control
- More time investment
- Good learning experience

---

## ❓ Questions?

Refer to:
- **FRONTEND_PAGE_PRIORITY.md** - Which pages need which components
- **FRONTEND_API_MAPPING.md** - Data structure for components
- **FRONTEND_USER_FLOWS.md** - User interactions with components
