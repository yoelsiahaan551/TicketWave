import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolves the default backend API URL depending on runtime environment:
 * - Physical device via Expo Go: extracts host LAN IP from Expo Constants
 * - Android Emulator: 10.0.2.2:5000
 * - iOS Simulator / Web: 127.0.0.1:5000
 */
export function getDefaultApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Try to detect LAN host from Expo dev server (works on physical devices via Expo Go)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri && typeof hostUri === 'string') {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://127.0.0.1:5000/api';
}

export const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80';

export const EVENT_CATEGORIES = [
  'Semua',
  'Single',
  'Festival',
];

export const LANDING_CATEGORIES = [
  { id: 'music-festival', label: 'Music Festival', query: 'festival', icon: 'sparkles' },
  { id: 'live-concert', label: 'Live Concert', query: 'single', icon: 'music' },
  { id: 'pop', label: 'Pop & Indie', query: '', icon: 'mic' },
  { id: 'edm', label: 'Electronic & DJ', query: '', icon: 'disc' },
  { id: 'rock', label: 'Rock & Band', query: '', icon: 'guitar' },
  { id: 'jakarta', label: 'Jakarta', city: 'Jakarta', icon: 'map-pin' },
];
