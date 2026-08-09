"use client";

import { useEffect, useRef, useState } from "react";
import AddressBookModal from "@/components/cart/AddressBookModal";
import AlternateRecipientModal, {
  OTHER_PLACEHOLDER,
} from "@/components/cart/AlternateRecipientModal";
import ContactCheckoutSection from "@/components/cart/ContactCheckoutSection";
import DeliverToFormModal from "@/components/cart/DeliverToFormModal";
import {
  CheckIcon,
  ChevronRightIcon,
  PinIcon,
  PhoneIcon,
} from "@/components/checkout/icons/CheckoutIcons";
import { useAuth } from "@/contexts/AuthContext";
import {
  createAccountAddress,
  getBusinessApplicationStatus,
  listAccountAddresses,
  updateAccountAddress,
} from "@/lib/api/account";
import { formatAddressPreview } from "@/lib/account/mapAccount.mjs";
import { EMPTY_ADDRESS_FORM } from "@/lib/cart/addressFormDefaults";

const inputClass = "co-field";

/** @param {{ onSubmit?: (form: typeof EMPTY_ADDRESS_FORM, extras?: { documents?: Record<string, File>; businessProfileComplete?: boolean }) => void | Promise<void>; submitLabel?: string; busy?: boolean }} props */
export default function AddressForm({ onSubmit, submitLabel, busy = false }) {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [otherRecipientOpen, setOtherRecipientOpen] = useState(false);
  const [businessDocuments, setBusinessDocuments] = useState(
    /** @type {Record<string, File>} */ ({}),
  );
  const [businessProfileComplete, setBusinessProfileComplete] = useState(false);
  const [businessCompanyName, setBusinessCompanyName] = useState("");
  const [businessStatusLabel, setBusinessStatusLabel] = useState("");
  const [formError, setFormError] = useState("");
  const restoredPickup = useRef(false);

  useEffect(() => {
    let alive = true;
    try {
      const savedPickup = sessionStorage.getItem("bt_checkout_pickup");
      if (!savedPickup) return;
      const pickup = JSON.parse(savedPickup);
      restoredPickup.current = true;
      queueMicrotask(() => {
        if (!alive) return;
        setForm((current) => ({
          ...current,
          ...pickup,
          contact: { ...current.contact, ...pickup.contact },
          delivery: { ...current.delivery, ...pickup.delivery },
          location: { ...current.location, ...pickup.location },
          recipients: Array.isArray(pickup.recipients) ? pickup.recipients : current.recipients,
        }));
      });
      sessionStorage.removeItem("bt_checkout_pickup");
    } catch {
      sessionStorage.removeItem("bt_checkout_pickup");
    }
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      setForm((current) => {
        const name = user.displayName || "";
        const phone = user.phone || "";
        return {
          ...current,
          contact: { ...current.contact, email: user.email || current.contact.email },
          email: user.email || current.email,
          phone: phone || current.phone,
          recipientName: name || current.recipientName,
          recipients: current.recipients.map((recipient, index) =>
            index === 0 ? { ...recipient, name: name || recipient.name, phone: phone || recipient.phone } : recipient,
          ),
        };
      });
    });
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || restoredPickup.current) return;
    let alive = true;
    listAccountAddresses({ usage: "shipping", defaultsOnly: true })
      .then((data) => {
        if (!alive) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        const address = data?.defaults?.shipping || items.find((row) => row?.isDefaultShipping) || items[0];
        if (address) setForm((current) => mergeSavedAddress(current, address));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setBusinessProfileComplete(false);
      setBusinessCompanyName("");
      setBusinessStatusLabel("");
      return;
    }
    let alive = true;
    getBusinessApplicationStatus()
      .then((status) => {
        if (!alive || !status) return;
        const isBiz =
          status.segment === "b2b" ||
          status.status === "submitted" ||
          status.status === "approved" ||
          Boolean(status.businessProfileComplete);
        const complete = Boolean(status.businessProfileComplete);
        setBusinessProfileComplete(complete);
        setBusinessCompanyName(String(status.companyName || ""));
        if (status.infoVerification === "verified" || status.status === "approved") {
          setBusinessStatusLabel("verified");
        } else if (complete || status.status === "submitted" || status.infoVerification === "pending") {
          setBusinessStatusLabel("pending");
        } else {
          setBusinessStatusLabel("");
        }
        if (isBiz) {
          setForm((current) =>
            current.accountType === "business" ? current : { ...current, accountType: "business" },
          );
        }
      })
      .catch(() => {
        if (!alive) return;
        if (user?.segment === "b2b") {
          setForm((current) =>
            current.accountType === "business" ? current : { ...current, accountType: "business" },
          );
          if (user?.approvalStatus === "pending" || user?.approvalStatus === "approved") {
            setBusinessProfileComplete(true);
            setBusinessStatusLabel(user.approvalStatus === "approved" ? "verified" : "pending");
          }
        }
      });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, user]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function openDeliverTo() {
    try {
      const data = await listAccountAddresses();
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      if (items.length === 0) {
        setNewAddressOpen(true);
        return;
      }
    } catch {
      // Fall through to the address book, which surfaces the load error.
    }
    setAddressBookOpen(true);
  }

  async function saveNewAddress(next) {
    setForm(next);
    setNewAddressOpen(false);
    if (!isAuthenticated) return;
    try {
      const created = await createAccountAddress({
        label: next.delivery.label || "Address",
        addressKind: next.delivery.addressKind,
        usageTypes: ["shipping", "billing"],
        recipientName: next.recipientName || next.recipients?.[0]?.name || undefined,
        countryCode: next.countryCode,
        addressLine1: [next.buildingNo, next.street, next.district].filter(Boolean).join(", "),
        addressLine2: next.secondary || undefined,
        city: next.city,
        stateCode: next.stateProvince || undefined,
        postalCode: next.postalCode || undefined,
        phone: `${next.phoneCountry || ""}${next.phone || ""}`,
        latitude: next.location.lat,
        longitude: next.location.lng,
        placeId: next.location.placeId || undefined,
        formattedAddress: next.location.formattedAddress || undefined,
      });
      const row = created?.item ?? created?.address ?? created;
      if (row?.id) setForm((current) => mergeSavedAddress(current, row));
    } catch {
      // Checkout address remains usable even if address-book persistence fails.
    }
  }

  async function saveAlternateRecipient(value) {
    const phoneDisplay = `${value.phoneCountry || ""}${value.phone || ""}`.trim();
    setForm((current) => ({
      ...current,
      recipientName: value.name,
      phoneCountry: value.phoneCountry || current.phoneCountry,
      phone: value.phone,
      recipients: current.recipients.map((row) => {
        if (row.id === "primary") {
          return {
            ...row,
            name: value.name,
            phone: phoneDisplay,
            email: value.email || "",
            selected: true,
          };
        }
        if (row.id === "other") {
          return {
            ...row,
            name: OTHER_PLACEHOLDER,
            phone: "",
            email: "",
            selected: false,
          };
        }
        return row;
      }),
      delivery: { ...current.delivery, recipientId: "primary" },
    }));
    setOtherRecipientOpen(false);

    const addressId = form.delivery?.selectedAddressId;
    if (!isAuthenticated || !addressId) return;
    try {
      await updateAccountAddress(addressId, {
        recipientName: value.name,
        phone: phoneDisplay,
      });
    } catch {
      // Local checkout state remains usable if address-book update fails.
    }
  }

  function selectPrimaryRecipient() {
    setForm((current) => {
      const primary = current.recipients.find((row) => row.id === "primary");
      return {
        ...current,
        recipientName: primary?.name || current.recipientName,
        recipients: current.recipients.map((row) => ({
          ...row,
          selected: row.id === "primary",
        })),
        delivery: { ...current.delivery, recipientId: "primary" },
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const isPickup = form.delivery?.addressKind === "pickup";
    const hasDelivery =
      isPickup ||
      Boolean(String(form.delivery?.addressPreview || "").trim()) ||
      Boolean(String(form.location?.formattedAddress || "").trim()) ||
      Boolean(form.delivery?.selectedAddressId);

    if (!hasDelivery) {
      setFormError("Choose a delivery address from the map or your saved addresses.");
      return;
    }

    const needsBusinessFields =
      form.accountType === "business" && !businessProfileComplete;

    if (needsBusinessFields) {
      const orgName = String(form.business?.organizationName || "").trim();
      if (!orgName) {
        setFormError("Organization name is required for a business account.");
        return;
      }
      const crNumber = String(form.business?.crNumber || "").trim();
      const vatNumber = String(form.business?.vatNumber || "").trim();
      if (!crNumber) {
        setFormError("Certificate of Registration Number is required.");
        return;
      }
      if (!vatNumber) {
        setFormError("VAT Registration Certificate Number is required.");
        return;
      }
      const requiredDocs = [
        ["certificate_of_registration", "Certificate of Registration"],
        ["vat_registration_certificate", "VAT registration Certificate"],
        ["national_address_registration", "National Address Registration"],
      ];
      for (const [documentType, label] of requiredDocs) {
        if (!(businessDocuments[documentType] instanceof File)) {
          setFormError(`${label} is required.`);
          return;
        }
      }
    }

    await onSubmit?.(form, {
      documents: businessDocuments,
      businessProfileComplete,
      companyName: businessCompanyName,
    });
  }

  const selectedRecipient = form.delivery.recipientId;
  const isBusiness = form.accountType === "business";
  const showBusinessForm = isBusiness && !businessProfileComplete;
  const ctaLabel =
    submitLabel ||
    (showBusinessForm ? "Submit for verification" : "Continue to shipping");

  return (
    <>
      <form className="co-address-form text-neutral-900" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="co-address-form__error" role="alert">
            {formError}
          </p>
        ) : null}
        <ContactCheckoutSection
          email={form.contact.email}
          marketingOptIn={form.contact.marketingOptIn}
          signedIn={isAuthenticated}
          onEmailChange={(value) =>
            setForm((current) => ({
              ...current,
              contact: { ...current.contact, email: value },
              email: value,
            }))
          }
          onMarketingChange={(checked) =>
            setForm((current) => ({
              ...current,
              contact: { ...current.contact, marketingOptIn: checked },
            }))
          }
        />

        <section className="co-address-section">
          <h2 className="co-section-title">Delivery</h2>
          <div className="co-deliver-box">
            <p className="co-deliver-box__eyebrow">Address</p>
            <button
              type="button"
              className="co-deliver-box__trigger"
              onClick={() => {
                void openDeliverTo();
              }}
            >
              <PinIcon className="co-deliver-box__pin" />
              <span className="co-deliver-box__copy">
                <strong className="co-deliver-box__label">
                  {form.delivery.label ? (
                    <>
                      Deliver to <span>{form.delivery.label.replace(/^Deliver to\s+/i, "")}</span>
                    </>
                  ) : (
                    "Choose a delivery address"
                  )}
                </strong>
                <span className="co-deliver-box__preview">
                  {form.delivery.addressPreview || "Pin your location on the map or choose a saved address"}
                </span>
              </span>
              <ChevronRightIcon className="co-deliver-box__chevron" />
            </button>
          </div>

          <div className="co-recipient-panel">
            <h3 className="co-recipient-panel__title">Who will receive this order?</h3>
            <div className="co-recipient-panel__options">
              {form.recipients.map((recipient) => {
                const active = selectedRecipient === recipient.id;
                const isOther = recipient.id === "other";
                return (
                  <button
                    key={recipient.id}
                    type="button"
                    className={[
                      "co-recipient-card",
                      active ? "co-recipient-card--active" : "",
                    ].join(" ")}
                    onClick={() => {
                      if (isOther) {
                        setOtherRecipientOpen(true);
                        return;
                      }
                      selectPrimaryRecipient();
                    }}
                  >
                    {isOther ? (
                      <PhoneIcon className="co-recipient-card__phone" />
                    ) : (
                      <span className="co-recipient-card__avatar">
                        {recipientInitials(recipient.name)}
                      </span>
                    )}
                    <span className="co-recipient-card__copy">
                      <strong>
                        {isOther
                          ? OTHER_PLACEHOLDER
                          : recipient.name || "Primary contact"}
                      </strong>
                      {!isOther && recipient.phone ? <span>{recipient.phone}</span> : null}
                    </span>
                    {active ? (
                      <span className="co-recipient-card__check">
                        <CheckIcon className="size-4" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="co-account-type">
            {[
              ["personal", "Personal Account"],
              ["business", "Business Account"],
            ].map(([value, label]) => (
              <label key={value} className="co-account-type__option">
                <input
                  type="radio"
                  name="accountType"
                  checked={form.accountType === value}
                  onChange={() => update("accountType", value)}
                  disabled={businessProfileComplete && value === "personal"}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {isBusiness && businessProfileComplete ? (
            <p className="co-business-submitted" role="status">
              {businessCompanyName ? (
                <>
                  Business profile for <strong>{businessCompanyName}</strong> is{" "}
                  {businessStatusLabel === "verified" ? "verified" : "submitted for verification"}.
                </>
              ) : (
                <>
                  Business information has already been{" "}
                  {businessStatusLabel === "verified" ? "verified" : "submitted for verification"}.
                </>
              )}
            </p>
          ) : null}
        </section>

        {showBusinessForm ? (
          <BusinessFields
            business={form.business}
            setForm={setForm}
            documents={businessDocuments}
            onDocumentChange={(documentType, file) => {
              setBusinessDocuments((current) => {
                const next = { ...current };
                if (file) next[documentType] = file;
                else delete next[documentType];
                return next;
              });
            }}
          />
        ) : null}

        <button type="submit" className="co-cta co-cta--blue co-address-submit" disabled={busy}>
          {ctaLabel}
        </button>
      </form>

      <AddressBookModal
        open={addressBookOpen}
        onClose={() => setAddressBookOpen(false)}
        selectedAddressId={form.delivery.selectedAddressId}
        onSelect={(address) => {
          setForm((current) => mergeSavedAddress(current, address));
          setAddressBookOpen(false);
        }}
        onAddNew={() => {
          setAddressBookOpen(false);
          setNewAddressOpen(true);
        }}
      />
      <DeliverToFormModal
        open={newAddressOpen}
        onClose={() => setNewAddressOpen(false)}
        initialValue={form}
        onSave={saveNewAddress}
      />
      <AlternateRecipientModal
        open={otherRecipientOpen}
        onClose={() => setOtherRecipientOpen(false)}
        initialValue={{
          name: "",
          phone: "",
          email: "",
          phoneCountry: form.phoneCountry,
        }}
        onSave={saveAlternateRecipient}
      />
    </>
  );
}

function BusinessFields({ business, setForm, documents = {}, onDocumentChange }) {
  const update = (key, value) =>
    setForm((current) => ({ ...current, business: { ...current.business, [key]: value } }));

  const documentRows = [
    ["certificate_of_registration", "Certificate of Registration"],
    ["vat_registration_certificate", "VAT registration Certificate"],
    ["national_address_registration", "National Address Registration"],
  ];

  return (
    <>
      <section className="co-biz-block">
        <h2 className="co-biz-block__heading">Business Info</h2>
        <div className="co-biz-panel">
          <label className="co-floating-select">
            <span className="co-floating-select__label">Country/Region</span>
            <select
              className="co-floating-select__control"
              value={business.country}
              onChange={(event) => update("country", event.target.value)}
            >
              <option>Saudi Arabia</option>
              <option>Senegal</option>
              <option>United Arab Emirates</option>
              <option>Other</option>
            </select>
          </label>

          {[
            ["organizationName", "Organization Name"],
            ["organizationNameAr", "Organization Name in Arabic"],
            ["crNumber", "Certificate of Registration Number"],
            ["vatNumber", "VAT Registration Certificate Number"],
          ].map(([key, label]) => (
            <input
              key={key}
              className="co-biz-field"
              placeholder={label}
              value={business[key]}
              onChange={(event) => update(key, event.target.value)}
              required={key !== "organizationNameAr"}
              aria-required={key !== "organizationNameAr"}
            />
          ))}
        </div>
      </section>

      <section className="co-biz-block">
        <h2 className="co-biz-block__heading">Use an invitation code</h2>
        <div className="co-biz-panel co-biz-panel--invite">
          <p className="co-invite-copy">
            Your invitation code is given to you by us to instantly verify your account. Note: this is
            different than your one-time password.
          </p>
          <input
            className="co-biz-field co-biz-field--invite"
            placeholder="Invitation code"
            value={business.invitationCode}
            onChange={(event) => update("invitationCode", event.target.value)}
          />
        </div>
      </section>

      <section className="co-biz-block">
        <h2 className="co-biz-block__heading">Official Documents</h2>
        <div className="co-biz-panel co-biz-panel--docs">
          {documentRows.map(([documentType, label]) => {
            const file = documents[documentType];
            return (
              <div key={documentType} className="co-docs-panel__row">
                <span className="co-docs-panel__label">
                  {label}
                  <span className="co-docs-panel__required" aria-hidden>
                    *
                  </span>
                  {file ? <span className="co-docs-panel__file-name">{file.name}</span> : null}
                </span>
                <label className="co-docs-panel__btn">
                  {file ? "Change file" : "Choose File"}
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => {
                      const next = event.target.files?.[0] || null;
                      if (next && next.size > 10 * 1024 * 1024) {
                        event.target.value = "";
                        window.alert("File must be 10 MB or smaller.");
                        return;
                      }
                      onDocumentChange?.(documentType, next);
                    }}
                  />
                </label>
              </div>
            );
          })}
          <p className="co-docs-panel__hint">PDF or JPEG format, size limit of 10 MB</p>
        </div>
      </section>
    </>
  );
}

function recipientInitials(name) {
  const parts = String(name || "Primary contact")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function mergeSavedAddress(form, address) {
  const line1 = String(address.addressLine1 || address.street || "");
  const recipientName = String(
    address.recipientName ||
      address.contactName ||
      address.partnerName ||
      form.recipientName ||
      form.recipients?.[0]?.name ||
      "",
  ).trim();
  const phone = String(address.phone || form.phone || form.recipients?.[0]?.phone || "").trim();
  return {
    ...form,
    countryCode: String(address.countryCode || form.countryCode || "SA"),
    buildingNo: String(address.buildingNo || ""),
    street: String(address.street || line1),
    secondary: String(address.secondary || address.addressLine2 || ""),
    district: String(address.district || ""),
    postalCode: String(address.postalCode || ""),
    city: String(address.city || ""),
    stateProvince: String(address.stateProvince || address.stateCode || ""),
    landmark: String(address.landmark || ""),
    nationalAddress: String(address.nationalAddress || ""),
    companyFloor: String(address.companyFloor || ""),
    phone: phone || form.phone,
    recipientName: recipientName || form.recipientName,
    warehouseSlug: String(address.warehouseSlug || ""),
    location: {
      lat: address.latitude ?? address.lat ?? null,
      lng: address.longitude ?? address.lng ?? null,
      placeId: String(address.placeId || ""),
      formattedAddress: String(address.formattedAddress || formatAddressPreview(address)),
    },
    delivery: {
      ...form.delivery,
      label: String(address.label || "Saved address"),
      addressPreview: formatAddressPreview(address),
      selectedAddressId: String(address.id || ""),
      addressKind: String(address.addressKind || "home").toLowerCase(),
    },
    recipients: (form.recipients || EMPTY_ADDRESS_FORM.recipients).map((row, index) =>
      index === 0
        ? {
            ...row,
            name: recipientName || row.name,
            phone: phone || row.phone,
          }
        : row,
    ),
  };
}
