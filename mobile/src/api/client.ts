import {
  getDefaultApiBaseUrl,
  isExplicitEnvApiUrlConfigured,
} from '../constants/Config';
import {
  clearAuthStorage,
  getCustomApiBaseUrl,
  getStoredAccessToken,
  getStoredRefreshToken,
  setCustomApiBaseUrl,
  setStoredAccessToken,
} from '../utils/storage';
import { ApiResponse } from '../types';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, any> | null;
  data?: any;
  raw?: any;

  constructor(message: string, status: number, data?: any, raw?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = data?.errors || (typeof data?.message === 'object' ? data.message : null);
    this.data = data;
    this.raw = raw;
  }
}

function normalizeResponse(raw: any): ApiResponse<any> {
  if (!raw || typeof raw !== 'object') return raw;

  // Handle auth routes where success_response(message, data) is swapped relative to utility definition
  if (
    raw.success === true &&
    typeof raw.data === 'string' &&
    raw.message !== null &&
    typeof raw.message === 'object'
  ) {
    return {
      ...raw,
      data: raw.message,
      message: raw.data,
    };
  }

  if (raw.success === true && typeof raw.data === 'string' && raw.message === 'Success') {
    return {
      ...raw,
      message: raw.data,
    };
  }

  return raw;
}

function formatErrorMessage(data: any, status: number): string {
  if (!data) return `HTTP ${status}`;

  if (data.message && typeof data.message === 'object') {
    const parts = Object.entries(data.message).map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
      return `${field}: ${text}`;
    });
    if (parts.length > 0) return parts.join(' | ');
  }

  if (data.errors && typeof data.errors === 'object') {
    const parts = Object.entries(data.errors).map(([field, msgs]) => {
      const text = Array.isArray(msgs)
        ? msgs.map((m) => (typeof m === 'object' ? JSON.stringify(m) : m)).join(', ')
        : typeof msgs === 'object'
        ? JSON.stringify(msgs)
        : String(msgs);
      return `${field}: ${text}`;
    });
    if (parts.length > 0) {
      const prefix = typeof data.message === 'string' ? `${data.message} — ` : '';
      return `${prefix}${parts.join(' | ')}`;
    }
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data.msg === 'string' && data.msg.trim()) {
    return data.msg;
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }

  return `HTTP ${status}`;
}

export function isInvalidTokenError(error: any): boolean {
  if (!error) return false;
  const data = error.data || error.raw || {};
  const candidates = [
    typeof data.msg === 'string' ? data.msg : '',
    typeof data.message === 'string' ? data.message : '',
    typeof data.error === 'string' ? data.error : '',
    typeof error.message === 'string' ? error.message : '',
  ];

  const hasValidationErrors =
    (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) ||
    (error.errors && typeof error.errors === 'object' && Object.keys(error.errors).length > 0);
  if (hasValidationErrors) return false;

  const combined = candidates.join(' ').toLowerCase().trim();
  if (!combined) return false;

  const tokenErrorKeywords = [
    'token',
    'segment',
    'signature',
    'padding',
    'header',
    'authorization',
    'bearer',
    'decode',
    'algorithm',
    'crypto',
    'jwt',
    'claim',
    'issuer',
    'audience',
    'not yet valid',
  ];

  return tokenErrorKeywords.some((keyword) => combined.includes(keyword));
}

class MobileApiClient {
  private baseURL: string;
  private initialized: boolean = false;

  constructor() {
    this.baseURL = getDefaultApiBaseUrl();
  }

  async init(): Promise<string> {
    if (!this.initialized) {
      const defaultUrl = getDefaultApiBaseUrl();
      if (isExplicitEnvApiUrlConfigured()) {
        this.baseURL = defaultUrl;
      } else {
        const custom = await getCustomApiBaseUrl();
        this.baseURL = custom ? custom : defaultUrl;
      }
      this.initialized = true;
    }
    return this.baseURL;
  }

  getBaseUrl(): string {
    return this.baseURL;
  }

  async setBaseUrl(newUrl: string | null): Promise<string> {
    await setCustomApiBaseUrl(newUrl);
    if (newUrl && newUrl.trim()) {
      this.baseURL = newUrl.trim().replace(/\/+$/, '');
    } else {
      this.baseURL = getDefaultApiBaseUrl();
    }
    return this.baseURL;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit & { silent?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    await this.init();
    const url = `${this.baseURL}${endpoint}`;
    const token = await getStoredAccessToken();
    const { silent = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
      const rawData = await response.json().catch(() => ({}));
      const data = normalizeResponse(rawData);

      const isAuthPublicEndpoint =
        endpoint.startsWith('/auth/login') ||
        endpoint.startsWith('/auth/register') ||
        endpoint.startsWith('/auth/verify-email') ||
        endpoint.startsWith('/auth/request-password-reset') ||
        endpoint.startsWith('/auth/reset-password');

      const isAuthError =
        (response.status === 401 ||
          (response.status === 422 && isInvalidTokenError({ data, raw: rawData }))) &&
        !isAuthPublicEndpoint;

      if (isAuthError) {
        console.log(`[API Interceptor] Auth error ${response.status} on ${endpoint} (${formatErrorMessage(data, response.status)}). Attempting token refresh...`);
        const refreshed = await this.refreshToken({ silent });
        if (refreshed) {
          const newToken = await getStoredAccessToken();
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
          const retryRaw = await retryResponse.json().catch(() => ({}));
          console.log(`[API Interceptor] Retry ${endpoint} completed with HTTP ${retryResponse.status}`);
          const retryData = normalizeResponse(retryRaw);
          if (!retryResponse.ok && !retryData.success) {
            if (retryResponse.status === 401) {
              await clearAuthStorage();
            }
            throw new ApiError(
              formatErrorMessage(retryData, retryResponse.status),
              retryResponse.status,
              retryData,
              retryRaw
            );
          }
          return retryData;
        } else {
          const refresh = await getStoredRefreshToken();
          if (!refresh) {
            await clearAuthStorage();
          }
        }
      }

      if (!response.ok && !data.success) {
        throw new ApiError(
          formatErrorMessage(data, response.status),
          response.status,
          data,
          rawData
        );
      }

      return data;
    } catch (error: any) {
      if (__DEV__ && !silent) {
        console.warn('[API Error]', endpoint, this.baseURL, error?.message || error);
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Tidak dapat terhubung ke layanan TicketWave. Periksa koneksi Anda dan coba lagi.',
        0
      );
    }
  }

  async refreshToken(options: { silent?: boolean } = {}): Promise<boolean> {
    const { silent = false } = options;
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) return false;

    try {
      console.log(`[API Interceptor] POST ${this.baseURL}/auth/refresh with refresh token`);
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        const rawErr = await response.json().catch(() => ({}));
        const errData = normalizeResponse(rawErr);
        if (response.status >= 500) {
          throw new ApiError(formatErrorMessage(errData, response.status), response.status, errData, rawErr);
        }
        if (
          response.status === 401 ||
          (response.status === 422 &&
            isInvalidTokenError({
              data: errData,
              message: formatErrorMessage(errData, response.status),
            }))
        ) {
          await clearAuthStorage();
        }
        return false;
      }

      const rawData = await response.json();
      const data = normalizeResponse(rawData);
      if (data.success && data.data?.access_token) {
        await setStoredAccessToken(data.data.access_token);
        return true;
      }
      return false;
    } catch (error: any) {
      if (!silent) {
        console.warn('[Token Refresh Failed]', error?.message);
      }
      if (error?.status >= 500 || !error?.status) {
        throw error;
      }
      await clearAuthStorage();
      return false;
    }
  }

  async get<T = any>(
    endpoint: string,
    params: Record<string, any> = {},
    options: { silent?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const cleanParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([k, v]) => {
      if (k === 'silent') return;
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = String(v);
      }
    });
    const qs = new URLSearchParams(cleanParams).toString();
    const url = qs ? `${endpoint}?${qs}` : endpoint;
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T = any>(endpoint: string, body: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T = any>(endpoint: string, body: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    await this.init();
    const url = `${this.baseURL}${endpoint}`;
    const token = await getStoredAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      const rawData = await response.json().catch(() => ({}));
      const data = normalizeResponse(rawData);

      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = await getStoredAccessToken();
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            },
            body: formData,
          });
          const retryRaw = await retryResponse.json().catch(() => ({}));
          console.log(`[API Interceptor] Retry ${endpoint} completed with HTTP ${retryResponse.status}`);
          const retryData = normalizeResponse(retryRaw);
          if (!retryResponse.ok && !retryData.success) {
            if (retryResponse.status === 401) {
              await clearAuthStorage();
            }
            throw new ApiError(
              formatErrorMessage(retryData, retryResponse.status),
              retryResponse.status,
              retryData,
              retryRaw
            );
          }
          return retryData;
        }
      }

      if (!response.ok && !data.success) {
        throw new ApiError(
          formatErrorMessage(data, response.status),
          response.status,
          data,
          rawData
        );
      }

      return data;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error?.message || 'Upload failed', 0);
    }
  }

  async checkHealth(): Promise<{ status: string; service?: string }> {
    await this.init();
    const rootUrl = this.baseURL.replace(/\/api\/?$/, '');
    const response = await fetch(`${rootUrl}/health`, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  }
}

export const api = new MobileApiClient();
export default api;
