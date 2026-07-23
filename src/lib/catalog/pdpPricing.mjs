/**
 * PDP / PLP pricing helpers — packaging variants and live price quotes.
 */

/** @param {unknown} pricing */
export function inferPalletType(pricing, quantity) {
  const row = pricing && typeof pricing === "object" ? /** @type {Record<string, unknown>} */ (pricing) : {};
  const full = row.fullPallet && typeof row.fullPallet === "object"
    ? /** @type {{ rows?: Array<Record<string, unknown>> }} */ (row.fullPallet).rows
    : [];
  const partial = row.partialPallet && typeof row.partialPallet === "object"
    ? /** @type {{ rows?: Array<Record<string, unknown>> }} */ (row.partialPallet).rows
    : [];

  if (Array.isArray(full) && full.length > 0) {
    const first = full[0];
    const total =
      typeof first.totalBoxQty === "number"
        ? first.totalBoxQty
        : (Number(first.palletQty) || 0) * (Number(first.boxPerPallet) || 0);
    if (total > 0 && quantity >= total) return "full";
  }
  if (Array.isArray(partial) && partial.length > 0) return "partial";
  return "unit";
}

/** @param {Array<{ id?: string; default?: boolean; unitPrice?: number; formattedUnitPrice?: string }>} options */
export function defaultPackagingId(options) {
  if (!Array.isArray(options) || !options.length) return "";
  const def = options.find((o) => o.default) ?? options[0];
  return def?.id ? String(def.id) : "";
}

/** @param {Array<{ id?: string; unitPrice?: number; formattedUnitPrice?: string }>} options @param {string} id */
export function packagingUnitPriceLabel(options, id) {
  const opt = options.find((o) => o.id === id);
  if (opt?.formattedUnitPrice) return String(opt.formattedUnitPrice);
  if (typeof opt?.unitPrice === "number") {
    return `${opt.unitPrice.toLocaleString("en-SA")} SAR`;
  }
  return "";
}

/** @param {unknown} quote @param {unknown} fallback */
export function mergeQuotePricing(quote, fallback) {
  const q = quote && typeof quote === "object" ? /** @type {Record<string, unknown>} */ (quote) : {};
  const fb = fallback && typeof fallback === "object" ? /** @type {Record<string, unknown>} */ (fallback) : {};
  const pricing = q.pricing && typeof q.pricing === "object" ? q.pricing : q;
  const p = pricing && typeof pricing === "object" ? /** @type {Record<string, unknown>} */ (pricing) : {};
  const line = q.lineSummary && typeof q.lineSummary === "object" ? q.lineSummary : p.lineSummary;
  const ls = line && typeof line === "object" ? /** @type {Record<string, unknown>} */ (line) : null;

  const unitPrice = typeof p.unitPrice === "number" ? p.unitPrice : ls?.unitPrice;
  const currency = String(ls?.currency ?? p.currency ?? fb.currency ?? "SAR");
  const formattedUnitPrice =
    (typeof p.formattedUnitPrice === "string" && p.formattedUnitPrice) ||
    (unitPrice != null ? `${Number(unitPrice).toLocaleString("en-SA")} ${currency}` : fb.formattedUnitPrice);
  const formattedTotal =
    (typeof p.formattedTotal === "string" && p.formattedTotal) ||
    (ls?.totalPrice != null ? `${Number(ls.totalPrice).toLocaleString("en-SA")} ${currency}` : formattedUnitPrice);

  const lineSummaryRows = ls
    ? [
        {
          packaging: String(ls.packagingLabel ?? ""),
          pallet:
            ls.palletType === "full"
              ? "Full Pallet"
              : ls.palletType === "partial"
                ? "Partial Pallet"
                : "Unit",
          qty: ls.quantity,
          unitPrice: formattedUnitPrice,
          extPrice: formattedTotal,
        },
      ]
    : fb.lineSummaryRows;

  return {
    ...fb,
    ...p,
    unitPrice,
    currency,
    formattedUnitPrice,
    totalPrice: formattedTotal,
    lineSummaryRows: Array.isArray(p.lineSummaryRows) ? p.lineSummaryRows : lineSummaryRows,
  };
}
