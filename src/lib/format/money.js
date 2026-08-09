/** Format a SAR amount without currency label (use with {@link Money} / {@link RiyalSymbol}). */
export function formatSarAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Strip SAR / ﷼ / Unicode riyal markers from a formatted money string.
 * @param {string} value
 */
export function stripSarCurrencyLabel(value) {
  return String(value)
    .replace(/\uFDFC/g, "")
    .replace(/\u20C1/g, "")
    .replace(/\bSAR\b/gi, "")
    .replace(/\bSR\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** @param {number} amount */
export function formatSarSymbol(amount) {
  const formatted = formatSarAmount(amount);
  return formatted ? `\u20C1 ${formatted}` : "";
}

/** @param {number} amount */
export function formatSar(amount) {
  const formatted = formatSarAmount(amount);
  return formatted ? `${formatted} SAR` : "";
}
