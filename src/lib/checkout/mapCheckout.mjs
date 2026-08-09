/** @param {unknown} payload */
export function unwrapShippingOptionsPayload(payload) {
  if (Array.isArray(payload)) {
    return { options: payload, recommendation: null };
  }
  if (payload && typeof payload === "object") {
    const obj = /** @type {Record<string, unknown>} */ (payload);
    const options = Array.isArray(obj.options) ? obj.options : [];
    const recommendation =
      obj.recommendation && typeof obj.recommendation === "object"
        ? /** @type {Record<string, unknown>} */ (obj.recommendation)
        : null;
    return { options, recommendation };
  }
  return { options: [], recommendation: null };
}

/** @param {Record<string, unknown> | null | undefined} option */
export function normalizeShippingOption(option) {
  if (!option || typeof option !== "object") {
    return {
      id: "",
      label: "",
      etaDays: null,
      priceAmount: 0,
      priceFormatted: "",
      recommended: false,
      reason: null,
      qty: 0,
      palletsLoaded: 0,
      unitPrice: 0,
      lineTotal: 0,
      isFleetTotal: false,
    };
  }
  const price = option.price && typeof option.price === "object" ? option.price : {};
  const unitPrice = Number(option.unitPrice ?? price.amount ?? 0);
  const qty = Number(option.qty ?? 0);
  const lineTotal = Number(option.lineTotal ?? unitPrice * qty);
  return {
    id: String(option.id ?? ""),
    label: String(option.label ?? ""),
    etaDays: typeof option.etaDays === "number" ? option.etaDays : null,
    priceAmount: unitPrice,
    priceFormatted: String(price.formatted ?? ""),
    recommended: option.recommended === true,
    reason: option.reason ? String(option.reason) : null,
    qty,
    palletsLoaded: Number(option.palletsLoaded ?? 0),
    unitPrice,
    lineTotal,
    isFleetTotal: option.isFleetTotal === true || String(option.id) === "fleet-auto",
  };
}

/** @param {Record<string, unknown> | null | undefined} recommendation */
export function normalizeShippingRecommendation(recommendation) {
  if (!recommendation || typeof recommendation !== "object") {
    return null;
  }
  const efficiency =
    recommendation.efficiency && typeof recommendation.efficiency === "object"
      ? recommendation.efficiency
      : {};
  const palletBreakdown =
    recommendation.palletBreakdown && typeof recommendation.palletBreakdown === "object"
      ? recommendation.palletBreakdown
      : null;
  const fleetPlan =
    recommendation.fleetPlan && typeof recommendation.fleetPlan === "object"
      ? recommendation.fleetPlan
      : null;
  return {
    score: Number(efficiency.score ?? recommendation.utilizationPct ?? 0),
    utilizationPct: Number(efficiency.utilizationPct ?? efficiency.score ?? 0),
    message: String(recommendation.message ?? ""),
    hints: Array.isArray(recommendation.hints)
      ? recommendation.hints.map((h) => String(h))
      : [],
    lines: Array.isArray(recommendation.lines) ? recommendation.lines : [],
    suggestedProducts: Array.isArray(recommendation.suggestedProducts)
      ? recommendation.suggestedProducts
      : [],
    palletBreakdown,
    fleetPlan,
  };
}

/** @param {Record<string, unknown> | null | undefined} summary */
export function normalizeCheckoutTotals(summary) {
  const totals = summary?.totals && typeof summary.totals === "object" ? summary.totals : {};
  return {
    subtotal: Number(totals.subtotal ?? 0),
    discount: Number(totals.discount ?? 0),
    vat: Number(totals.vat ?? 0),
    shipping: Number(totals.shipping ?? 0),
    grandTotal: Number(totals.grandTotal ?? 0),
    formattedSubtotal: String(totals.formattedSubtotal ?? ""),
    formattedDiscount: String(totals.formattedDiscount ?? ""),
    formattedVat: String(totals.formattedVat ?? ""),
    formattedShipping: String(totals.formattedShipping ?? ""),
    formattedGrandTotal: String(totals.formattedGrandTotal ?? ""),
    itemCount: Number(totals.itemCount ?? 0),
  };
}

/** @param {Record<string, unknown> | null | undefined} summary */
export function checkoutStepAllowed(summary, step) {
  if (!summary) return false;
  if (step === "address") return true;
  if (step === "shipping") return summary.addressComplete === true;
  if (step === "payment") {
    return summary.addressComplete === true && summary.shippingComplete === true;
  }
  return false;
}
