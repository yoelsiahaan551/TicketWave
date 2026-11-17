export const REQUEST_TIMEOUT_MS = 15000;

// Only known reads: checkout detail and auth verification deliberately excluded.
export function isRetryableRead(endpoint, method = 'GET') {
  if (method.toUpperCase() !== 'GET') return false;
  const path = endpoint.split(/[?#]/)[0].replace(/\/$/, '');
  return /^\/public\/events(?:\/(?:cities|[\w-]+))?$/.test(path) ||
    /^\/(?:events|agencies|phases|ticket-types)(?:\/[\w-]+)?$/.test(path) ||
    /^\/ticket-types\/[\w-]+\/phases$/.test(path) ||
    /^\/scan\/(?:history|stats)$/.test(path) || path === '/health';
}

async function attempt(url, options, timeoutMs) {
  const controller = new AbortController();
  let timer;
  let onAbort;
  const cancelled = new Promise((_, reject) => {
    onAbort = () => {
      const error = options.signal?.reason instanceof Error
        ? options.signal.reason : new DOMException('Request cancelled', 'AbortError');
      controller.abort(error);
      reject(error);
    };
    options.signal?.addEventListener('abort', onAbort, { once: true });
    if (options.signal?.aborted) onAbort();
    timer = setTimeout(() => {
      const error = new Error('Server terlalu lama merespons. Silakan coba lagi.');
      error.name = 'TimeoutError';
      error.code = 'REQUEST_TIMEOUT';
      error.status = 0;
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  try {
    // Keep the deadline alive until the entire body has arrived, not just headers.
    return await Promise.race([cancelled, (async () => {
      if (controller.signal.aborted) throw controller.signal.reason;
      const response = await fetch(url, { ...options, signal: controller.signal });
      const text = await response.text();
      let raw = {};
      try { raw = text ? JSON.parse(text) : {}; } catch {
        if (response.ok) {
          const error = new Error('Respons server tidak valid. Silakan coba lagi.');
          error.code = 'INVALID_RESPONSE';
          error.status = response.status;
          throw error;
        }
        // Preserve the HTTP status for non-JSON error responses.
      }
      return { response, raw };
    })()]);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

export async function fetchJSON(url, options = {}, policy = {}) {
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const deadline = Number.isFinite(timeoutMs) && timeoutMs > 0
    ? Math.min(timeoutMs, REQUEST_TIMEOUT_MS) : REQUEST_TIMEOUT_MS;
  const canRetry = policy.retry !== false && isRetryableRead(policy.endpoint || '', fetchOptions.method || 'GET');
  for (let count = 0; ; count++) {
    try {
      const result = await attempt(url, fetchOptions, deadline);
      if (canRetry && count === 0 && !fetchOptions.signal?.aborted &&
          [502, 503, 504].includes(result.response.status)) continue;
      return result;
    } catch (error) {
      if (!canRetry || count !== 0 || fetchOptions.signal?.aborted ||
          !(error.name === 'TypeError' || error.code === 'REQUEST_TIMEOUT')) throw error;
    }
  }
}
