const PLACEHOLDER_IMG = "https://placehold.co/120x160/1a1a1a/f5f5f5/png?text=Tiger";

const PALLET_NOTES = {
  full: "Based on Full Pallet Price",
  partial: "Based on Partial Pallet Price",
};

/** @param {number} amount */
export function formatSarSymbol(amount) {
  return `\uFDFC ${amount.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** @param {Record<string, unknown>} item */
export function mapApiCartLine(item) {
  const palletType = String(item.palletType ?? "unit");
  const imageUrl = typeof item.imageUrl === "string" && item.imageUrl ? item.imageUrl : PLACEHOLDER_IMG;
  return {
    id: String(item.id ?? ""),
    productSlug: String(item.productSlug ?? ""),
    name: String(item.productName ?? item.productSlug ?? "Product"),
    packagingLabel: String(item.packagingLabel ?? ""),
    quantity: Number(item.quantity ?? 1),
    unitPrice: Number(item.unitPrice ?? 0),
    lineTotal: Number(item.totalPrice ?? 0),
    priceNote: PALLET_NOTES[palletType] ?? undefined,
    image: {
      url: imageUrl,
      alt: String(item.productName ?? "Product"),
    },
  };
}

/** @param {Record<string, unknown> | null | undefined} cart @param {number} [shipping] */
export function mapApiCartTotals(cart, shipping = 0) {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const lines = items.map((row) => mapApiCartLine(row && typeof row === "object" ? row : {}));
  const fallbackSubtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const subtotal = Number(cart?.totals?.subtotal ?? fallbackSubtotal);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const totalInclVat = subtotal + shipping;
  return {
    subtotal,
    formattedSubtotal: formatSarSymbol(subtotal),
    itemCount,
    shipping,
    formattedShipping: formatSarSymbol(shipping),
    totalInclVat,
    formattedTotalInclVat: formatSarSymbol(totalInclVat),
  };
}
