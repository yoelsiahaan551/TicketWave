export const DEFAULT_BACKEND_PORT = 5000;
export const DEFAULT_API_PATH = '/api';

export const TUNNEL_HOST_PATTERN =
  /(?:^|\.)(?:exp\.direct|expo\.direct|ngrok\.io|ngrok-free\.app|ngrok-free\.dev|trycloudflare\.com|loca\.lt)$/i;

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);
const IGNORED_PSEUDO_HOSTS = new Set(['expo-development-client']);

export interface ResolveApiBaseUrlInput {
  envUrl?: string | null;
  isDev: boolean;
  platformOS: string;
  devServerUris?: (string | null | undefined)[];
  webHostname?: string | null;
  backendPort?: number;
  apiPath?: string;
}

/**
 * Extracts normalized authority host without relying on `new URL()`, which can fail
 * on custom schemes such as `exp://` in Hermes or bare host:port values.
 */
function extractAuthorityHost(rawUri?: string | null): string | null {
  if (typeof rawUri !== 'string') return null;
  const trimmed = rawUri.trim();
  if (!trimmed || /^(?:file|data|blob|about|javascript):/i.test(trimmed)) {
    return null;
  }

  const withoutScheme = trimmed.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
  const authority = withoutScheme.split(/[/?#]/, 1)[0] ?? '';
  if (!authority) return null;

  const atIndex = authority.lastIndexOf('@');
  const hostPort = atIndex >= 0 ? authority.slice(atIndex + 1) : authority;
  if (!hostPort) return null;

  let host = '';
  if (hostPort.startsWith('[')) {
    const bracketMatch = hostPort.match(/^\[([^\]]+)\](?::\d+)?$/);
    if (!bracketMatch) return null;
    host = bracketMatch[1];
  } else {
    const colonIndex = hostPort.indexOf(':');
    if (colonIndex >= 0) {
      const remainder = hostPort.slice(colonIndex + 1);
      host = remainder.includes(':') ? hostPort : hostPort.slice(0, colonIndex);
    } else {
      host = hostPort;
    }
  }

  const normalized = host.trim().toLowerCase();
  if (!normalized || /\s/.test(normalized) || !/^[a-z0-9.:-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function isTunnelDevServerUri(rawUri?: string | null): boolean {
  const host = extractAuthorityHost(rawUri);
  return Boolean(host && TUNNEL_HOST_PATTERN.test(host));
}

export function extractLanDevHost(rawUri?: string | null): string | null {
  const host = extractAuthorityHost(rawUri);
  if (!host) return null;
  if (LOOPBACK_HOSTS.has(host) || IGNORED_PSEUDO_HOSTS.has(host)) return null;
  if (TUNNEL_HOST_PATTERN.test(host)) return null;
  return host;
}

function formatBackendBaseUrl(
  host: string,
  backendPort: number,
  apiPath: string
): string {
  const formattedHost = host.includes(':') ? `[${host}]` : host;
  const normalizedPath = (apiPath.startsWith('/') ? apiPath : `/${apiPath}`).replace(/\/+$/, '');
  return `http://${formattedHost}:${backendPort}${normalizedPath}`;
}

export function resolveDefaultApiBaseUrl({
  envUrl,
  isDev,
  platformOS,
  devServerUris = [],
  webHostname = null,
  backendPort = DEFAULT_BACKEND_PORT,
  apiPath = DEFAULT_API_PATH,
}: ResolveApiBaseUrlInput): string {
  // 1. Explicit EXPO_PUBLIC_API_URL override wins in dev (e.g. --tunnel) and production builds
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Expo Go / Metro dev server LAN host detection
  if (isDev) {
    for (const candidateUri of devServerUris) {
      const host = extractLanDevHost(candidateUri);
      if (host) {
        return formatBackendBaseUrl(host, backendPort, apiPath);
      }
    }

    if (platformOS === 'web') {
      const webHost = extractLanDevHost(webHostname);
      if (webHost) {
        return formatBackendBaseUrl(webHost, backendPort, apiPath);
      }
    }
  }

  // 3. Android Emulator fallback (working setup preserved)
  if (platformOS === 'android') {
    return formatBackendBaseUrl('10.0.2.2', backendPort, apiPath);
  }

  // 4. iOS Simulator / Web / local fallback
  return formatBackendBaseUrl('127.0.0.1', backendPort, apiPath);
}
