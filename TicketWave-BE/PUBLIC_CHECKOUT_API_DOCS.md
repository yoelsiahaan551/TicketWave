# Public Event Browsing & Checkout API Documentation

Dokumentasi lengkap untuk endpoint publik (browsing event) dan checkout tiket.

---

## 📋 Daftar Isi

1. [Public Event Endpoints](#public-event-endpoints)
2. [Checkout Endpoints](#checkout-endpoints)
3. [Flow Diagram](#flow-diagram)
4. [Testing Examples](#testing-examples)

---

## Public Event Endpoints

### 1. List Events (Public)

**Endpoint:** `GET /api/public/events`

**Deskripsi:** List semua event yang sedang dijual (status: `on_sale`). Tidak perlu authentication.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | No | Filter by city (case-insensitive) |
| `event_type` | string | No | Filter by type: `single` atau `festival` |
| `search` | string | No | Cari di name atau artist_name |
| `date_from` | string | No | Filter event_date >= date (format: YYYY-MM-DD) |
| `date_to` | string | No | Filter event_date <= date (format: YYYY-MM-DD) |
| `page` | integer | No | Halaman (default: 1) |
| `per_page` | integer | No | Items per page (default: 12) |

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event list retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Hindia Live in Jakarta 2024",
        "artist_name": "Hindia",
        "event_type": "single",
        "event_date": "2024-12-15",
        "event_time": "19:00:00",
        "venue": "ICE BSD City",
        "city": "Jakarta",
        "status": "on_sale",
        "price_from": 350000.0,
        "poster_url": null,
        "banner_url": null,
        "description": "Konser spesial Hindia",
        "agency_id": 2,
        "created_at": "2026-10-12T03:40:04.279132"
      }
    ],
    "page": 1,
    "per_page": 12,
    "total_items": 1,
    "total_pages": 1
  }
}
```

**Field Penting:**
- `price_from`: Harga termurah (sudah termasuk diskon aktif kalau ada)

---

### 2. Get Event Detail (Public)

**Endpoint:** `GET /api/public/events/{event_id}`

**Deskripsi:** Detail event lengkap dengan ticket types, harga aktif, dan lineup (untuk festival).

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event detail retrieved successfully",
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
      "status": "on_sale",
      "agency_id": 2
    },
    "agency": {
      "id": 2,
      "name": "XYZ Entertainment",
      "email": "john@xyz.com",
      "phone": "081234567890"
    },
    "lineup": [],
    "ticket_types": [
      {
        "id": 2,
        "name": "Regular",
        "base_price": 350000.0,
        "description": "Standing area",
        "quota": 1500,
        "sold_count": 0,
        "remaining": 1500,
        "stock_available": 1500,
        "final_price": 350000.0,
        "active_phase": null
      },
      {
        "id": 1,
        "name": "VIP",
        "base_price": 750000.0,
        "description": "Akses VIP dengan standing area depan",
        "quota": 500,
        "sold_count": 0,
        "remaining": 500,
        "stock_available": 500,
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

**Field Penting:**
- `stock_available`: Stock yang tersisa (quota - sold_count)
- `final_price`: Harga akhir setelah diskon (kalau ada active_phase)
- `active_phase`: Info fase diskon yang sedang aktif (null kalau tidak ada)

**Response Error (404):**

```json
{
  "success": false,
  "message": "Event not found",
  "errors": null
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "Event is not available for sale",
  "errors": null
}
```

---

### 3. Get Available Cities

**Endpoint:** `GET /api/public/events/cities`

**Deskripsi:** List semua kota yang punya event on_sale. Untuk dropdown filter.

**Response Success (200):**

```json
{
  "success": true,
  "message": "Available cities retrieved successfully",
  "data": {
    "cities": ["Jakarta", "Bandung", "Surabaya", "Yogyakarta"]
  }
}
```

---

## Checkout Endpoints

### 1. Create Checkout (Booking)

**Endpoint:** `POST /api/checkout`

**Deskripsi:** Buat booking baru. Stock akan di-reserve selama 15 menit.

**Request Body:**

```json
{
  "event_id": 1,
  "ticket_type_id": 2,
  "quantity": 2,
  "buyer_name": "John Doe",
  "buyer_email": "john@example.com",
  "buyer_phone": "081234567890",
  "recipient_email": "recipient@example.com"
}
```

**Field:**
- `event_id` (integer, required): ID event
- `ticket_type_id` (integer, required): ID ticket type
- `quantity` (integer, required): Jumlah tiket (min: 1, max: 10)
- `buyer_name` (string, required): Nama pembeli (min 2 karakter)
- `buyer_email` (email, required): Email pembeli
- `buyer_phone` (string, required): No HP pembeli (10-20 karakter)
- `recipient_email` (email, optional): Email penerima tiket (kalau beda dengan buyer)

**Response Success (201):**

```json
{
  "success": true,
  "message": "Booking created successfully. Please complete payment within 15 minutes.",
  "data": {
    "booking": {
      "id": 2,
      "booking_code": "TKTW-20261103-71AD4D",
      "user_id": null,
      "event_id": 1,
      "ticket_type_id": 2,
      "ticket_phase_id": null,
      "quantity": 2,
      "unit_price": 350000,
      "discount_percent": 0,
      "total_price": 700000,
      "buyer_name": "John Doe",
      "buyer_email": "john@example.com",
      "buyer_phone": "081234567890",
      "payment_method": null,
      "status": "pending_payment",
      "expired_at": "2026-11-03T06:53:19.122075",
      "paid_at": null,
      "created_at": "2026-11-03T06:38:19.132387"
    },
    "payment_url": "https://app.midtrans.com/snap/v2/vtweb/TKTW-20261103-71AD4D",
    "expired_at": "2026-11-03T06:53:19.122075",
    "tickets_preview": [
      {
        "id": 3,
        "booking_id": 2,
        "ticket_code": "TKT-AEF149AF",
        "qr_token": "I16LAvPoTkNVR-sCKpq3jVQoUKjALg_PiBT4UmU8eXk",
        "status": "valid",
        "checked_in_at": null,
        "created_at": "2026-11-03T06:38:19.145305"
      },
      {
        "id": 4,
        "booking_id": 2,
        "ticket_code": "TKT-F184A84A",
        "qr_token": "6QslFLK4JLzhVwR14dLdT-XDG79C19RYRU8FYideRuM",
        "status": "valid",
        "checked_in_at": null,
        "created_at": "2026-11-03T06:38:19.151794"
      }
    ],
    "total_tickets": 2
  }
}
```

**Response Error - Validation (400):**

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "quantity": ["Must be between 1 and 10."],
    "buyer_email": ["Not a valid email address."]
  }
}
```

**Response Error - Event Not Found (404):**

```json
{
  "success": false,
  "message": "Event not found",
  "errors": null
}
```

**Response Error - Event Not Available (400):**

```json
{
  "success": false,
  "message": "Event is not available for sale",
  "errors": null
}
```

**Response Error - Not Enough Stock (400):**

```json
{
  "success": false,
  "message": "Not enough stock. Available: 5",
  "errors": null
}
```

---

### 2. Get Booking Detail

**Endpoint:** `GET /api/checkout/{booking_code}`

**Deskripsi:** Cek detail booking. Tidak perlu authentication, pakai booking code aja.

**Response Success (200):**

```json
{
  "success": true,
  "message": "Booking detail retrieved successfully",
  "data": {
    "booking": {
      "id": 2,
      "booking_code": "TKTW-20261103-71AD4D",
      "status": "pending_payment",
      "quantity": 2,
      "unit_price": 350000,
      "total_price": 700000,
      "buyer_name": "John Doe",
      "buyer_email": "john@example.com",
      "buyer_phone": "081234567890",
      "expired_at": "2026-11-03T06:53:19.122075",
      "created_at": "2026-11-03T06:38:19.132387"
    },
    "event": {
      "id": 1,
      "name": "Hindia Live in Jakarta 2024",
      "event_date": "2024-12-15",
      "venue": "ICE BSD City"
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
        "status": "valid"
      },
      {
        "id": 4,
        "ticket_code": "TKT-F184A84A",
        "qr_token": "6QslFLK4JLzhVwR14dLdT-XDG79C19RYRU8FYideRuM",
        "status": "valid"
      }
    ]
  }
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Booking not found",
  "errors": null
}
```

**Note:** Kalau booking sudah expired, status akan otomatis berubah jadi `expired` dan stock dikembalikan.

---

### 3. Cancel Booking

**Endpoint:** `POST /api/checkout/{booking_code}/cancel`

**Deskripsi:** Cancel booking yang masih pending. Stock akan dikembalikan.

**Response Success (200):**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "id": 2,
      "booking_code": "TKTW-20261103-71AD4D",
      "status": "cancelled",
      "total_price": 700000
    }
  }
}
```

**Response Error - Cannot Cancel (400):**

```json
{
  "success": false,
  "message": "Cannot cancel booking with status: paid",
  "errors": null
}
```

---

### 4. Payment Notification (Webhook)

**Endpoint:** `POST /api/checkout/payment/notification`

**Deskripsi:** Webhook dari Midtrans untuk update status payment. **Internal use only.**

**Request Body (dari Midtrans):**

```json
{
  "order_id": "TKTW-20261103-71AD4D",
  "transaction_status": "settlement",
  "payment_type": "gopay",
  "gross_amount": "700000.00"
}
```

**Transaction Status Mapping:**
- `settlement` → booking status = `paid`
- `pending` → booking status = `pending_payment`
- `expire` / `cancel` / `deny` → booking status = `cancelled` (stock dikembalikan)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Payment notification processed",
  "data": {
    "booking_code": "TKTW-20261103-71AD4D",
    "status": "paid"
  }
}
```

---

## Flow Diagram

### User Checkout Flow

```
1. User browsing events
   GET /api/public/events

2. User pilih event
   GET /api/public/events/{id}

3. User checkout
   POST /api/checkout
   → Booking created (status: pending_payment)
   → Stock reserved
   → Expired dalam 15 menit

4. User dibawa ke payment_url (Midtrans Snap)
   → User bayar via Midtrans

5. Midtrans kirim webhook ke server
   POST /api/checkout/payment/notification
   → Booking status update ke "paid"
   → Send e-ticket email (TODO)

6. User cek booking
   GET /api/checkout/{booking_code}
   → Lihat status & tickets
```

### Booking Status Flow

```
pending_payment (15 menit)
    ↓
    ├─→ paid (payment success)
    ├─→ cancelled (user cancel / payment failed)
    └─→ expired (timeout 15 menit)
```

---

## Testing Examples

### 1. Test List Events

```bash
curl -X GET "http://localhost:5000/api/public/events?city=Jakarta"
```

### 2. Test Event Detail

```bash
curl -X GET "http://localhost:5000/api/public/events/1"
```

### 3. Test Checkout

```bash
curl -X POST "http://localhost:5000/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "ticket_type_id": 2,
    "quantity": 2,
    "buyer_name": "John Doe",
    "buyer_email": "john@example.com",
    "buyer_phone": "081234567890"
  }'
```

### 4. Test Get Booking

```bash
curl -X GET "http://localhost:5000/api/checkout/TKTW-20261103-71AD4D"
```

### 5. Test Cancel Booking

```bash
curl -X POST "http://localhost:5000/api/checkout/TKTW-20261103-71AD4D/cancel"
```

---

## Important Notes

### Stock Management
- Stock di-reserve saat checkout (increment `sold_count`)
- Stock dikembalikan saat booking:
  - Expired (timeout 15 menit)
  - Cancelled (user cancel atau payment failed)
- Stock **tidak** dikembalikan saat booking status = `paid`

### Booking Expiry
- Default: 15 menit dari waktu checkout
- Check expiry dilakukan saat:
  - User cek booking detail
  - Payment webhook diterima
- Auto-change status ke `expired` dan return stock

### Payment Integration (TODO)
- Saat ini payment_url masih dummy
- Perlu integrate:
  1. Midtrans Snap API untuk generate payment URL
  2. Signature verification untuk webhook
  3. Email service untuk kirim e-ticket

### Guest Checkout
- `user_id` nullable - bisa checkout tanpa login
- Booking diidentifikasi pakai `booking_code`
- Future: kalau user login, bisa link booking ke user_id

---

## Next Steps

1. **Integrate Midtrans Snap API**
   - Generate real payment URL
   - Verify webhook signature
   - Handle payment flow lengkap

2. **E-ticket Generation**
   - Generate PDF dengan QR code
   - Send via email setelah payment success

3. **User History**
   - Endpoint untuk user lihat history booking (perlu auth)
   - Link booking ke user_id kalau user login

4. **Admin Features**
   - View all bookings
   - Manual cancel/refund
   - Sales reporting

---

## Error Handling

Semua response mengikuti format standar:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { "field": ["error detail"] }  // atau null
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation, business logic error)
- `403` - Forbidden (event not available)
- `404` - Not Found
- `500` - Internal Server Error
