/** @param {unknown} err */
export function isCartNotFoundError(err) {
  if (!err || typeof err !== "object") return false;
  const e = /** @type {{ name?: string; status?: number; message?: string }} */ (err);
  if (e.name !== "CommerceApiError") return false;
  if (e.status === 404) return true;
  const msg = String(e.message ?? "").toLowerCase();
  return msg.includes("cart not found");
}
