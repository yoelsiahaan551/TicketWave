/**
 * TicketWave Frontend - Dummy Auth Helper (Temporary Dev / Test Mode)
 *
 * TUJUAN:
 * Menyediakan mekanisme demo login lokal sementara untuk memvalidasi UI,
 * navigasi (User Area, Admin Area), dan UX frontend sebelum konfigurasi
 * backend JWT diselesaikan.
 *
 * BATASAN & KEAMANAN:
 * 1. Tidak menghasilkan atau memalsukan JWT token.
 * 2. Tidak menulis ke penyimpanan token backend ('access_token', 'refresh_token').
 * 3. Kredensial dummy tidak pernah dikirimkan ke server backend.
 * 4. Mode demo dapat diaktifkan/dinonaktifkan kapan saja melalui UI atau .env.
 * 5. Ketika dinonaktifkan, seluruh alur kembali ke endpoint backend asli.
 */

const DEMO_MODE_STORAGE_KEY = 'ticketwave_demo_mode_enabled';
const DEMO_SESSION_STORAGE_KEY = 'ticketwave_demo_session';

export const DUMMY_ACCOUNTS = [
  {
    id: 9001,
    name: "Admin TicketWave",
    email: "admin@ticketwave.com",
    password: "admin123",
    aliases: ["admin123", "password123", "Admin123", "Password123"],
    role: "admin",
    phone: "081999888777",
    email_verified: true,
    created_at: "2026-11-13T10:00:00.000Z",
    isDemo: true,
    description: "Akun Admin TicketWave untuk pengujian dashboard admin, manajemen event, dan agency."
  },
  {
    id: 9002,
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    aliases: ["password123", "Password123", "user123", "User123", "demo123", "Demo123"],
    role: "user",
    phone: "081234567890",
    email_verified: true,
    created_at: "2026-11-13T10:00:00.000Z",
    isDemo: true,
    description: "Akun Test User untuk pengujian halaman pengguna, tiket, dan katalog event."
  },
  {
    id: 9005,
    name: "Tes User",
    email: "user@example.com",
    password: "user123",
    aliases: ["user123", "password123", "demo123", "User123", "Password123", "Demo123"],
    role: "user",
    phone: "081234567890",
    email_verified: true,
    created_at: "2026-11-13T10:00:00.000Z",
    isDemo: true,
    description: "Akun Tes User untuk pengujian halaman pengguna, tiket, dan katalog event."
  },
  {
    id: 9006,
    name: "Petugas Scanner",
    email: "officer@ticketwave.com",
    password: "officer123",
    aliases: ["officer123", "password123", "Officer123", "demo123", "petugas123"],
    role: "officer",
    phone: "081999000002",
    email_verified: true,
    created_at: "2026-11-13T10:00:00.000Z",
    isDemo: true,
    badge_id: "OFF-2026-084",
    assigned_event: "Soundfest Jakarta 2026",
    assigned_gate: "Gate A - VIP & Early Bird",
    shift: "Shift Sore (15:00 - 23:00 WIB)",
    description: "Akun Petugas Scanner TicketWave untuk pengujian validasi tiket dan operasional check-in."
  },
  {
    id: 9007,
    name: "Officer Test",
    email: "officer@ticketwave.test",
    password: "officer123",
    aliases: ["officer123", "password123", "Officer123", "demo123"],
    role: "officer",
    phone: "081999000012",
    email_verified: true,
    created_at: "2026-11-13T10:00:00.000Z",
    isDemo: true,
    badge_id: "OFF-2026-012",
    assigned_event: "Soundfest Jakarta 2026",
    assigned_gate: "Gate B - Regular Entry",
    shift: "Shift Sore (15:00 - 23:00 WIB)",
    description: "Akun Petugas Lapangan Gate B."
  },
  {
    id: 9003,
    name: "Demo Admin",
    email: "admin@ticketwave.test",
    password: "admin123",
    aliases: ["admin123", "password123", "Admin123", "Password123"],
    role: "admin",
    phone: "081999888777",
    email_verified: true,
    created_at: "2026-11-13T10:00:00.000Z",
    isDemo: true,
    description: "Akun Demo Admin TicketWave."
  },
  {
    id: 9004,
    name: "Demo User",
    email: "demo@ticketwave.test",
    password: "demo123",
    aliases: ["demo123", "password123", "Demo123", "Password123"],
    role: "user",
    phone: "081234567890",
    email_verified: true,
    created_at: "2026-11-13T10:00:00.000Z",
    isDemo: true,
    description: "Akun Demo User TicketWave."
  }
];

/**
 * Cek apakah Dummy Login Mode sedang aktif.
 * Default: FALSE (Semua panggilan diarahkan langsung ke backend API riil).
 *
 * Mode dummy hanya aktif jika explicitly diaktifkan via:
 * 1. Environment variable: NEXT_PUBLIC_ENABLE_DUMMY_LOGIN=true
 * 2. Tester toggle: window.setDummyModeEnabled(true)
 */
export function isDummyModeEnabled() {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ENABLE_DUMMY_LOGIN !== undefined) {
    return String(process.env.NEXT_PUBLIC_ENABLE_DUMMY_LOGIN).toLowerCase() === 'true';
  }
  if (typeof window !== 'undefined') {
    try {
      const explicitDummyMode = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
      if (explicitDummyMode === 'true') return true;
      const explicitRealMode = localStorage.getItem('ticketwave_real_backend_mode');
      if (explicitRealMode === 'true') return false;
    } catch {
      // Ignore
    }
  }
  // Default: false (Prioritas utama: Real backend integration)
  return false;
}

/**
 * Aktifkan atau nonaktifkan Dummy Login Mode secara terprogram jika diperlukan.
 */
export function setDummyModeEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
      localStorage.removeItem('ticketwave_real_backend_mode');
    } else {
      localStorage.setItem('ticketwave_real_backend_mode', 'true');
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'false');
    }
  } catch {
    // Ignore
  }
  if (!enabled) {
    clearDemoSession();
  }
}

// Ekspos helper toggle ke window di lingkungan browser untuk kebutuhan debugging
if (typeof window !== 'undefined') {
  window.setDummyModeEnabled = setDummyModeEnabled;
  window.isDummyModeEnabled = isDummyModeEnabled;
}

export function getRegisteredDummyUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem('ticketwave_registered_users');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredDummyUser(userWithPassword) {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredDummyUsers();
    users.push(userWithPassword);
    localStorage.setItem('ticketwave_registered_users', JSON.stringify(users));
  } catch {}
}

export function clearRegisteredDummyUsers() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('ticketwave_registered_users');
  } catch {}
}

/**
 * Periksa apakah email merupakan akun demo yang terdaftar atau domain demo.
 * Mendukung varian case, spasi, shorthand 'demo'/'admin', serta domain '@ticketwave.test'.
 */
export function isDummyEmail(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean === 'demo' || clean === 'admin' || clean === 'user' || clean === 'test' || clean === 'officer') return true;
  if (
    clean === 'admin@ticketwave.com' ||
    clean === 'user@example.com' ||
    clean === 'test@example.com' ||
    clean === 'officer@ticketwave.com' ||
    clean === 'officer@ticketwave.test'
  ) return true;
  if (clean.endsWith('@ticketwave.test')) return true;
  if (getRegisteredDummyUsers().some(acc => acc.email.toLowerCase() === clean)) return true;
  return DUMMY_ACCOUNTS.some(acc => acc.email.toLowerCase() === clean);
}

/**
 * Validasi kredensial dummy login.
 * Menghasilkan pesan error standar tanpa membocorkan kredensial demo.
 */
export function matchDummyLogin(email, password) {
  const raw = (email || '').trim().toLowerCase();
  let cleanEmail = raw;
  if (cleanEmail === 'demo') cleanEmail = 'demo@ticketwave.test';
  if (cleanEmail === 'admin') cleanEmail = 'admin@ticketwave.com';
  if (cleanEmail === 'user') cleanEmail = 'user@example.com';
  if (cleanEmail === 'test') cleanEmail = 'test@example.com';
  if (cleanEmail === 'officer') cleanEmail = 'officer@ticketwave.com';

  let account = DUMMY_ACCOUNTS.find(acc => acc.email.toLowerCase() === cleanEmail);
  if (!account) {
    account = getRegisteredDummyUsers().find(acc => acc.email.toLowerCase() === cleanEmail);
  }

  if (!account) {
    return {
      matched: false,
      success: false,
      status: 400,
      message: "Email atau password yang Anda masukkan salah. Silakan periksa kembali."
    };
  }

  const validPasswords = [account.password, ...(account.aliases || [])];
  if (!validPasswords.includes(password)) {
    return {
      matched: true,
      success: false,
      status: 400,
      message: "Email atau password yang Anda masukkan salah. Silakan periksa kembali."
    };
  }

  // Password cocok -> buat profil user (tanpa password)
  const userProfile = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    phone: account.phone,
    email_verified: account.email_verified,
    created_at: account.created_at,
    isDemo: true,
    description: account.description,
    badge_id: account.badge_id || "OFF-2026-084",
    assigned_event: account.assigned_event || "Soundfest Jakarta 2026",
    assigned_gate: account.assigned_gate || "Gate A - VIP & Early Bird",
    shift: account.shift || "Shift Sore (15:00 - 23:00 WIB)",
  };
  return {
    matched: true,
    success: true,
    user: userProfile
  };
}

/**
 * Simpan sesi demo (sessionStorage per-tab atau localStorage jika remember=true).
 */
export function setStoredDemoSession(userData, remember = false) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({
    user: userData,
    isDemo: true,
    remember: !!remember,
    timestamp: Date.now()
  });

  try {
    sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, payload);
    localStorage.setItem(DEMO_SESSION_STORAGE_KEY, payload);
  } catch {
    // Ignore
  }
}

/**
 * Ambil sesi demo yang tersimpan (jika ada).
 */
export function getStoredDemoSession() {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY) || localStorage.getItem(DEMO_SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data && data.isDemo && data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Hapus sesi demo dari storage.
 */
export function clearDemoSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
