/**
 * Sanitize `returnTo` query values after login/OTP to prevent open redirects.
 * Only same-origin relative paths are allowed; protocol-relative (`//…`) and auth loops are rejected.
 *
 * @param {string | null | undefined} returnTo
 * @param {string} [fallback]
 */
export function safeReturnPath(returnTo, fallback = "/account/orders") {
  if (!returnTo || typeof returnTo !== "string") return fallback;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback;
  if (returnTo.startsWith("/sign-in")) return fallback;
  return returnTo;
}
