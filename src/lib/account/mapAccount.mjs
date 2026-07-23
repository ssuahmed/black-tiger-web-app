/** @param {string | null | undefined} iso */
export function formatAccountDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString("en-SA", { year: "numeric", month: "short", day: "numeric" });
}

/** @param {string | null | undefined} status */
export function formatOrderStatus(status) {
  if (!status) return "—";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** @param {Record<string, unknown>} row */
export function normalizeOrderRow(row) {
  return {
    id: String(row.id ?? ""),
    orderNumber: String(row.orderNumber ?? ""),
    status: formatOrderStatus(String(row.status ?? "")),
    createdAt: formatAccountDate(row.createdAt ? String(row.createdAt) : null),
    itemCount: Number(row.itemCount ?? 0),
    formattedTotal: String(row.formattedTotal ?? ""),
    shippingLabel: row.shippingLabel ? String(row.shippingLabel) : "",
  };
}

/** @param {Record<string, unknown>} address */
export function formatAddressPreview(address) {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.postalCode,
    address.countryCode === "SA" ? "Saudi Arabia" : address.countryCode,
  ].filter((part) => typeof part === "string" && part.trim().length > 0);
  return parts.join(", ");
}

/** @param {import("@/lib/cart/addressFormDefaults").EMPTY_ADDRESS_FORM} form @param {Record<string, unknown> | null | undefined} address */
export function prefillAddressFormFromAccount(form, address) {
  if (!address || typeof address !== "object") return form;
  const preview = formatAddressPreview(address);
  return {
    ...form,
    delivery: {
      ...form.delivery,
      label: String(address.label ?? form.delivery.label),
      addressPreview: preview || form.delivery.addressPreview,
    },
    business: {
      ...form.business,
      organizationName: String(address.companyName ?? form.business.organizationName),
      street: String(address.addressLine1 ?? form.business.street),
      secondary: String(address.addressLine2 ?? form.business.secondary),
      district: String(address.stateCode ?? form.business.district),
      postalCode: String(address.postalCode ?? form.business.postalCode),
      city: String(address.city ?? form.business.city),
      phone: String(address.phone ?? form.business.phone),
    },
  };
}
