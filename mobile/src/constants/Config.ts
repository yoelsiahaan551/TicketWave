import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  extractLanDevHost,
  isTunnelDevServerUri,
  resolveDefaultApiBaseUrl,
} from './apiUrlResolver';

function isDevRuntime(): boolean {
  return typeof __DEV__ === 'boolean'
    ? __DEV__
    : process.env.NODE_ENV !== 'production';
}

function getWebHostname(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location?.hostname ?? null;
  }
  return null;
}

function collectDevServerUris(): (string | null | undefined)[] {
  const sourceCode = (
    NativeModules as { SourceCode?: { scriptURL?: string } } | undefined
  )?.SourceCode;
  const anyConstants = Constants as Record<string, any>;

  return [
    sourceCode?.scriptURL,
    Constants.expoConfig?.hostUri,
    anyConstants.manifest2?.extra?.expoClient?.hostUri,
    anyConstants.manifest2?.launchAsset?.url,
    anyConstants.expoGoConfig?.debuggerHost,
    anyConstants.manifest?.debuggerHost,
    Constants.experienceUrl,
    Constants.linkingUri,
  ];
}

export function isExplicitEnvApiUrlConfigured(): boolean {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  return Boolean(envUrl && envUrl.trim());
}

/**
 * Resolves the default backend API URL depending on runtime environment:
 * - Explicit override (`EXPO_PUBLIC_API_URL`) for production builds, `--tunnel`, or custom hosts
 * - Physical device via Expo Go (LAN): uses the active Metro dev server host IP (`http://<IP-laptop>:5000/api`)
 * - Android Emulator: 10.0.2.2:5000/api
 * - iOS Simulator / Web: 127.0.0.1:5000/api
 */
export function getDefaultApiBaseUrl(): string {
  const isDev = isDevRuntime();
  return resolveDefaultApiBaseUrl({
    envUrl: process.env.EXPO_PUBLIC_API_URL,
    isDev,
    platformOS: Platform.OS,
    devServerUris: isDev ? collectDevServerUris() : [],
    webHostname: getWebHostname(),
  });
}

export function getApiBaseUrlSourceLabel(): string {
  if (isExplicitEnvApiUrlConfigured()) {
    return 'Override EXPO_PUBLIC_API_URL';
  }

  const isDev = isDevRuntime();
  if (isDev) {
    const devUris = collectDevServerUris();
    if (
      devUris.some((uri) => Boolean(extractLanDevHost(uri))) ||
      (Platform.OS === 'web' && Boolean(extractLanDevHost(getWebHostname())))
    ) {
      return 'Otomatis dari host LAN Expo Go';
    }
    if (devUris.some((uri) => isTunnelDevServerUri(uri))) {
      return 'Mode Tunnel (memerlukan EXPO_PUBLIC_API_URL atau URL manual)';
    }
  }

  if (Platform.OS === 'android') {
    return 'Fallback Emulator Android (10.0.2.2)';
  }

  return 'Fallback Lokal (127.0.0.1)';
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
