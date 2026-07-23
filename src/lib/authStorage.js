export const BT_ACCESS_TOKEN_KEY = "bt_access_token";
export const BT_REFRESH_TOKEN_KEY = "bt_refresh_token";
export const BT_USER_KEY = "bt_user";

export function readAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(BT_ACCESS_TOKEN_KEY);
}

export function readRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(BT_REFRESH_TOKEN_KEY);
}

export function writeAuthSession(tokens) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BT_ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(BT_REFRESH_TOKEN_KEY, tokens.refreshToken);
  window.localStorage.setItem(BT_USER_KEY, JSON.stringify(tokens.user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BT_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(BT_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(BT_USER_KEY);
}

export function readStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
