"use client";

import { useEffect, useState } from "react";
import ContactCheckoutSection from "@/components/cart/ContactCheckoutSection";
import { useAuth } from "@/contexts/AuthContext";
import { EMPTY_ADDRESS_FORM } from "@/lib/cart/addressFormDefaults";
import { listAccountAddresses } from "@/lib/api/account";
import { prefillAddressFormFromAccount } from "@/lib/account/mapAccount.mjs";

const inputClass =
  "box-border w-full min-h-10 py-2 px-3 text-sm text-neutral-900 bg-white border border-neutral-300 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-0";

const selectClass = `${inputClass} font-[inherit]`;

/** @param {{ onSubmit?: (form: typeof EMPTY_ADDRESS_FORM) => void | Promise<void>; submitLabel?: string; busy?: boolean }} props */
export default function AddressForm({ onSubmit, submitLabel = "Submit for verification", busy = false }) {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
  const [recipientId, setRecipientId] = useState(form.delivery.recipientId);
  const [accountType, setAccountType] = useState(form.accountType);

  useEffect(() => {
    if (!user) return;
    setForm((current) => {
      const email = user.email ?? current.contact.email;
      const name = user.displayName ?? current.delivery.label;
      const phone = user.phone ?? current.business.phone;
      return {
        ...current,
        contact: { ...current.contact, email },
        delivery: { ...current.delivery, label: name || current.delivery.label },
        business: { ...current.business, phone: phone || current.business.phone },
        recipients: current.recipients.map((recipient, index) =>
          index === 0
            ? {
                ...recipient,
                name: name || recipient.name,
                phone: phone || recipient.phone,
              }
            : recipient,
        ),
      };
    });
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    listAccountAddresses({ usage: "shipping", defaultsOnly: true })
      .then((data) => {
        if (!alive) return;
        const address =
          data?.defaults?.shipping ??
          (Array.isArray(data?.items) ? data.items.find((row) => row?.isDefaultShipping) : null) ??
          (Array.isArray(data?.items) ? data.items[0] : null);
        if (!address) return;
        setForm((current) => prefillAddressFormFromAccount(current, address));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      delivery: { ...form.delivery, recipientId },
      accountType,
      business: { ...form.business },
    };
    await onSubmit?.(payload);
  }

  return (
    <form className="text-neutral-900" onSubmit={handleSubmit}>
      <ContactCheckoutSection
        email={form.contact.email}
        marketingOptIn={form.contact.marketingOptIn}
        signedIn={isAuthenticated}
        onEmailChange={(value) => setForm((f) => ({ ...f, contact: { ...f.contact, email: value } }))}
        onMarketingChange={(checked) =>
          setForm((f) => ({ ...f, contact: { ...f.contact, marketingOptIn: checked } }))
        }
      />

      <section className="mb-7">
        <h2 className="font-magistral m-0 text-base font-bold">Delivery</h2>
        {form.delivery.addressPreview ? (
          <p className="m-0 mb-3 rounded-none border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            Saved address: {form.delivery.addressPreview}
          </p>
        ) : null}
        <p className="m-0 mb-3 text-base font-bold">Who will receive this order?</p>
        <div className="grid gap-3 mb-4 sm:grid-cols-2">
          {form.recipients.map((r) => (
            <button
              key={r.id}
              type="button"
              className={[
                "relative py-3.5 px-4 bg-white border border-neutral-300 cursor-pointer text-left",
                recipientId === r.id ? "border-neutral-900 shadow-[0_0_0_1px_#171717]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setRecipientId(r.id)}
            >
              {recipientId === r.id ? (
                <span className="absolute top-2 right-2 text-sm" aria-hidden>
                  ✓
                </span>
              ) : null}
              <p className="m-0 text-sm font-semibold">{r.name || (r.id === "primary" ? "Primary contact" : r.name)}</p>
              {r.phone ? <p className="mt-1 mb-0 text-xs text-neutral-500">{r.phone}</p> : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="accountType"
              value="personal"
              checked={accountType === "personal"}
              onChange={() => setAccountType("personal")}
            />
            Personal Account
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="accountType"
              value="business"
              checked={accountType === "business"}
              onChange={() => setAccountType("business")}
            />
            Business Account
          </label>
        </div>
      </section>

      <section className="mb-7">
        <h2 className="font-magistral m-0 mb-3 text-base font-bold">Delivery address</h2>
        <p className="m-0 mb-3 text-xs text-neutral-500">Required for shipping. National Address fields for KSA.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["buildingNo", "Building No."],
            ["street", "Street"],
            ["secondary", "Secondary"],
            ["district", "District"],
            ["postalCode", "Postal Code"],
            ["city", "City"],
          ].map(([key, label]) => (
            <input
              key={key}
              type="text"
              className={inputClass}
              placeholder={label}
              value={form.business[key]}
              onChange={(e) => setForm((f) => ({ ...f, business: { ...f.business, [key]: e.target.value } }))}
              required={key === "street" || key === "city"}
              autoComplete={key === "street" ? "street-address" : key === "city" ? "address-level2" : key === "postalCode" ? "postal-code" : undefined}
            />
          ))}
        </div>
        <input
          type="tel"
          className={`${inputClass} mt-3`}
          placeholder="Phone"
          value={form.business.phone}
          onChange={(e) => setForm((f) => ({ ...f, business: { ...f.business, phone: e.target.value } }))}
          autoComplete="tel"
        />
      </section>

      {accountType === "business" ? (
        <section className="mb-7">
          <h2 className="m-0 text-base font-bold">Business Info</h2>
          <select
            className={`${selectClass} mb-3`}
            value={form.business.country}
            onChange={(e) => setForm((f) => ({ ...f, business: { ...f.business, country: e.target.value } }))}
          >
            <option>Saudi Arabia</option>
          </select>
          {[
            ["organizationName", "Organization Name"],
            ["organizationNameAr", "Organization Name in Arabic"],
            ["crNumber", "Certificate of Registration Number"],
            ["vatNumber", "VAT Registration Certificate Number"],
          ].map(([key, label]) => (
            <input
              key={key}
              type="text"
              className={`${inputClass} mb-3`}
              placeholder={label}
              value={form.business[key]}
              onChange={(e) => setForm((f) => ({ ...f, business: { ...f.business, [key]: e.target.value } }))}
            />
          ))}

          <h3 className="m-0 text-base font-bold">Use an invitation code</h3>
          <p className="my-1.5 mb-3 text-xs text-neutral-500">
            If you have an invitation code from your distributor, enter it here.
          </p>
          <input
            type="text"
            className={inputClass}
            placeholder="Invitation code"
            value={form.business.invitationCode}
            onChange={(e) => setForm((f) => ({ ...f, business: { ...f.business, invitationCode: e.target.value } }))}
          />

          <h3 className="m-0 mt-6 text-base font-bold">Official Documents</h3>
          {["Certificate of Registration", "VAT registration Certificate", "National Address Registration"].map(
            (label) => (
              <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 mb-2">
                <input type="text" className={inputClass} readOnly placeholder={label} />
                <button
                  type="button"
                  className="min-h-10 py-2 px-4 text-sm font-medium text-neutral-900 bg-white border border-neutral-300 cursor-pointer"
                >
                  Choose File
                </button>
              </div>
            ),
          )}
          <p className="my-1.5 mb-3 text-xs text-neutral-500">PDF or JPEG format, size limit of 10 MB</p>

          <input
            type="email"
            className={`${inputClass} mt-3`}
            placeholder="Business email"
            value={form.business.email}
            onChange={(e) => setForm((f) => ({ ...f, business: { ...f.business, email: e.target.value } }))}
          />
        </section>
      ) : null}

      <button
        type="submit"
        className="block w-full max-w-96 min-h-12 mt-6 py-3 px-6 text-base font-semibold text-white bg-blue-600 border-0 cursor-pointer hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={busy}
      >
        {submitLabel}
      </button>
    </form>
  );
}
