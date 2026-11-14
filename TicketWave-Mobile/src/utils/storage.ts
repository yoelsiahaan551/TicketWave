import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedBookingEntry, User } from '../types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ticketwave_access_token',
  REFRESH_TOKEN: 'ticketwave_refresh_token',
  USER: 'ticketwave_user',
  CUSTOM_API_BASE: 'ticketwave_custom_api_base',
  BOOKING_ENTRIES: 'ticketwave_booking_codes',
  FAVORITE_ARTISTS: 'ticketwave_favorite_artists',
  FAVORITE_EVENTS: 'ticketwave_favorite_events',
  VERIFICATION_TOKEN: 'ticketwave_verification_token',
  THEME_MODE: 'ticketwave_theme_mode',
};

// Token Storage
export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export async function setStoredAccessToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch {}
}

export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export async function setStoredRefreshToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch {}
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {}
}

export async function clearAuthStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.VERIFICATION_TOKEN,
    ]);
  } catch {}
}

// Custom API Base Storage
export async function getCustomApiBaseUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_API_BASE);
  } catch {
    return null;
  }
}

export async function setCustomApiBaseUrl(url: string | null): Promise<void> {
  try {
    if (url && url.trim()) {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_API_BASE, url.trim().replace(/\/+$/, ''));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_API_BASE);
    }
  } catch {}
}

// Booking Entries
export async function getSavedBookingEntries(): Promise<SavedBookingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BOOKING_ENTRIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveBookingEntry(entry: SavedBookingEntry): Promise<void> {
  if (!entry?.booking_code) return;
  const code = entry.booking_code.trim().toUpperCase();
  try {
    const current = await getSavedBookingEntries();
    const filtered = current.filter((b) => b.booking_code !== code);
    const existing = current.find((b) => b.booking_code === code);
    const updated: SavedBookingEntry = {
      booking_code: code,
      payment_url: entry.payment_url || existing?.payment_url || null,
      recipient_email: entry.recipient_email || existing?.recipient_email || null,
      event_name: entry.event_name || existing?.event_name,
      saved_at: existing?.saved_at || new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKING_ENTRIES, JSON.stringify([updated, ...filtered]));
  } catch (err) {
    console.warn('[Storage] Failed to save booking entry:', err);
  }
}

export async function removeSavedBookingEntry(booking_code: string): Promise<void> {
  if (!booking_code) return;
  const code = booking_code.trim().toUpperCase();
  try {
    const current = await getSavedBookingEntries();
    const filtered = current.filter((b) => b.booking_code !== code);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKING_ENTRIES, JSON.stringify(filtered));
  } catch (err) {
    console.warn('[Storage] Failed to remove booking entry:', err);
  }
}

// Favorites Storage
export async function getFavoriteArtists(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_ARTISTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteArtist(artistName: string): Promise<string[]> {
  try {
    const current = await getFavoriteArtists();
    const exists = current.includes(artistName);
    const next = exists ? current.filter((a) => a !== artistName) : [...current, artistName];
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ARTISTS, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function getFavoriteEvents(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_EVENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteEvent(eventId: number): Promise<number[]> {
  try {
    const current = await getFavoriteEvents();
    const exists = current.includes(eventId);
    const next = exists ? current.filter((id) => id !== eventId) : [...current, eventId];
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_EVENTS, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}
