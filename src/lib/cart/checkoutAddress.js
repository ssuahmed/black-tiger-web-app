/** @param {import("@/lib/cart/addressFormDefaults").EMPTY_ADDRESS_FORM} form @param {{ displayName?: string; email?: string; phone?: string } | null | undefined} user @param {{ businessProfileComplete?: boolean; companyName?: string }} [options] */
export function buildCheckoutAddressPayload(form, user, options = {}) {
  const recipient = form.recipients?.find((row) => row.id === form.delivery?.recipientId);
  const names = (recipient?.name || user?.displayName || "Customer").split(/\s+/).filter(Boolean);
  const firstName = names[0] ?? "Customer";
  const lastName = names.slice(1).join(" ") || "User";
  const countryCode = form.countryCode || "SA";
  const business = form.business || {};
  const isPickup = form.delivery?.addressKind === "pickup";
  const businessProfileComplete = Boolean(options.businessProfileComplete);
  const isBusiness = form.accountType === "business";

  // Prefer map picker / saved delivery selection over any leftover manual fields.
  const formatted =
    String(form.location?.formattedAddress || "").trim() ||
    String(form.delivery?.addressPreview || "").trim();
  const buildingNo = String(form.buildingNo || "").trim();
  const street = String(form.street || "").trim();
  const secondary = String(form.secondary || "").trim();
  const district = String(form.district || "").trim();
  const postalCode = String(form.postalCode || "").trim();
  const city = String(form.city || "").trim();
  const phone = String(form.phone || "").trim();
  const email =
    recipient?.email ||
    form.contact?.email ||
    form.email ||
    user?.email ||
    "customer@example.com";

  let line1 = formatted;
  if (!line1) {
    line1 = [buildingNo, street, district].filter(Boolean).join(", ").trim();
  }
  if (!line1 && !isPickup) {
    throw new Error("Choose a delivery address from the map or your saved addresses.");
  }

  const companyName =
    String(business.organizationName || "").trim() ||
    (businessProfileComplete ? String(options.companyName || "").trim() : "") ||
    undefined;

  const shippingAddress = compact({
    countryCode,
    addressLine1: line1 || "Warehouse pickup",
    addressLine2: secondary || undefined,
    city: city || (countryCode === "SA" ? "Riyadh" : "City"),
    stateCode: form.stateProvince || district || undefined,
    postalCode: postalCode || undefined,
    usageTypes: form.billingSameAsShipping ? ["shipping", "billing"] : ["shipping"],
    label: form.delivery?.label || "Shipping address",
    companyName,
    phone: joinPhone(form.phoneCountry, phone) || user?.phone,
    buildingNo: buildingNo || undefined,
    street: street || undefined,
    secondary: secondary || undefined,
    district: district || undefined,
    landmark: form.landmark || undefined,
    latitude: form.location?.lat ?? undefined,
    longitude: form.location?.lng ?? undefined,
    placeId: form.location?.placeId || undefined,
    formattedAddress: formatted || undefined,
    addressKind: form.delivery?.addressKind || "home",
    warehouseSlug: form.warehouseSlug || undefined,
    portOfDestination: form.portOfDestination || undefined,
    freightType: form.freightType || undefined,
    nationalAddress: form.nationalAddress || undefined,
    companyFloor: form.companyFloor || undefined,
  });

  const billingAddress = form.billingSameAsShipping
    ? undefined
    : compact({
        countryCode: form.billing?.countryCode || countryCode,
        addressLine1: [form.billing?.buildingNo, form.billing?.street, form.billing?.district]
          .filter(Boolean)
          .join(", "),
        addressLine2: form.billing?.secondary,
        city: form.billing?.city,
        stateCode: form.billing?.stateProvince || form.billing?.district,
        postalCode: form.billing?.postalCode,
        usageTypes: ["billing"],
        label: "Billing address",
        phone: joinPhone(form.billing?.phoneCountry, form.billing?.phone),
        buildingNo: form.billing?.buildingNo,
        street: form.billing?.street,
        secondary: form.billing?.secondary,
        district: form.billing?.district,
      });

  return {
    shippingAddress,
    billingSameAsShipping: Boolean(form.billingSameAsShipping),
    ...(billingAddress ? { billingAddress } : {}),
    saveToAddressBook: true,
    purchaseOrderNumber: form.purchaseOrderNumber || undefined,
    accountType: isBusiness ? "business" : "personal",
    // Only send business KYC fields when the profile still needs to be submitted.
    ...(isBusiness && !businessProfileComplete
      ? {
          business: compact({
            organizationName: business.organizationName,
            organizationNameAr: business.organizationNameAr,
            crNumber: business.crNumber,
            vatNumber: business.vatNumber,
            invitationCode: business.invitationCode,
            country: business.country,
          }),
        }
      : {}),
    deliveryContact: {
      usageTypes: ["delivery", "order_notifications"],
      firstName,
      lastName,
      email,
      phone: recipient?.phone || joinPhone(form.phoneCountry, phone) || user?.phone || "+966500000000",
    },
  };
}

function joinPhone(country, phone) {
  const value = String(phone || "").trim();
  if (!value) return "";
  if (value.startsWith("+")) return value;
  return `${String(country || "").trim()}${value.replace(/^0+/, "")}`;
}

function compact(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== "" && item !== undefined && item !== null),
  );
}
