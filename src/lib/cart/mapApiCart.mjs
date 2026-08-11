/**
 * Map Commerce API cart payloads into shapes expected by cart/checkout UI components.
 * Totals fall back to line sums and a 15% VAT estimate when the API omits fields.
 */

/** @param {number} amount */
export function formatSarSymbol(amount) {
  return `\uFDFC ${amount.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PLACEHOLDER_IMG = "https://placehold.co/120x160/1a1a1a/f5f5f5/png?text=Tiger";

const PALLET_NOTES = {
  full: "Based on Full Pallet Price",
  partial: "Based on Partial Pallet Price",
};

/** @param {Record<string, unknown>} item */
export function mapApiCartLine(item) {
  const palletType = String(item.palletType ?? "unit");
  const imageUrl = typeof item.imageUrl === "string" && item.imageUrl ? item.imageUrl : PLACEHOLDER_IMG;
  return {
    id: String(item.id ?? ""),
    productSlug: String(item.productSlug ?? ""),
    name: String(item.productName ?? item.productSlug ?? "Product"),
    packagingLabel: String(item.packagingLabel ?? ""),
    packagingOptionId: String(item.packagingOptionId ?? ""),
    quantity: Number(item.quantity ?? 1),
    palletType,
    unitPrice: Number(item.unitPrice ?? 0),
    lineTotal: Number(item.totalPrice ?? 0),
    priceNote: PALLET_NOTES[palletType] ?? undefined,
    image: {
      url: imageUrl,
      alt: String(item.productName ?? "Product"),
    },
  };
}

/** @param {Record<string, unknown> | null | undefined} logistics */
export function mapApiLogistics(logistics) {
  if (!logistics || typeof logistics !== "object") {
    return {
      fullPallets: 0,
      fullDrumPallets: 0,
      partialPallets: 0,
      totalPallets: 0,
      totalNetWeightKg: 0,
      totalPalletsForShipping: 0,
      lines: [],
    };
  }
  return {
    fullPallets: Number(logistics.fullPallets ?? 0),
    fullDrumPallets: Number(logistics.fullDrumPallets ?? 0),
    partialPallets: Number(logistics.partialPallets ?? 0),
    totalPallets: Number(logistics.totalPallets ?? 0),
    totalNetWeightKg: Number(logistics.totalNetWeightKg ?? 0),
    totalPalletsForShipping: Number(logistics.totalPalletsForShipping ?? logistics.totalPallets ?? 0),
    lines: Array.isArray(logistics.lines) ? logistics.lines : [],
  };
}

/** @param {Record<string, unknown> | null | undefined} cart @param {number} [shippingOverride] */
export function mapApiCartTotals(cart, shippingOverride) {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const lines = items.map((row) => mapApiCartLine(row && typeof row === "object" ? row : {}));
  const t = cart?.totals && typeof cart.totals === "object" ? cart.totals : {};
  const fallbackSubtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const subtotal = Number(t.subtotal ?? fallbackSubtotal);
  const discount = Number(t.discount ?? 0);
  const vat = Number(t.vat ?? Math.round((subtotal - discount) * 0.15 * 100) / 100);
  const shipping =
    shippingOverride !== undefined && shippingOverride !== null
      ? Number(shippingOverride)
      : Number(t.shipping ?? 0);
  const itemCount = Number(t.itemCount ?? lines.reduce((sum, l) => sum + l.quantity, 0));
  const grandTotal = Number(t.grandTotal ?? subtotal - discount + vat + shipping);
  const totalInclVat = grandTotal;
  return {
    subtotal,
    discount,
    vat,
    shipping,
    grandTotal,
    totalInclVat,
    itemCount,
    formattedSubtotal: formatSarSymbol(subtotal),
    formattedDiscount: formatSarSymbol(discount),
    formattedVat: formatSarSymbol(vat),
    formattedShipping: formatSarSymbol(shipping),
    formattedGrandTotal: formatSarSymbol(grandTotal),
    formattedTotalInclVat: formatSarSymbol(totalInclVat),
  };
}

/** @param {Record<string, unknown> | null | undefined} cart */
export function mapApiPromo(cart) {
  const promo = cart?.promo;
  if (!promo || typeof promo !== "object" || !promo.code) return null;
  return {
    code: String(promo.code),
    label: String(promo.label ?? promo.code),
    discount: Number(promo.discount ?? 0),
    formattedDiscount: formatSarSymbol(Number(promo.discount ?? 0)),
  };
}
