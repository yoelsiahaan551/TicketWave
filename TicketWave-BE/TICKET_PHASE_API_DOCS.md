# Ticket Phase API Documentation

API untuk manajemen fase tiket (Early Bird, Presale, Normal) dengan sistem diskon otomatis berdasarkan tanggal.

**Base URL:** `http://localhost:5000/api`

---

## Konsep Ticket Phase

**Ticket Phase** adalah periode penjualan dengan harga berbeda berdasarkan waktu:
- **Early Bird**: Diskon terbesar untuk pembeli awal (misal: 20%)
- **Presale**: Diskon menengah (misal: 10%)
- **Normal**: Harga penuh (diskon 0%)

Setiap **Ticket Type** (VIP, Regular, dll) bisa punya beberapa phase dengan tanggal berbeda.

**Contoh:**
```
Tiket VIP (base_price: Rp 750.000)
├─ Early Bird:  1 Okt - 31 Okt   | Diskon 20% → Rp 600.000
├─ Presale:     1 Nov - 30 Nov   | Diskon 10% → Rp 675.000
└─ Normal:      1 Des - 14 Des   | Diskon  0% → Rp 750.000
```

---

## 1. Create Phase

```http
POST /api/ticket-types/<ticket_type_id>/phases
Content-Type: application/json

{
  "phase_name": "early_bird",
  "start_date": "2024-10-01",
  "end_date": "2024-10-31",
  "discount_percent": 20
}
```

**Body Parameters:**
- `phase_name` (required): "early_bird", "presale", atau "normal"
- `start_date` (required): Tanggal mulai phase (format: YYYY-MM-DD)
- `end_date` (required): Tanggal akhir phase (format: YYYY-MM-DD)
- `discount_percent` (optional): Persentase diskon 0-100 (default: 0)

**Validasi:**
- ✅ `end_date` harus setelah `start_date`
- ✅ Tidak boleh overlap dengan phase lain di ticket type yang sama

**Response Success (201):**
```json
{
  "success": true,
  "message": "Phase berhasil ditambahkan",
  "data": {
    "id": 3,
    "ticket_type_id": 1,
    "phase_name": "early_bird",
    "start_date": "2024-10-01",
    "end_date": "2024-10-31",
    "discount_percent": 20.0
  }
}
```

**Error - Overlap (422):**
```json
{
  "success": false,
  "message": "Tanggal overlap dengan phase 'presale' (2024-11-01 - 2024-11-30)"
}
```

**Error - Invalid Dates (422):**
```json
{
  "success": false,
  "message": "Data tidak valid",
  "errors": {
    "end_date": ["end_date harus setelah start_date"]
  }
}
```

---

## 2. List Phases

```http
GET /api/ticket-types/<ticket_type_id>/phases
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Daftar phase berhasil diambil",
  "data": {
    "ticket_type": {
      "id": 1,
      "name": "VIP",
      "base_price": 750000.0
    },
    "phases": [
      {
        "id": 1,
        "ticket_type_id": 1,
        "phase_name": "early_bird",
        "start_date": "2024-10-01",
        "end_date": "2024-10-31",
        "discount_percent": 20.0
      },
      {
        "id": 2,
        "ticket_type_id": 1,
        "phase_name": "presale",
        "start_date": "2024-11-01",
        "end_date": "2024-11-30",
        "discount_percent": 10.0
      },
      {
        "id": 3,
        "ticket_type_id": 1,
        "phase_name": "normal",
        "start_date": "2024-12-01",
        "end_date": "2024-12-14",
        "discount_percent": 0.0
      }
    ],
    "total": 3
  }
}
```

---

## 3. Get Phase Detail

```http
GET /api/phases/<phase_id>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Detail phase berhasil diambil",
  "data": {
    "id": 1,
    "ticket_type_id": 1,
    "phase_name": "early_bird",
    "start_date": "2024-10-01",
    "end_date": "2024-10-31",
    "discount_percent": 20.0
  }
}
```

---

## 4. Update Phase

```http
PUT /api/phases/<phase_id>
Content-Type: application/json

{
  "discount_percent": 25,
  "end_date": "2024-11-05"
}
```

**Body Parameters (semua opsional):**
- `phase_name`: "early_bird", "presale", atau "normal"
- `start_date`: Tanggal mulai baru
- `end_date`: Tanggal akhir baru
- `discount_percent`: Persentase diskon baru (0-100)

**Validasi:**
- ✅ Tanggal baru tidak boleh overlap dengan phase lain (exclude phase yang sedang diedit)
- ✅ `end_date` harus setelah `start_date` (kalau keduanya diubah)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Phase berhasil diperbarui",
  "data": {
    "id": 1,
    "ticket_type_id": 1,
    "phase_name": "early_bird",
    "start_date": "2024-10-01",
    "end_date": "2024-11-05",
    "discount_percent": 25.0
  }
}
```

---

## 5. Delete Phase

```http
DELETE /api/phases/<phase_id>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Phase berhasil dihapus",
  "data": null
}
```

---

## Helper Functions (Pricing)

File: `app/utils/pricing.py`

### `get_active_phase(ticket_type_id, check_date=None)`
Ambil phase yang aktif pada tanggal tertentu.

```python
from app.utils.pricing import get_active_phase
from datetime import date

active = get_active_phase(ticket_type_id=1, check_date=date(2024, 10, 15))
# Returns: TicketPhase object (early_bird) atau None
```

### `calculate_final_price(ticket_type_id, check_date=None)`
Hitung harga final setelah diskon berdasarkan phase aktif.

```python
from app.utils.pricing import calculate_final_price
from datetime import date

result = calculate_final_price(ticket_type_id=1, check_date=date(2024, 10, 15))
# Returns:
# {
#   "base_price": 750000,
#   "active_phase": {...},
#   "discount_amount": 150000,
#   "final_price": 600000
# }
```

### `get_next_phase(ticket_type_id, current_date=None)`
Ambil phase berikutnya setelah tanggal tertentu.

```python
from app.utils.pricing import get_next_phase
from datetime import date

next_phase = get_next_phase(ticket_type_id=1, current_date=date(2024, 10, 15))
# Returns: TicketPhase object (presale) atau None
```

---

## Use Cases

### 1. Petugas Tambah Phase Baru
```bash
# Tambah phase "presale" setelah early bird
curl -X POST http://localhost:5000/api/ticket-types/1/phases \
  -H "Content-Type: application/json" \
  -d '{
    "phase_name": "presale",
    "start_date": "2024-11-01",
    "end_date": "2024-11-30",
    "discount_percent": 10
  }'
```

### 2. Perpanjang Early Bird
```bash
# Update end_date early bird dari 31 Okt jadi 5 Nov
curl -X PUT http://localhost:5000/api/phases/1 \
  -H "Content-Type: application/json" \
  -d '{
    "end_date": "2024-11-05"
  }'
```

### 3. Ubah Diskon
```bash
# Ubah diskon early bird dari 20% jadi 25%
curl -X PUT http://localhost:5000/api/phases/1 \
  -H "Content-Type: application/json" \
  -d '{
    "discount_percent": 25
  }'
```

### 4. Hapus Phase yang Gak Jadi
```bash
curl -X DELETE http://localhost:5000/api/phases/3
```

---

## Validasi Overlap - Penjelasan

**Kondisi Overlap:**
Dua phase overlap jika: `(StartA ≤ EndB) AND (EndA ≥ StartB)`

**Contoh Overlap (DITOLAK):**
```
Phase A: [1 Okt] --------- [31 Okt]
Phase B:           [25 Okt] --------- [30 Nov]
         ❌ Overlap di 25-31 Okt
```

**Contoh Tidak Overlap (OK):**
```
Phase A: [1 Okt] --------- [31 Okt]
Phase B:                      [1 Nov] --------- [30 Nov]
         ✅ Aman, tidak overlap
```

---

## Testing Checklist

- [x] Create phase baru - success
- [x] Create phase overlap - error 422
- [x] Create dengan start_date > end_date - error 422
- [x] List phases - order by start_date
- [x] Get phase detail - success
- [x] Update discount_percent - success
- [x] Update tanggal (overlap) - error 422
- [x] Delete phase - success
- [x] Pricing helper functions - ready (nanti dipanggil dari endpoint)

---

## Next Steps

**Integrasi dengan Checkout:**
Pas customer mau beli tiket, sistem akan:
1. Ambil tanggal hari ini
2. Cari phase yang aktif (`get_active_phase`)
3. Hitung harga final (`calculate_final_price`)
4. Tampilkan ke customer

**Integrasi dengan Event Detail API:**
Tambah info harga di response `/api/events/<id>`:
```json
{
  "ticket_types": [
    {
      "id": 1,
      "name": "VIP",
      "base_price": 750000,
      "current_phase": {
        "phase_name": "early_bird",
        "discount_percent": 20,
        "end_date": "2024-10-31"
      },
      "current_price": 600000,
      "next_phase": {
        "phase_name": "presale",
        "start_date": "2024-11-01",
        "price": 675000
      }
    }
  ]
}
```

---

*Dokumentasi ini mencakup fitur CRUD Ticket Phase yang sudah diimplementasi dan ditest lengkap.*
