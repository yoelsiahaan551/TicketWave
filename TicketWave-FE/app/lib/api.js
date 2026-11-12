/**
 * API Client untuk TicketWave Backend
 * Base: http://127.0.0.1:5000/api
 * 
 * Features:
 * - Auto token injection from localStorage
 * - Auto refresh token when 401
 * - Response normalization (handles auth route data/message swap in BE)
 * - Structured validation error formatting
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

function normalizeResponse(raw) {
  if (!raw || typeof raw !== 'object') return raw;

  // Di app/modules/auth/routes.py BE, success_response dipanggil dengan urutan (message_str, data_obj)
  // sedangkan app/utils/responses.py mendefinisikan success_response(data=None, message="Success").
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

  if (
    raw.success === true &&
    typeof raw.data === 'string' &&
    raw.message === 'Success'
  ) {
    return {
      ...raw,
      message: raw.data,
    };
  }

  return raw;
}

function formatErrorMessage(data, status) {
  if (!data) return `HTTP ${status}`;

  // Jika data.message berupa object (contoh: checkout_routes.py memanggil error_response(errors, 400))
  if (data.message && typeof data.message === 'object') {
    const parts = Object.entries(data.message).map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
      return `${field}: ${text}`;
    });
    if (parts.length > 0) return parts.join(' | ');
  }

  // Jika ada detail errors dari Marshmallow (contoh: status 422 pada agency/event/phase)
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

  return `HTTP ${status}`;
}

function isInvalidTokenError(error) {
  if (!error) return false;

  const data = error.data || error.raw || {};
  const candidates = [
    typeof data.msg === 'string' ? data.msg : '',
    typeof data.message === 'string' ? data.message : '',
    typeof data.error === 'string' ? data.error : '',
    typeof error.message === 'string' ? error.message : '',
  ];

  // Field validation errors (e.g. Marshmallow { errors: { field: [...] } }) are not token errors
  const hasValidationErrors =
    (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) ||
    (error.errors && typeof error.errors === 'object' && Object.keys(error.errors).length > 0);
  if (hasValidationErrors) {
    return false;
  }

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

class APIClient {
  constructor(baseURL = API_BASE) {
    this.baseURL = baseURL;
  }

  isInvalidTokenError(error) {
    return isInvalidTokenError(error);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();
    const { silent = false, ...fetchOptions } = options;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    const config = {
      ...fetchOptions,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const rawData = await response.json().catch(() => ({}));
      const data = normalizeResponse(rawData);

      // Token expired or invalid on protected endpoints → try refresh
      const isAuthPublicEndpoint =
        endpoint.startsWith('/auth/login') ||
        endpoint.startsWith('/auth/register') ||
        endpoint.startsWith('/auth/verify-email') ||
        endpoint.startsWith('/auth/request-password-reset') ||
        endpoint.startsWith('/auth/reset-password');

      if (response.status === 401 && !isAuthPublicEndpoint) {
        const refreshed = await this.refreshToken({ silent });
        if (refreshed) {
          const newToken = this.getAccessToken();
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          const retryResponse = await fetch(url, { ...config, headers: retryHeaders });
          const retryRaw = await retryResponse.json().catch(() => ({}));
          const retryData = normalizeResponse(retryRaw);
          if (!retryResponse.ok && !retryData.success) {
            if (retryResponse.status === 401) {
              this.clearTokens();
            }
            const err = new Error(formatErrorMessage(retryData, retryResponse.status));
            err.status = retryResponse.status;
            err.errors = retryData.errors || null;
            err.data = retryData;
            err.raw = retryRaw;
            throw err;
          }
          return retryData;
        } else if (!this.getRefreshToken()) {
          this.clearTokens();
        }
      }

      if (!response.ok && !data.success) {
        const err = new Error(formatErrorMessage(data, response.status));
        err.status = response.status;
        err.errors = data.errors || (typeof data.message === 'object' ? data.message : null);
        err.data = data;
        err.raw = rawData;
        throw err;
      }

      return data;
    } catch (error) {
      if (!silent) {
        console.error('[API Error]', endpoint, error);
      }
      throw error;
    }
  }

  async refreshToken(options = {}) {
    const { silent = false } = options;
    if (typeof window === 'undefined') return false;
    const sessionRefresh = sessionStorage.getItem('refresh_token');
    const localRefresh = localStorage.getItem('refresh_token');
    const refreshToken = sessionRefresh || localRefresh;
    if (!refreshToken) return false;

    const persistInLocal = !sessionRefresh && !!localRefresh;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        const rawErr = await response.json().catch(() => ({}));
        const errData = normalizeResponse(rawErr);
        if (response.status >= 500) {
          const err = new Error(formatErrorMessage(errData, response.status));
          err.status = response.status;
          err.data = errData;
          err.raw = rawErr;
          throw err;
        }
        if (response.status === 401 || (response.status === 422 && isInvalidTokenError({ data: errData, message: formatErrorMessage(errData, response.status) }))) {
          this.clearTokens();
        }
        return false;
      }

      const rawData = await response.json();
      const data = normalizeResponse(rawData);
      if (data.success && data.data?.access_token) {
        this.setAccessToken(data.data.access_token, persistInLocal);
        return true;
      }
      return false;
    } catch (error) {
      if (!silent) {
        console.error('[Token Refresh Failed]', error);
      }
      if (error?.status >= 500 || !error?.status) {
        throw error;
      }
      this.clearTokens();
      return false;
    }
  }

  // Token helpers (default: sessionStorage per-tab; localStorage hanya jika Remember Me aktif)
  isPersistentSession() {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem('access_token') || sessionStorage.getItem('refresh_token')) {
      return false;
    }
    return !!(localStorage.getItem('access_token') || localStorage.getItem('refresh_token'));
  }

  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
  }

  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
  }

  getStoredUser() {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setAccessToken(token, remember = false) {
    if (typeof window !== 'undefined' && token) {
      if (remember) {
        localStorage.setItem('access_token', token);
        sessionStorage.removeItem('access_token');
      } else {
        sessionStorage.setItem('access_token', token);
      }
    }
  }

  setRefreshToken(token, remember = false) {
    if (typeof window !== 'undefined' && token) {
      if (remember) {
        localStorage.setItem('refresh_token', token);
        sessionStorage.removeItem('refresh_token');
      } else {
        sessionStorage.setItem('refresh_token', token);
      }
    }
  }

  setStoredUser(userData, remember = false) {
    if (typeof window !== 'undefined' && userData) {
      const serialized = JSON.stringify(userData);
      if (remember) {
        localStorage.setItem('user', serialized);
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('user', serialized);
      }
    }
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('ticketwave_verification_token');
        sessionStorage.removeItem('ticketwave_checkout');
      } catch {
        // ignore
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('ticketwave_verification_token');
    }
  }

  // HTTP methods
  async get(endpoint, params = {}, options = {}) {
    let actualParams = params;
    let actualOptions = options;

    if (
      params &&
      typeof params === 'object' &&
      ('silent' in params || 'headers' in params) &&
      Object.keys(options || {}).length === 0 &&
      !('page' in params || 'per_page' in params || 'search' in params || 'limit' in params)
    ) {
      actualOptions = { ...params };
      actualParams = {};
    }

    const cleanParams = {};
    Object.entries(actualParams || {}).forEach(([k, v]) => {
      if (k === 'silent') return;
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { ...actualOptions, method: 'GET' });
  }

  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload dengan multipart/form-data
  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

    const headers = {};
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

      // Token expired or invalid on protected endpoints → try refresh
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = this.getAccessToken();
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              ...headers,
              'Authorization': `Bearer ${newToken}`,
            },
            body: formData,
          });
          const retryRaw = await retryResponse.json().catch(() => ({}));
          const retryData = normalizeResponse(retryRaw);
          if (!retryResponse.ok && !retryData.success) {
            if (retryResponse.status === 401) {
              this.clearTokens();
            }
            const err = new Error(formatErrorMessage(retryData, retryResponse.status));
            err.status = retryResponse.status;
            err.errors = retryData.errors || null;
            throw err;
          }
          return retryData;
        } else if (!this.getRefreshToken()) {
          this.clearTokens();
        }
      }

      if (!response.ok && !data.success) {
        const err = new Error(formatErrorMessage(data, response.status));
        err.status = response.status;
        err.errors = data.errors || null;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('[Upload Error]', endpoint, error);
      throw error;
    }
  }

  // Health check endpoint (/health berada di root server, bukan /api/health)
  async checkHealth() {
    const rootUrl = this.baseURL.replace(/\/api\/?$/, '');
    const response = await fetch(`${rootUrl}/health`, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  }
}

const api = new APIClient();

export default api;
