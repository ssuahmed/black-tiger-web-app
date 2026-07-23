import {
  BT_ACCESS_TOKEN_KEY,
  BT_REFRESH_TOKEN_KEY,
  BT_USER_KEY,
  clearAuthSession,
  readAccessToken,
  readRefreshToken,
  writeAuthSession,
} from "../authStorage.js";

const DEFAULT_COMMERCE_BASE = "https://13.140.185.63:9053/v1";

export function getCommerceApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_COMMERCE_API_URL || DEFAULT_COMMERCE_BASE;
  return raw.replace(/\/$/, "");
}

function joinUrl(base, path) {
  const p = String(path).startsWith("/") ? path.slice(1) : path;
  return `${base}/${p}`;
}

/** @typedef {{ code?: string, message?: string, details?: unknown }} CommerceApiErrorPayload */

export class CommerceApiError extends Error {
  /** @param {string} message @param {number} [status] @param {CommerceApiErrorPayload} [payload] */
  constructor(message, status, payload) {
    super(message);
    this.name = "CommerceApiError";
    this.status = status ?? 0;
    this.payload = payload;
    this.code = payload?.code;
  }
}

/** @type {(() => void) | null} */
let onSessionExpired = null;

/** Register handler when refresh fails (e.g. clear React auth state). */
export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

let refreshInFlight = null;

function isAuthPath(path) {
  const p = String(path).replace(/^\/+/, "");
  return p.startsWith("auth/");
}

async function refreshAccessToken() {
  const refreshToken = readRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const base = getCommerceApiBaseUrl();
      const res = await fetch(joinUrl(base, "auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const text = await res.text();
      let envelope = null;
      try {
        envelope = JSON.parse(text);
      } catch {
        return false;
      }
      if (!envelope?.success || !envelope?.data?.accessToken) return false;
      writeAuthSession(envelope.data);
      return true;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

/**
 * Normalize JSON envelope `{ success, data, error }` from Commerce API.
 * @template T
 * @param {string} path - Path relative to API base (e.g. `"auth/login"`)
 * @param {RequestInit & { json?: unknown; _retry?: boolean }} [init]
 * @returns {Promise<T | undefined>}
 */
export async function commerceFetch(path, init = {}) {
  const base = getCommerceApiBaseUrl();
  const url = /^https?:\/\//i.test(path) ? path : joinUrl(base, path);

  const { json: jsonBody, headers: hdrs, body: bodyInit, _retry, ...rest } = init;
  const headers = new Headers(hdrs);

  let body = bodyInit ?? undefined;
  if (jsonBody !== undefined) {
    body = JSON.stringify(jsonBody);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else if (
    body !== undefined &&
    body !== null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams)
  ) {
    body = JSON.stringify(body);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (typeof window !== "undefined") {
    const token = readAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, { ...rest, headers, body });

  if (
    res.status === 401 &&
    !_retry &&
    typeof window !== "undefined" &&
    !isAuthPath(path) &&
    readRefreshToken()
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return commerceFetch(path, { ...init, _retry: true });
    }
    clearAuthSession();
    onSessionExpired?.();
  }

  if (res.status === 204) {
    return undefined;
  }

  const text = await res.text();
  /** @type {unknown} */
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new CommerceApiError(text.slice(0, 200) || "Invalid response", res.status);
    }
  }

  const envelope =
    parsed && typeof parsed === "object" && "success" in /** @type {Record<string, unknown>} */ (parsed)
      ? /** @type {{ success?: boolean; data?: T; error?: CommerceApiErrorPayload; meta?: unknown }} */ (parsed)
      : null;

  if (envelope && envelope.success === false && envelope.error) {
    const { code, message, details } = envelope.error;
    throw new CommerceApiError(message || "Request failed", res.status, { code, message, details });
  }

  if (envelope && envelope.success === true) {
    return /** @type {T | undefined} */ (envelope.data);
  }

  if (!res.ok) {
    throw new CommerceApiError(
      (envelope?.error?.message ?? res.statusText) || "Request failed",
      res.status,
      envelope?.error,
    );
  }

  return /** @type {T | undefined} */ (parsed);
}

/**
 * @param {Record<string, unknown>} [params]
 */
export function buildQueryString(params) {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined || raw === null) continue;
    if (Array.isArray(raw)) {
      for (const v of raw) {
        if (v !== undefined && v !== null) sp.append(key, String(v));
      }
    } else {
      sp.set(key, String(raw));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// Re-export keys for backwards compatibility
export { BT_ACCESS_TOKEN_KEY, BT_REFRESH_TOKEN_KEY, BT_USER_KEY };
