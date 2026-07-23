/** @param {Record<string, unknown>} row */
export function normalizeListSummary(row) {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: row.description != null ? String(row.description) : null,
    listType: String(row.listType ?? "wishlist"),
    itemCount: Number(row.itemCount ?? 0),
    previewImages: Array.isArray(row.previewImages)
      ? row.previewImages.filter((u) => typeof u === "string" && u.length > 0)
      : [],
    isDefault: Boolean(row.isDefault),
    createdAt: row.createdAt ? String(row.createdAt) : null,
    updatedAt: row.updatedAt ? String(row.updatedAt) : null,
  };
}

/** @param {Record<string, unknown>} row */
export function normalizeListItem(row) {
  const snap =
    row.productSnapshot && typeof row.productSnapshot === "object"
      ? /** @type {Record<string, unknown>} */ (row.productSnapshot)
      : {};
  return {
    id: String(row.id ?? ""),
    productSlug: String(row.productSlug ?? ""),
    packagingOptionId: String(row.packagingOptionId ?? ""),
    quantity: Number(row.quantity ?? 1),
    notes: row.notes != null ? String(row.notes) : null,
    productName: String(snap.name ?? row.productSlug ?? ""),
    imageUrl: snap.imageUrl ? String(snap.imageUrl) : null,
    inStock: Boolean(
      row.availability &&
        typeof row.availability === "object" &&
        /** @type {{ inStock?: boolean }} */ (row.availability).inStock,
    ),
  };
}
