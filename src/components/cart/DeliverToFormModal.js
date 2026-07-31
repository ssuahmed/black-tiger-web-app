"use client";

import { useEffect, useState } from "react";
import MapLocationPicker from "@/components/cart/MapLocationPicker";
import { ArrowLeftIcon } from "@/components/checkout/icons/CheckoutIcons";
import Modal from "@/components/ui/Modal";
import { EMPTY_ADDRESS_FORM } from "@/lib/cart/addressFormDefaults";

const FIELD_CLASS = "co-field";
const COUNTRIES = [
  { code: "SA", name: "Saudi Arabia", phone: "+966" },
  { code: "SN", name: "Senegal", phone: "+221" },
  { code: "AE", name: "United Arab Emirates", phone: "+971" },
  { code: "BH", name: "Bahrain", phone: "+973" },
  { code: "KW", name: "Kuwait", phone: "+965" },
  { code: "OM", name: "Oman", phone: "+968" },
  { code: "US", name: "United States", phone: "+1" },
  { code: "GB", name: "United Kingdom", phone: "+44" },
];

export default function DeliverToFormModal({ open, onClose, initialValue, onSave }) {
  const [draft, setDraft] = useState(() => ({ ...EMPTY_ADDRESS_FORM, ...initialValue }));
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      setDraft({
        ...EMPTY_ADDRESS_FORM,
        contact: { ...EMPTY_ADDRESS_FORM.contact, ...initialValue?.contact },
        delivery: {
          ...EMPTY_ADDRESS_FORM.delivery,
          ...initialValue?.delivery,
          selectedAddressId: "",
          label: "",
          addressPreview: "",
        },
        location: { ...EMPTY_ADDRESS_FORM.location },
        countryCode: initialValue?.countryCode || EMPTY_ADDRESS_FORM.countryCode,
        phoneCountry: initialValue?.phoneCountry || EMPTY_ADDRESS_FORM.phoneCountry,
        phone: initialValue?.phone || "",
        email: initialValue?.email || initialValue?.contact?.email || "",
      });
      setShowMap(true);
    });
    return () => {
      alive = false;
    };
  }, [open, initialValue]);

  const isSaudi = draft.countryCode === "SA";
  const country = COUNTRIES.find((item) => item.code === draft.countryCode);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function selectCountry(code) {
    const selected = COUNTRIES.find((item) => item.code === code);
    setDraft((current) => ({
      ...current,
      countryCode: code,
      phoneCountry: selected?.phone || current.phoneCountry,
    }));
  }

  function applyResolvedLocation(resolved) {
    const countryCode = String(resolved.countryCode || draft.countryCode || "SA");
    const selected = COUNTRIES.find((item) => item.code === countryCode);
    setDraft((current) => ({
      ...current,
      countryCode,
      phoneCountry: selected?.phone || current.phoneCountry,
      buildingNo: String(resolved.buildingNo || current.buildingNo || ""),
      street: String(resolved.street || current.street || ""),
      secondary: String(resolved.secondary || current.secondary || ""),
      district: String(resolved.district || current.district || ""),
      city: String(resolved.city || current.city || ""),
      stateProvince: String(resolved.stateCode || resolved.stateProvince || current.stateProvince || ""),
      postalCode: String(resolved.postalCode || current.postalCode || ""),
      nationalAddress: String(resolved.nationalAddress || resolved.title || current.nationalAddress || ""),
      landmark: String(resolved.landmark || current.landmark || ""),
      location: {
        lat: Number(resolved.lat ?? resolved.latitude ?? current.location.lat),
        lng: Number(resolved.lng ?? resolved.longitude ?? current.location.lng),
        placeId: String(resolved.placeId || ""),
        formattedAddress: String(resolved.formattedAddress || ""),
      },
    }));
    setShowMap(false);
  }

  function submit(event) {
    event.preventDefault();
    const preview =
      draft.location.formattedAddress ||
      [draft.buildingNo, draft.street, draft.district, draft.city, draft.postalCode]
        .filter(Boolean)
        .join(", ");
    onSave?.({
      ...draft,
      delivery: {
        ...draft.delivery,
        label: draft.delivery.label || `${country?.name || draft.countryCode} address`,
        addressPreview: preview,
        selectedAddressId: "",
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add new address"
      dialogClassName={showMap ? "modal-dialog--map-picker" : "modal-dialog--address-form"}
      leading={
        showMap ? null : (
          <button
            type="button"
            className="co-modal-back"
            onClick={() => setShowMap(true)}
            aria-label="Back to map"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
        )
      }
    >
      {showMap ? (
        <MapLocationPicker value={draft.location} onConfirm={applyResolvedLocation} />
      ) : (
        <form onSubmit={submit}>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Address label
              <select
                className={`${FIELD_CLASS} mt-1`}
                value={draft.delivery.addressKind}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    delivery: {
                      ...current.delivery,
                      addressKind: event.target.value,
                      label: event.target.options[event.target.selectedIndex].text,
                    },
                  }))
                }
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="business">Business</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Country
              <select
                className={`${FIELD_CLASS} mt-1`}
                value={draft.countryCode}
                onChange={(event) => selectCountry(event.target.value)}
              >
                {COUNTRIES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {draft.location.formattedAddress ? (
            <p className="mb-4 rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              {draft.location.formattedAddress}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["buildingNo", "Building no."],
              ["street", "Street"],
              ["secondary", "Secondary address"],
              ["district", "District"],
              ["city", "City"],
              ["stateProvince", "State / Province"],
              ["landmark", "Nearest landmark"],
              ["companyFloor", "Company / Floor"],
            ].map(([key, label]) => (
              <label key={key} className="text-sm font-semibold">
                {label}
                <input
                  className={`${FIELD_CLASS} mt-1`}
                  value={draft[key]}
                  onChange={(event) => update(key, event.target.value)}
                  required={key === "street" || key === "city"}
                />
              </label>
            ))}
            {isSaudi ? (
              <label className="text-sm font-semibold sm:col-span-2">
                National address <span className="font-normal text-neutral-500">(or enter postcode)</span>
                <input
                  className={`${FIELD_CLASS} mt-1`}
                  value={draft.nationalAddress}
                  onChange={(event) => update("nationalAddress", event.target.value)}
                />
              </label>
            ) : null}
            <label className="text-sm font-semibold">
              Postcode
              <input
                className={`${FIELD_CLASS} mt-1`}
                value={draft.postalCode}
                onChange={(event) => update("postalCode", event.target.value)}
                required={!isSaudi || !draft.nationalAddress}
              />
            </label>
            {!isSaudi ? (
              <>
                <label className="text-sm font-semibold">
                  Port of destination
                  <input
                    className={`${FIELD_CLASS} mt-1`}
                    value={draft.portOfDestination}
                    onChange={(event) => update("portOfDestination", event.target.value)}
                    required
                  />
                </label>
                <label className="text-sm font-semibold">
                  Freight type
                  <select
                    className={`${FIELD_CLASS} mt-1`}
                    value={draft.freightType}
                    onChange={(event) => update("freightType", event.target.value)}
                    required
                  >
                    <option value="">Select freight type</option>
                    <option value="air">Air freight</option>
                    <option value="sea">Sea freight</option>
                    <option value="road">Road freight</option>
                  </select>
                </label>
              </>
            ) : null}
            <label className="text-sm font-semibold sm:col-span-2">
              Phone
              <span className="mt-1 flex">
                <input
                  className={`${FIELD_CLASS} w-24 border-r-0`}
                  value={draft.phoneCountry}
                  onChange={(event) => update("phoneCountry", event.target.value)}
                  aria-label="Phone country code"
                />
                <input
                  className={FIELD_CLASS}
                  value={draft.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  required
                  type="tel"
                />
              </span>
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Email
              <input
                className={`${FIELD_CLASS} mt-1`}
                value={draft.email}
                onChange={(event) => update("email", event.target.value)}
                type="email"
              />
            </label>
          </div>
          <button type="submit" className="co-cta co-cta--blue mt-5 w-full">
            Save address
          </button>
        </form>
      )}
    </Modal>
  );
}
