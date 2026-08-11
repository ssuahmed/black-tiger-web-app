/**
 * User-facing message from thrown API/errors; prefers CommerceApiError.message.
 */

import { CommerceApiError } from "@/lib/api/client";

/** @param {unknown} err @param {string} [fallback] */
export function formatApiError(err, fallback = "Something went wrong.") {
  if (err instanceof CommerceApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
