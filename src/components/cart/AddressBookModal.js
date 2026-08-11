"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BuildingIcon,
  HomeIcon,
  MoreIcon,
  PinIcon,
  VerifiedIcon,
} from "@/components/checkout/icons/CheckoutIcons";
import Modal from "@/components/ui/Modal";
import { listAccountAddresses } from "@/lib/api/account";
import { formatAddressPreview } from "@/lib/account/mapAccount.mjs";
import { WAREHOUSES as STATIC_WAREHOUSES } from "@/data/warehouses";
import { routes } from "@/lib/routes";

function AddressIcon({ kind }) {
  if (kind === "home") return <HomeIcon className="size-5" />;
  if (kind === "pickup") return <PinIcon className="size-6" />;
  return <BuildingIcon className="size-5" />;
}

function toPickupAddress(warehouse) {
  const slug = String(warehouse?.slug ?? "");
  const formattedAddress = String(
    warehouse?.address || warehouse?.formattedAddress || warehouse?.addressLine1 || "",
  );
  return {
    ...warehouse,
    id: `warehouse:${slug}`,
    label: "Pickup Address",
    addressKind: "pickup",
    warehouseSlug: slug,
    addressLine1: formattedAddress,
    formattedAddress,
    city: warehouse?.city,
    countryCode: warehouse?.countryCode || "SA",
    phone: warehouse?.phone,
    contactName: warehouse?.contactName,
    siteName: warehouse?.siteName,
    latitude: warehouse?.latitude,
    longitude: warehouse?.longitude,
    isPickup: true,
  };
}

function addressTimestamp(row) {
  const raw = row?.createdAt || row?.updatedAt || row?.id || "";
  const ms = Date.parse(String(raw));
  return Number.isFinite(ms) ? ms : 0;
}

/** Newest saved address first, pickup always second. */
function mergeAddressBook(saved, warehouses) {
  const newestFirst = [...saved]
    .filter((row) => String(row?.addressKind || "").toLowerCase() !== "pickup")
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const dt = addressTimestamp(b.row) - addressTimestamp(a.row);
      return dt !== 0 ? dt : b.index - a.index;
    })
    .map((entry) => entry.row);
  const pickups = warehouses.map(toPickupAddress);
  if (!newestFirst.length) return pickups;
  return [newestFirst[0], ...pickups, ...newestFirst.slice(1)];
}

export default function AddressBookModal({ open, onClose, selectedAddressId, onSelect, onAddNew }) {
  const [addresses, setAddresses] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const onAddNewRef = useRef(onAddNew);
  onAddNewRef.current = onAddNew;

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    setError("");
    setAddresses([]);
    setWarehouses([]);
    listAccountAddresses()
      .then((addressData) => {
        if (!alive) return;
        const items = Array.isArray(addressData?.items)
          ? addressData.items
          : Array.isArray(addressData)
            ? addressData
            : [];
        const warehouseItems = STATIC_WAREHOUSES;
        if (items.length === 0 && warehouseItems.length === 0) {
          onAddNewRef.current?.();
          return;
        }
        setAddresses(items);
        setWarehouses(warehouseItems);
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Could not load delivery locations.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open]);

  const rows = mergeAddressBook(addresses, warehouses);
  const hasRows = rows.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deliver to"
      dialogClassName="modal-dialog--address-book"
    >
      <button
        type="button"
        className="co-address-book__add"
        onClick={onAddNew}
      >
        <span aria-hidden>＋</span>
        Add new address
      </button>
      {loading ? <p className="py-8 text-center text-sm text-neutral-500">Loading addresses…</p> : null}
      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      {!loading && hasRows ? <p className="co-address-book__eyebrow">Saved addresses</p> : null}
      {!loading && hasRows ? (
        <div className="co-address-book__list">
          {rows.map((row) => {
            const id = String(row.id ?? "");
            const isPickup = Boolean(row.isPickup) || String(row.addressKind || "").toLowerCase() === "pickup";
            const kind = isPickup ? "pickup" : String(row.addressKind || row.label || "home").toLowerCase();
            const contact = addressContact(row);
            const port = String(row.portOfDestination || row.port || "");
            const slug = String(row.warehouseSlug || row.slug || "");
            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                className={[
                  "co-address-book-card",
                  selectedAddressId === id ? "co-address-book-card--selected" : "",
                ].join(" ")}
                onClick={() => onSelect?.(row)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect?.(row);
                  }
                }}
              >
                <span
                  className={[
                    "co-address-book-card__icon",
                    isPickup ? "co-address-book-card__icon--pickup" : "",
                  ].join(" ")}
                >
                  <AddressIcon kind={kind} />
                </span>
                <span className="co-address-book-card__content">
                  <strong className="co-address-book-card__title">
                    {isPickup ? "Pickup Address" : String(row.label || kind)}
                  </strong>
                  {isPickup ? (
                    <>
                      <span className="co-address-book-card__meta">
                        <span className="co-address-book-card__label">Name: </span>
                        <span className="co-address-book-card__value">
                          {String(row.siteName || "BlackTiger Riyadh Warehouse")}
                        </span>
                      </span>
                      {slug ? (
                        <span className="co-address-book-card__meta">
                          <span className="co-address-book-card__label">Location: </span>
                          <Link
                            href={routes.warehouse(slug)}
                            className="co-address-book-card__location-link text-primary underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {String(row.name || "BT Warehouse #01")}
                          </Link>
                        </span>
                      ) : null}
                      <span className="co-address-book-card__address">
                        <span className="co-address-book-card__label">Address: </span>
                        <span className="co-address-book-card__value">
                          {String(row.formattedAddress || row.addressLine1 || "")}
                        </span>
                      </span>
                      <span className="co-address-book-card__contact">
                        {String(row.contactName || "Mohammed Alyemni")} {String(row.phone || "+966-55-5496568")}
                        <VerifiedIcon className="size-3.5 text-emerald-600" />
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="co-address-book-card__address">{formatAddressPreview(row)}</span>
                      {port ? (
                        <span className="co-address-book-card__port">
                          <strong>Port of Destination:</strong> {port}
                        </span>
                      ) : null}
                      {contact ? (
                        <span className="co-address-book-card__contact">
                          {contact}
                          <VerifiedIcon className="size-3.5 text-emerald-600" />
                        </span>
                      ) : null}
                    </>
                  )}
                </span>
                <MoreIcon className="co-address-book-card__more" />
              </div>
            );
          })}
        </div>
      ) : null}
    </Modal>
  );
}

function addressContact(row) {
  const name = String(
    row.contactName ||
      row.recipientName ||
      row.partnerName ||
      [row.firstName, row.lastName].filter(Boolean).join(" ") ||
      "",
  ).trim();
  const phone = String(row.phone || row.mobile || "").trim();
  return [name, phone].filter(Boolean).join(" ");
}
