# Auth API Documentation

Base URL: `http://localhost:5000/api/auth`

---

## 1. Register (User Only)

**Endpoint:** `POST /api/auth/register`

**Description:** Register akun baru dengan role `user`. Admin & Officer dibuat lewat sistem, bukan self-register.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "password123"
}
```

**Validation:**
- `name`: minimal 2 karakter, maksimal 120 karakter
- `email`: format email valid, wajib unik
- `phone`: minimal 10 karakter, maksimal 20 karakter, harus angka, wajib unik
- `password`: minimal 8 karakter

**Response Success (201):**
```json
{
  "success": true,
  "data": "Registration successful. Please check your email to verify your account.",
  "message": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890",
      "role": "user",
      "email_verified": false,
      "created_at": "2026-11-03T04:00:00.000000"
    },
    "verification_token": "xxx" // sementara di-return, nanti dihapus pas SMTP jalan
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email already registered",
  "errors": 400
}
```

**Notes:**
- Email verification token di-generate otomatis, expired 24 jam
- Email belum dikirim beneran (masih log console), token sementara di-return di response
- User belum bisa login sebelum email diverifikasi (fitur ini temporary di-skip biar FE bisa develop)

---

## 2. Login (All Roles)

**Endpoint:** `POST /api/auth/login`

**Description:** Login untuk semua role (admin, officer, user). Return JWT access token & refresh token.

**Request Body:**
```json
{
  "email": "admin@ticketwave.com",
  "password": "admin123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": "Login successful",
  "message": {
    "user": {
      "id": 3,
      "name": "Admin TicketWave",
      "email": "admin@ticketwave.com",
      "phone": "081999000001",
      "role": "admin",
      "email_verified": true,
      "created_at": "2026-11-03T04:00:00.000000"
    },
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci..."
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": 401
}
```

**Token Expiry:**
- Access Token: 2 hari
- Refresh Token: 30 hari

**Notes:**
- Email verification check sementara di-skip (biar FE bisa develop tanpa ribet)
- Nanti pas SMTP jalan, user harus verify email dulu sebelum bisa login

---

## 3. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Refresh access token pakai refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": "Token refreshed successfully",
  "message": {
    "access_token": "eyJhbGci..."
  }
}
```

**Response Error (401):**
```json
{
  "msg": "Missing Authorization Header"
}
```

---

## 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get profil user yang sedang login.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": "User retrieved",
  "message": {
    "id": 3,
    "name": "Admin TicketWave",
    "email": "admin@ticketwave.com",
    "phone": "081999000001",
    "role": "admin",
    "email_verified": true,
    "created_at": "2026-11-03T04:00:00.000000"
  }
}
```

**Response Error (401):**
```json
{
  "msg": "Missing Authorization Header"
}
```

---

## 5. Verify Email

**Endpoint:** `GET /api/auth/verify-email/<token>`

**Description:** Verifikasi email via token (biasanya dipanggil dari link di email).

**Example:**
```
GET /api/auth/verify-email/OVelTD6SHb8UZzuJfj0XDVpqZwbI4uyaZRXKQJd8gOA
```

**Response Success (200):**
```json
{
  "success": true,
  "data": "Email verified successfully. You can now login.",
  "message": null
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired verification token",
  "errors": 400
}
```

**Notes:**
- Token expired setelah 24 jam
- Setelah verify, `email_verified` jadi `True` dan user bisa login

---

## 6. Request Password Reset

**Endpoint:** `POST /api/auth/request-password-reset`

**Description:** Request reset password (kirim token via email).

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": "If that email exists, a password reset link has been sent.",
  "message": null
}
```

**Notes:**
- Response selalu success meskipun email gak ketemu (security: prevent email enumeration)
- Token expired setelah 1 jam
- Email belum dikirim beneran (masih log console)

---

## 7. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password pakai token dari email.

**Request Body:**
```json
{
  "token": "xxx",
  "new_password": "newpassword123"
}
```

**Validation:**
- `new_password`: minimal 8 karakter

**Response Success (200):**
```json
{
  "success": true,
  "data": "Password reset successful. You can now login with your new password.",
  "message": null
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "errors": 400
}
```

---

## Dummy Users (Seed Data)

Jalankan `python scripts/seed_users.py` untuk create dummy users:

| Email | Password | Role |
|-------|----------|------|
| admin@ticketwave.com | admin123 | admin |
| officer@ticketwave.com | officer123 | officer |
| user@example.com | user123 | user |

Semua dummy users sudah `email_verified: true` biar bisa langsung login.

---

## Protected Endpoints

Semua endpoint Agency, Event, dan Ticket Phase sekarang protected dengan auth:

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Example:**
```bash
# Login dulu
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ticketwave.com","password":"admin123"}'

# Copy access_token dari response

# Access protected endpoint
curl -X GET http://localhost:5000/api/agencies \
  -H "Authorization: Bearer <access_token>"
```

**Response jika token tidak ada (401):**
```json
{
  "msg": "Missing Authorization Header"
}
```

**Response jika role tidak sesuai (403):**
```json
{
  "success": false,
  "message": "Access forbidden. Required role: admin",
  "errors": 403
}
```

---

## Role-Based Access Control

| Endpoint | Allowed Roles |
|----------|---------------|
| `/api/agencies/*` | admin |
| `/api/events/*` | admin |
| `/api/ticket-types/*/phases` | admin |
| `/api/phases/*` | admin |

**Note:** Endpoint publik (browsing event, checkout) belum dibuat, nanti gak perlu auth.

---

## Testing dengan cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "081234567890",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ticketwave.com",
    "password": "admin123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer <refresh_token>"
```

---

## JWT Token Format

JWT identity disimpan sebagai **string** (user ID), contoh payload:
```json
{
  "fresh": false,
  "iat": 1791867809,
  "jti": "49cc9406-c20d-4a34-9181-530a1761ba83",
  "type": "access",
  "sub": "3",  // user ID as string
  "nbf": 1791867809,
  "csrf": "bb95e279-e4f0-4504-a62a-551dce497a9a",
  "exp": 1792040609
}
```

Di decorator `@role_required`, identity di-convert kembali jadi integer untuk query database:
```python
current_user_id = get_jwt_identity()  # string "3"
user = User.query.get(int(current_user_id))  # convert to int
```
