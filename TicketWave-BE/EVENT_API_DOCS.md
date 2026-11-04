# Event API Documentation

API untuk manajemen event (Concert & Festival). Semua endpoint ini untuk Admin.

**Base URL:** `http://localhost:5000/api/events`

---

## 1. Create Event

### Single Event (Concert)
```http
POST /api/events
Content-Type: application/json

{
  "agency_id": 1,
  "event_type": "single",
  "name": "Hindia Live in Jakarta 2024",
  "artist_name": "Hindia",
  "venue": "Jakarta International Expo",
  "city": "Jakarta",
  "description": "Konser spesial Hindia dengan full band",
  "event_date": "2024-12-15",
  "event_time": "19:00:00",
  "ticket_types": [
    {
      "name": "VIP",
      "base_price": 750000,
      "quota": 500,
      "description": "Akses VIP dengan standing area depan",
      "phases": [
        {
          "phase_name": "early_bird",
          "start_date": "2024-10-01",
          "end_date": "2024-10-31",
          "discount_percent": 20
        },
        {
          "phase_name": "presale",
          "start_date": "2024-11-01",
          "end_date": "2024-11-30",
          "discount_percent": 10
        },
        {
          "phase_name": "normal",
          "start_date": "2024-12-01",
          "end_date": "2024-12-14",
          "discount_percent": 0
        }
      ]
    },
    {
      "name": "Regular",
      "base_price": 350000,
      "quota": 1500,
      "description": "Standing area",
      "phases": [
        {
          "phase_name": "early_bird",
          "start_date": "2024-10-01",
          "end_date": "2024-10-31",
          "discount_percent": 15
        },
        {
          "phase_name": "normal",
          "start_date": "2024-11-01",
          "end_date": "2024-12-14",
          "discount_percent": 0
        }
      ]
    }
  ]
}
```

### Festival Event
```http
POST /api/events
Content-Type: application/json

{
  "agency_id": 1,
  "event_type": "festival",
  "name": "We The Fest 2024",
  "venue": "JIExpo Kemayoran",
  "city": "Jakarta",
  "description": "Festival musik terbesar di Jakarta",
  "days_count": 3,
  "festival_artists": [
    {
      "day_number": 1,
      "artist_name": "Tulus"
    },
    {
      "day_number": 1,
      "artist_name": "Pamungkas"
    },
    {
      "day_number": 2,
      "artist_name": "Raisa"
    },
    {
      "day_number": 2,
      "artist_name": "Isyana Sarasvati"
    },
    {
      "day_number": 3,
      "artist_name": "Rich Brian"
    },
    {
      "day_number": 3,
      "artist_name": "NIKI"
    }
  ],
  "ticket_types": [
    {
      "name": "Festival Pass (3 Hari)",
      "base_price": 1500000,
      "quota": 2000,
      "description": "Akses ke semua hari festival",
      "phases": [
        {
          "phase_name": "early_bird",
          "start_date": "2024-09-01",
          "end_date": "2024-09-30",
          "discount_percent": 25
        },
        {
          "phase_name": "presale",
          "start_date": "2024-10-01",
          "end_date": "2024-11-15",
          "discount_percent": 15
        },
        {
          "phase_name": "normal",
          "start_date": "2024-11-16",
          "end_date": "2024-12-10",
          "discount_percent": 0
        }
      ]
    },
    {
      "name": "Daily Pass",
      "base_price": 600000,
      "quota": 3000,
      "description": "Akses untuk 1 hari pilihan"
    }
  ]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Event berhasil dibuat",
  "data": {
    "id": 1,
    "agency_id": 1,
    "event_type": "single",
    "name": "Hindia Live in Jakarta 2024",
    "artist_name": "Hindia",
    "poster_url": null,
    "banner_url": null,
    "venue": "Jakarta International Expo",
    "city": "Jakarta",
    "description": "Konser spesial Hindia dengan full band",
    "event_date": "2024-12-15",
    "event_time": "19:00:00",
    "days_count": null,
    "status": "draft",
    "created_at": "2024-10-12T03:30:00",
    "festival_artists": []
  }
}
```

---

## 2. List Events

```http
GET /api/events?page=1&per_page=10&status=draft&city=Jakarta&search=hindia
```

**Query Parameters:**
- `page` (optional): Halaman pagination (default: 1)
- `per_page` (optional): Item per halaman (default: 10)
- `agency_id` (optional): Filter by agency ID
- `status` (optional): Filter by status (draft/published/on_sale/sales_closed/ongoing/finished/archived)
- `event_type` (optional): Filter by type (single/festival)
- `city` (optional): Filter by city (partial match)
- `search` (optional): Search di name atau artist_name

**Response Success (200):**
```json
{
  "success": true,
  "message": "Daftar event berhasil diambil",
  "data": {
    "items": [
      {
        "id": 1,
        "agency_id": 1,
        "event_type": "single",
        "name": "Hindia Live in Jakarta 2024",
        "artist_name": "Hindia",
        "venue": "Jakarta International Expo",
        "city": "Jakarta",
        "status": "draft",
        "created_at": "2024-10-12T03:30:00"
      }
    ],
    "page": 1,
    "per_page": 10,
    "total_items": 1,
    "total_pages": 1
  }
}
```

---

## 3. Get Event Detail

```http
GET /api/events/1
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Detail event berhasil diambil",
  "data": {
    "id": 1,
    "agency_id": 1,
    "event_type": "single",
    "name": "Hindia Live in Jakarta 2024",
    "artist_name": "Hindia",
    "poster_url": null,
    "banner_url": null,
    "venue": "Jakarta International Expo",
    "city": "Jakarta",
    "description": "Konser spesial Hindia dengan full band",
    "event_date": "2024-12-15",
    "event_time": "19:00:00",
    "days_count": null,
    "status": "draft",
    "created_at": "2024-10-12T03:30:00",
    "festival_artists": [],
    "agency": {
      "id": 1,
      "name": "XYZ Entertainment",
      "pic_name": "John Doe",
      "email": "john@xyz.com",
      "phone": "081234567890",
      "has_officer_account": false
    },
    "ticket_types": [
      {
        "id": 1,
        "event_id": 1,
        "name": "VIP",
        "base_price": 750000,
        "quota": 500,
        "sold_count": 0,
        "remaining": 500,
        "description": "Akses VIP dengan standing area depan",
        "phases": [
          {
            "id": 1,
            "ticket_type_id": 1,
            "phase_name": "early_bird",
            "start_date": "2024-10-01",
            "end_date": "2024-10-31",
            "discount_percent": 20.0
          }
        ]
      }
    ]
  }
}
```

---

## 4. Update Event

```http
PUT /api/events/1
Content-Type: application/json

{
  "name": "Hindia Live in Jakarta 2024 - SOLD OUT",
  "description": "Updated description",
  "venue": "ICE BSD"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Event berhasil diperbarui",
  "data": { /* event object */ }
}
```

---

## 5. Upload Poster

```http
POST /api/events/1/poster
Content-Type: multipart/form-data

poster: <file>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Poster event berhasil diupload",
  "data": {
    "id": 1,
    "poster_url": "https://res.cloudinary.com/.../poster.jpg",
    ...
  }
}
```

---

## 6. Upload Banner

```http
POST /api/events/1/banner
Content-Type: multipart/form-data

banner: <file>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Banner event berhasil diupload",
  "data": {
    "id": 1,
    "banner_url": "https://res.cloudinary.com/.../banner.jpg",
    ...
  }
}
```

---

## 7. Update Status Event

```http
PATCH /api/events/1/status
Content-Type: application/json

{
  "status": "published"
}
```

**Status Flow:**
- `draft` → `published` → `on_sale` → `sales_closed` → `ongoing` → `finished` → `archived`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Status event berhasil diubah jadi published",
  "data": { /* event object */ }
}
```

---

## 8. Delete Event

```http
DELETE /api/events/1
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Event berhasil dihapus",
  "data": null
}
```

**Error (409) - Ada Tiket Terjual:**
```json
{
  "success": false,
  "message": "Event tidak bisa dihapus karena sudah ada tiket terjual"
}
```

---

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Event tidak ditemukan"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Data tidak valid",
  "errors": {
    "artist_name": ["artist_name wajib diisi untuk event single"],
    "event_date": ["event_date wajib diisi untuk event single"]
  }
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Tidak ada data yang diubah"
}
```

---

## Testing dengan cURL

### Create Single Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "agency_id": 1,
    "event_type": "single",
    "name": "Test Concert",
    "artist_name": "Test Artist",
    "venue": "Test Venue",
    "city": "Jakarta",
    "event_date": "2024-12-15",
    "event_time": "19:00:00"
  }'
```

### Get List
```bash
curl http://localhost:5000/api/events
```

### Get Detail
```bash
curl http://localhost:5000/api/events/1
```

### Upload Poster
```bash
curl -X POST http://localhost:5000/api/events/1/poster \
  -F "poster=@/path/to/image.jpg"
```
