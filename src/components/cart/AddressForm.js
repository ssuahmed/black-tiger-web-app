"use client";

import { useEffect, useRef, useState } from "react";
import AddressBookModal from "@/components/cart/AddressBookModal";
import ContactCheckoutSection from "@/components/cart/ContactCheckoutSection";
import DeliverToFormModal from "@/components/cart/DeliverToFormModal";
import {
  CheckIcon,
  ChevronRightIcon,
  HomeIcon,
  PinIcon,
  PhoneIcon,
} from "@/components/checkout/icons/CheckoutIcons";
import { useAuth } from "@/contexts/AuthContext";
import { createAccountAddress, listAccountAddresses } from "@/lib/api/account";
import { formatAddressPreview } from "@/lib/account/mapAccount.mjs";
import { EMPTY_ADDRESS_FORM } from "@/lib/cart/addressFormDefaults";

const inputClass = "co-field";

/** @param {{ onSubmit?: (form: typeof EMPTY_ADDRESS_FORM) => void | Promise<void>; submitLabel?: string; busy?: boolean }} props */
export default function AddressForm({ onSubmit, submitLabel, busy = false }) {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [newAddressOpen, setNewAddressOpen] = useState(false);
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

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
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

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit?.(form);
  }

  const selectedRecipient = form.delivery.recipientId;
  const selectedAddress = Boolean(form.delivery.selectedAddressId);
  const isBusiness = form.accountType === "business";
  const ctaLabel =
    submitLabel || (isBusiness ? "Submit for verification" : "Continue to shipping");
  const deliverLabel = form.delivery.label
    ? form.delivery.label.toLowerCase().startsWith("deliver")
      ? form.delivery.label
      : `Deliver to ${form.delivery.label}`
    : "Choose a delivery address";

  return (
    <>
      <form className="co-address-form text-neutral-900" onSubmit={handleSubmit}>
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
          <h2 className="m-0 mb-3 text-base font-bold">Delivery</h2>
          <button
            type="button"
            className="co-address-card co-address-card--deliver mb-5 flex w-full items-center gap-3 text-left"
            onClick={() => setAddressBookOpen(true)}
          >
            {form.delivery.addressKind === "pickup" ? (
              <PinIcon className="size-6 shrink-0" />
            ) : (
              <HomeIcon className="size-6 shrink-0" />
            )}
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">{deliverLabel}</strong>
              <span className="mt-1 block text-sm leading-snug text-neutral-600">
                {form.delivery.addressPreview || "Saved addresses, a new address, or warehouse pickup"}
              </span>
            </span>
            <ChevronRightIcon className="size-5 shrink-0 text-neutral-500" />
          </button>

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
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        delivery: { ...current.delivery, recipientId: recipient.id },
                      }))
                    }
                  >
                    {isOther ? (
                      <PhoneIcon className="co-recipient-card__phone" />
                    ) : (
                      <span className="co-recipient-card__avatar">
                        {recipientInitials(recipient.name)}
                      </span>
                    )}
                    <span className="co-recipient-card__copy">
                      <strong>{recipient.name || "Primary contact"}</strong>
                      {recipient.phone ? <span>{recipient.phone}</span> : null}
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
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        {!selectedAddress && form.delivery.addressKind !== "pickup" && !isBusiness ? (
          <AddressFields form={form} update={update} />
        ) : null}

        {isBusiness ? <BusinessFields business={form.business} setForm={setForm} /> : null}

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
    </>
  );
}

function AddressFields({ form, update }) {
  return (
    <section className="co-address-section">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["buildingNo", "Building No."],
          ["street", "Street"],
          ["secondary", "Secondary"],
          ["district", "District"],
          ["postalCode", "Postal Code"],
          ["city", "City"],
          ["email", "email"],
          ["phone", "Phone"],
        ].map(([key, label]) => (
          <input
            key={key}
            className={inputClass}
            placeholder={label}
            value={form[key]}
            onChange={(event) => update(key, event.target.value)}
            required={key === "street" || key === "city"}
            type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
          />
        ))}
      </div>
    </section>
  );
}

function BusinessFields({ business, setForm }) {
  const update = (key, value) =>
    setForm((current) => ({ ...current, business: { ...current.business, [key]: value } }));

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
          {[
            "Certificate of Registration",
            "VAT registration Certificate",
            "National Address Registration",
          ].map((label) => (
            <div key={label} className="co-docs-panel__row">
              <span className="co-docs-panel__label">{label}</span>
              <label className="co-docs-panel__btn">
                Choose File
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                />
              </label>
            </div>
          ))}
          <p className="co-docs-panel__hint">PDF or JPEG format, size limit of 10 MB</p>
        </div>
      </section>

      <section className="co-address-section">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["buildingNo", "Building No."],
            ["street", "Street"],
            ["secondary", "Secondary"],
            ["district", "District"],
            ["postalCode", "Postal Code"],
            ["city", "City"],
            ["email", "email"],
            ["phone", "Phone"],
          ].map(([key, label]) => (
            <input
              key={key}
              className={inputClass}
              placeholder={label}
              value={business[key]}
              onChange={(event) => update(key, event.target.value)}
              type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
            />
          ))}
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
    phone: String(address.phone || form.phone),
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
  };
}
