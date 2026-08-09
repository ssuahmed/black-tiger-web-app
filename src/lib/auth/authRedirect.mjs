/** @param {string | null | undefined} returnTo @param {string} [fallback] */
export function safeReturnPath(returnTo, fallback = "/account/orders") {
  if (!returnTo || typeof returnTo !== "string") return fallback;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback;
  if (returnTo.startsWith("/sign-in")) return fallback;
  return returnTo;
}
