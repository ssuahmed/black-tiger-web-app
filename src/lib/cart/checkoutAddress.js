/** @param {import("@/lib/cart/addressFormDefaults").EMPTY_ADDRESS_FORM} form @param {{ displayName?: string; email?: string; phone?: string } | null | undefined} user */
export function buildCheckoutAddressPayload(form, user) {
  const recipient = form.recipients?.find((row) => row.id === form.delivery?.recipientId);
  const names = (recipient?.name || user?.displayName || "Customer").split(/\s+/).filter(Boolean);
  const firstName = names[0] ?? "Customer";
  const lastName = names.slice(1).join(" ") || "User";
  const countryCode = form.countryCode || "SA";
  const business = form.business || {};
  const buildingNo = form.buildingNo || business.buildingNo || "";
  const street = form.street || business.street || "";
  const secondary = form.secondary || business.secondary || "";
  const district = form.district || business.district || "";
  const postalCode = form.postalCode || business.postalCode || "";
  const city = form.city || business.city || "";
  const phone = form.phone || business.phone || "";
  const email = form.contact?.email || form.email || business.email || user?.email || "customer@example.com";

  let line1 = [buildingNo, street, district].filter(Boolean).join(", ").trim();
  if (!line1 && form.delivery?.addressPreview) {
    line1 = String(form.delivery.addressPreview).trim();
  }
  if (!line1 && form.delivery?.addressKind !== "pickup") {
    throw new Error("Enter a delivery street address.");
  }

  const shippingAddress = compact({
    countryCode,
    addressLine1: line1 || form.location?.formattedAddress || "Warehouse pickup",
    addressLine2: secondary,
    city: city || (countryCode === "SA" ? "Riyadh" : undefined),
    stateCode: form.stateProvince || district,
    postalCode,
    usageTypes: form.billingSameAsShipping ? ["shipping", "billing"] : ["shipping"],
    label: form.delivery?.label || "Shipping address",
    companyName: business.organizationName,
    phone: joinPhone(form.phoneCountry, phone) || user?.phone,
    buildingNo,
    street,
    secondary,
    district,
    landmark: form.landmark,
    latitude: form.location?.lat,
    longitude: form.location?.lng,
    placeId: form.location?.placeId,
    formattedAddress: form.location?.formattedAddress,
    addressKind: form.delivery?.addressKind || "home",
    warehouseSlug: form.warehouseSlug,
    portOfDestination: form.portOfDestination,
    freightType: form.freightType,
    nationalAddress: form.nationalAddress,
    companyFloor: form.companyFloor,
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
