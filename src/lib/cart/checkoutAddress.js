/** @param {import("@/lib/cart/addressFormDefaults").EMPTY_ADDRESS_FORM} form @param {{ displayName?: string; email?: string; phone?: string } | null | undefined} user */
export function buildCheckoutAddressPayload(form, user) {
  const names = (user?.displayName ?? "Customer").split(/\s+/).filter(Boolean);
  const firstName = names[0] ?? "Customer";
  const lastName = names.slice(1).join(" ") || "User";
  let line1 = [form.business.buildingNo, form.business.street, form.business.district]
    .filter(Boolean)
    .join(", ")
    .trim();
  if (!line1 && form.delivery?.addressPreview) {
    line1 = String(form.delivery.addressPreview).trim();
  }
  if (!line1) {
    throw new Error("Enter a delivery street address.");
  }
  return {
    shippingAddress: {
      countryCode: "SA",
      addressLine1: line1,
      addressLine2: form.business.secondary || undefined,
      city: form.business.city || "Riyadh",
      postalCode: form.business.postalCode || undefined,
      usageTypes: ["shipping", "billing"],
      label: form.delivery.label || "Shipping address",
      companyName: form.business.organizationName || undefined,
      phone: form.business.phone || user?.phone || undefined,
    },
    billingSameAsShipping: true,
    saveToAddressBook: true,
    deliveryContact: {
      usageTypes: ["delivery", "order_notifications"],
      firstName,
      lastName,
      email: form.contact.email || user?.email || "customer@example.com",
      phone: form.business.phone || user?.phone || "+966500000000",
    },
  };
}
