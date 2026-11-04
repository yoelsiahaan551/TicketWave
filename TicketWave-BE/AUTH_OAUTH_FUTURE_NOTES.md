# OAuth Google Implementation - Future Notes

> **Status:** NOT YET IMPLEMENTED  
> **Priority:** Post-MVP (P3)  
> **Current Auth:** Traditional email + password  
> **Last Updated:** 2026-11-03

---

## 📋 Overview

Dokumen ini adalah **catatan untuk masa depan** tentang implementasi "Sign in with Google" sebagai **metode login alternatif** di TicketWave.

**Important:** Untuk sekarang, sistem pakai **traditional authentication** (email + password). OAuth Google akan ditambahkan nanti sebagai **opsi tambahan**, bukan pengganti.

---

## 🎯 Goals

### Why Add OAuth Google?

**Benefits:**
1. **Faster Registration** - User tidak perlu buat password, ingat password
2. **Higher Conversion** - Lower friction = more sign-ups
3. **Email Pre-Verified** - Google sudah verify email, skip verification step
4. **Better UX** - One-click login, no password to remember
5. **Trusted** - User lebih percaya login dengan Google

**Use Cases:**
- User yang malas buat password baru
- User yang sering lupa password
- User yang prefer login dengan akun sosial

---

## 🏗️ Architecture Design

### Hybrid Auth System

```
TicketWave Auth System
├─ Traditional Auth (CURRENT)
│  ├─ Register with email + password
│  ├─ Login with email + password
│  └─ Email verification flow
│
└─ OAuth Google (FUTURE)
   ├─ Sign in with Google
   ├─ Auto-create user if not exist
   └─ Link Google account to existing user
```

**Important Decision Points:**

1. **Should we keep both methods?**
   - ✅ YES - Give users choice
   - User bisa register dengan email+password
   - User bisa register dengan Google
   - User bisa link Google ke existing account

2. **How to identify users?**
   - Primary key: `user.id` (integer)
   - Email as unique identifier
   - New field: `google_id` (nullable) untuk link Google account

3. **What if email already exists?**
   - Scenario: User already registered dengan email+password
   - User coba login with Google (same email)
   - Option A: Auto-link accounts (recommended)
   - Option B: Show error "Email already registered, please login with password"

---

## 🗄️ Database Schema Changes

### Add to `users` Table

```sql
ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) UNIQUE NULL,
ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'local',
ADD COLUMN google_profile_picture VARCHAR(500) NULL;
```

**Fields:**
- `google_id`: Google's unique user ID (from OAuth response)
- `auth_provider`: 'local' (email+password) atau 'google' atau 'both'
- `google_profile_picture`: URL foto profil dari Google

**Migration Example:**
```python
# migrations/versions/xxx_add_oauth_fields.py

def upgrade():
    op.add_column('users', sa.Column('google_id', sa.String(255), nullable=True, unique=True))
    op.add_column('users', sa.Column('auth_provider', sa.String(20), nullable=False, server_default='local'))
    op.add_column('users', sa.Column('google_profile_picture', sa.String(500), nullable=True))

def downgrade():
    op.drop_column('users', 'google_profile_picture')
    op.drop_column('users', 'auth_provider')
    op.drop_column('users', 'google_id')
```

---

## 🔧 Backend Implementation

### Tech Stack Options

**Option 1: Authlib** ⭐ RECOMMENDED
- Modern, well-maintained
- Flask integration: `authlib.integrations.flask_client`
- Supports multiple OAuth providers (Google, Facebook, GitHub)

**Option 2: Flask-Dance**
- Simpler API
- Good for basic OAuth
- Less features than Authlib

**Option 3: Google OAuth Library**
- Official Google library: `google-auth`
- More control, more code

### Installation

```bash
pip install authlib requests
```

Add to `requirements.txt`:
```
authlib==1.2.1
```

---

### Backend Code Structure

#### 1. Setup OAuth Client (`app/config/oauth.py`)

```python
from authlib.integrations.flask_client import OAuth
from flask import current_app

oauth = OAuth()

def init_oauth(app):
    oauth.init_app(app)
    
    oauth.register(
        name='google',
        client_id=current_app.config['GOOGLE_CLIENT_ID'],
        client_secret=current_app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )
```

#### 2. Add Config (`app/config/config.py`)

```python
class BaseConfig:
    # ... existing config ...
    
    # OAuth Google
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/api/auth/google/callback')
```

#### 3. Add Environment Variables (`.env`)

```bash
# OAuth Google
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Production
# GOOGLE_REDIRECT_URI=https://api.ticketwave.com/api/auth/google/callback
```

#### 4. Create OAuth Routes (`app/modules/auth/oauth_routes.py`)

```python
from flask import Blueprint, redirect, url_for, request
from app.config.oauth import oauth
from app.models import User
from app.config.extensions import db
from app.utils.responses import success_response, error_response
from flask_jwt_extended import create_access_token, create_refresh_token

oauth_bp = Blueprint('oauth', __name__)

@oauth_bp.get('/google')
def google_login():
    """
    Redirect user ke Google consent screen.
    Frontend akan redirect user ke endpoint ini.
    """
    redirect_uri = url_for('oauth.google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@oauth_bp.get('/google/callback')
def google_callback():
    """
    Google redirect ke sini setelah user consent.
    Backend exchange code untuk access token, get user info.
    """
    try:
        # Exchange authorization code untuk token
        token = oauth.google.authorize_access_token()
        
        # Get user info dari Google
        user_info = token.get('userinfo')
        
        if not user_info:
            return error_response('Failed to get user info from Google', 400)
        
        google_id = user_info['sub']  # Google's user ID
        email = user_info['email']
        name = user_info.get('name', email.split('@')[0])
        picture = user_info.get('picture')
        
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        
        if user:
            # User exists - link Google account if not linked
            if not user.google_id:
                user.google_id = google_id
                user.auth_provider = 'both'
                user.google_profile_picture = picture
                db.session.commit()
        else:
            # User doesn't exist - create new user
            user = User(
                email=email,
                phone_number=None,  # Will prompt user to add later
                password_hash=None,  # No password for OAuth users
                google_id=google_id,
                auth_provider='google',
                google_profile_picture=picture,
                email_verified=True,  # Google already verified
                role='user'
            )
            db.session.add(user)
            db.session.commit()
        
        # Generate JWT tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Redirect to frontend with tokens (via query params or cookie)
        frontend_url = f"{request.host_url}/auth/callback"
        return redirect(f"{frontend_url}?access_token={access_token}&refresh_token={refresh_token}")
        
    except Exception as e:
        return error_response(str(e), 500)


@oauth_bp.post('/google/link')
def link_google_account():
    """
    Link Google account to existing logged-in user.
    User must be authenticated (JWT token required).
    """
    # TODO: Implement link flow
    # 1. User already logged in with email+password
    # 2. User click "Link Google Account"
    # 3. OAuth flow
    # 4. Save google_id to user
    pass
```

#### 5. Register Blueprint (`app/__init__.py`)

```python
from app.modules.auth.oauth_routes import oauth_bp

app.register_blueprint(oauth_bp, url_prefix='/api/auth')
```

#### 6. Update User Model (`app/models/user.py`)

```python
class User(db.Model):
    # ... existing fields ...
    
    # OAuth fields
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    auth_provider = db.Column(db.String(20), nullable=False, default='local')
    google_profile_picture = db.Column(db.String(500), nullable=True)
    
    def to_dict(self):
        return {
            # ... existing fields ...
            'auth_provider': self.auth_provider,
            'google_profile_picture': self.google_profile_picture,
        }
```

---

## 🎨 Frontend Implementation

### Flow Diagram

```
Frontend Login Page
  |
  ├─ Option 1: Login with Email + Password
  |   └─ POST /api/auth/login
  |
  └─ Option 2: Login with Google
      |
      ├─ User click "Sign in with Google" button
      |
      ├─ Frontend redirect to: GET /api/auth/google
      |
      ├─ Backend redirect to Google consent screen
      |
      ├─ User approve permissions
      |
      ├─ Google redirect to: GET /api/auth/google/callback
      |
      ├─ Backend:
      |   ├─ Get user info from Google
      |   ├─ Create/update user in database
      |   └─ Generate JWT tokens
      |
      ├─ Backend redirect to: /auth/callback?access_token=...&refresh_token=...
      |
      └─ Frontend:
          ├─ Parse tokens from URL
          ├─ Save to Zustand store
          ├─ Clear URL params
          └─ Redirect to home
```

---

### Next.js Code

#### 1. Login Page

```typescript
// app/login/page.tsx

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return (
    <div>
      <h1>Login</h1>
      
      {/* Traditional Login Form */}
      <form onSubmit={handleEmailLogin}>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      
      <div className="divider">OR</div>
      
      {/* Google Login Button */}
      <button onClick={handleGoogleLogin} className="btn-google">
        <img src="/google-icon.svg" alt="Google" />
        Sign in with Google
      </button>
    </div>
  );
}
```

#### 2. OAuth Callback Handler

```typescript
// app/auth/callback/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    // Get tokens from URL params
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Save tokens to store
      login({ accessToken, refreshToken });
      
      // Clean URL (remove tokens from URL)
      window.history.replaceState({}, '', '/');
      
      // Redirect to home
      router.push('/');
    } else {
      // Error handling
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, login, router]);

  return (
    <div className="loading-screen">
      <p>Logging you in...</p>
    </div>
  );
}
```

#### 3. Auth Store Update (Zustand)

```typescript
// stores/authStore.ts

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (data: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  
  login: async (data) => {
    // Save tokens
    set({ 
      accessToken: data.accessToken,
      refreshToken: data.refreshToken 
    });
    
    // Fetch user info
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${data.accessToken}`
      }
    });
    const userData = await response.json();
    
    set({ user: userData.data });
  },
  
  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
  }
}));
```

---

## 🔐 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Create new project: "TicketWave"
3. Enable APIs: "Google+ API" atau "Google Identity"

### Step 2: Create OAuth Credentials

1. Go to: APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth Client ID"
3. Application type: **Web application**
4. Name: "TicketWave Web"
5. Authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback  (development)
   https://api.ticketwave.com/api/auth/google/callback  (production)
   ```
6. Save → Get Client ID & Client Secret

### Step 3: Add to .env

```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOp
```

---

## 🧪 Testing Plan

### Manual Testing

1. **New User - Sign in with Google**
   - Click "Sign in with Google"
   - Consent screen appears
   - User approve
   - Redirect back to app
   - User logged in
   - Check database: user created dengan google_id

2. **Existing User (Email+Password) - Sign in with Google**
   - User already registered dengan email+password
   - User click "Sign in with Google" (same email)
   - Accounts auto-linked
   - Check database: google_id added, auth_provider = 'both'

3. **Existing Google User - Login Again**
   - User already logged in with Google before
   - Click "Sign in with Google" again
   - Direct login (no consent screen if already approved)
   - User logged in

4. **Error Cases**
   - User cancel consent → redirect to login with error
   - Google API error → show error message
   - Network error → retry mechanism

---

## 🚧 Migration Strategy

### Phase 1: Add OAuth Fields (Database)
- Run migration to add `google_id`, `auth_provider`, `google_profile_picture`
- Test migration on dev database

### Phase 2: Backend Implementation
- Add Authlib dependency
- Implement OAuth routes
- Test with Postman / curl

### Phase 3: Frontend Implementation
- Add "Sign in with Google" button
- Implement OAuth callback handler
- Test full flow

### Phase 4: Testing & Bug Fixes
- Test all scenarios (new user, existing user, errors)
- Fix bugs
- Add error handling

### Phase 5: Production Deployment
- Get production Google OAuth credentials
- Update .env with production values
- Deploy backend + frontend
- Test on production

---

## ⚠️ Important Considerations

### 1. Backward Compatibility
- Existing users tetap bisa login dengan email+password
- OAuth hanya **opsi tambahan**, bukan pengganti
- Jangan break existing auth flow

### 2. Security
- **Never expose Client Secret** di frontend
- OAuth flow harus lewat backend (server-side)
- Validate Google token di backend
- CSRF protection (state parameter di OAuth flow)

### 3. User Experience
- Clear error messages kalau OAuth gagal
- Allow user to unlink Google account
- Allow user to switch between email+password dan Google

### 4. Edge Cases
- User register dengan Google, lupa, terus register dengan email+password (same email) → auto-link
- User delete Google account → allow login dengan password kalau sudah set
- User change email di Google → update email di TicketWave? (perlu policy decision)

### 5. Privacy & Terms
- Update Terms of Service: mention Google OAuth
- Privacy Policy: explain what data we get from Google
- User consent before linking accounts

---

## 📊 Data Flow Diagram

```
User clicks "Sign in with Google"
  ↓
Frontend redirects to: GET /api/auth/google
  ↓
Backend redirects to: https://accounts.google.com/o/oauth2/v2/auth?client_id=...
  ↓
User sees Google consent screen
  ↓
User approves
  ↓
Google redirects to: GET /api/auth/google/callback?code=...
  ↓
Backend exchanges code for access token
  ↓
Backend fetches user info from Google
  ↓
Backend checks if user exists in database
  ↓
  ├─ User exists
  │   ├─ Link Google account (add google_id)
  │   └─ Generate JWT tokens
  │
  └─ User doesn't exist
      ├─ Create new user (google_id, email, name)
      └─ Generate JWT tokens
  ↓
Backend redirects to: /auth/callback?access_token=...&refresh_token=...
  ↓
Frontend saves tokens to Zustand store
  ↓
Frontend redirects to home
  ↓
User logged in ✅
```

---

## 🔮 Future Enhancements

### Multiple OAuth Providers
- Facebook Login
- Apple Sign In
- GitHub (untuk developer community)

### Account Linking UI
- Settings page: "Connected Accounts"
- Show which methods user has enabled (email+password, Google, etc.)
- Allow user to add/remove connections

### Enhanced User Profile
- Use Google profile picture as avatar
- Fetch additional info from Google (name, locale)
- Keep profile in sync (optional)

---

## 📚 Resources

### Documentation
- **Authlib Flask OAuth:** https://docs.authlib.org/en/latest/client/flask.html
- **Google OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2
- **Google Sign-In for Websites:** https://developers.google.com/identity/sign-in/web

### Libraries
- **Authlib:** https://github.com/lepture/authlib
- **Flask-Dance:** https://github.com/singingwolfboy/flask-dance (alternative)

### Tutorials
- "OAuth 2.0 and OpenID Connect (in plain English)" - YouTube
- "Add Google Sign In to Flask App" - Real Python

---

## ✅ Checklist untuk Implementation

### Backend
- [ ] Install Authlib
- [ ] Add OAuth config ke `.env`
- [ ] Create OAuth client (`app/config/oauth.py`)
- [ ] Add OAuth routes (`oauth_routes.py`)
- [ ] Update User model (add google_id, auth_provider)
- [ ] Create database migration
- [ ] Run migration
- [ ] Test OAuth flow dengan Postman

### Frontend
- [ ] Add "Sign in with Google" button di Login page
- [ ] Create OAuth callback page (`/auth/callback`)
- [ ] Update Zustand auth store
- [ ] Test full flow (new user, existing user)
- [ ] Add error handling
- [ ] Style Google button (official branding guidelines)

### Google Cloud
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth credentials
- [ ] Add redirect URIs (dev + production)
- [ ] Copy Client ID & Secret ke .env

### Testing
- [ ] Test new user sign in
- [ ] Test existing user sign in
- [ ] Test account linking
- [ ] Test error cases
- [ ] Test on mobile
- [ ] Test on different browsers

### Documentation
- [ ] Update API docs dengan OAuth endpoints
- [ ] Update user guide (how to login with Google)
- [ ] Document for team (this file!)

---

## 🎬 Conclusion

OAuth Google adalah enhancement yang bagus untuk UX, tapi **tidak urgent** untuk MVP. Implement setelah core features stable.

**Priority:**
1. ✅ Traditional auth (email + password) - DONE
2. ✅ Public event browsing & checkout - DONE
3. 🚧 Payment integration (Midtrans) - IN PROGRESS
4. 🚧 E-ticket generation - IN PROGRESS
5. 🔜 OAuth Google - FUTURE

**When to implement:** After MVP launch, when user feedback indicates demand for social login.

**Estimated effort:** 2-3 days (1 day backend, 1 day frontend, 1 day testing)

---

**Questions about OAuth implementation? Refer back to this document or reach out to the team!** 🚀
