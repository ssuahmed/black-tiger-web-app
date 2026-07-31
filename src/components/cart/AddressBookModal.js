"use client";

import { useEffect, useState } from "react";
import {
  BuildingIcon,
  HomeIcon,
  MoreIcon,
  PinIcon,
  VerifiedIcon,
} from "@/components/checkout/icons/CheckoutIcons";
import Modal from "@/components/ui/Modal";
import { listAccountAddresses } from "@/lib/api/account";
import * as checkoutApi from "@/lib/api/checkout";
import { formatAddressPreview } from "@/lib/account/mapAccount.mjs";

function AddressIcon({ kind }) {
  if (kind === "home") return <HomeIcon className="size-5" />;
  if (kind === "pickup") return <PinIcon className="size-6" />;
  return <BuildingIcon className="size-5" />;
}

export default function AddressBookModal({ open, onClose, selectedAddressId, onSelect, onAddNew }) {
  const [addresses, setAddresses] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    Promise.all([listAccountAddresses(), checkoutApi.listWarehouses()])
      .then(([addressData, warehouseData]) => {
        if (!alive) return;
        setAddresses(Array.isArray(addressData?.items) ? addressData.items : Array.isArray(addressData) ? addressData : []);
        setWarehouses(Array.isArray(warehouseData?.items) ? warehouseData.items : Array.isArray(warehouseData) ? warehouseData : []);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : "Could not load delivery locations.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open]);

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
      {!loading ? <p className="co-address-book__eyebrow">Saved addresses</p> : null}
      <div className="co-address-book__list">
        {addresses.map((row) => {
          const id = String(row.id ?? "");
          const kind = String(row.addressKind || row.label || "home").toLowerCase();
          const contact = addressContact(row);
          const port = String(row.portOfDestination || row.port || "");
          return (
            <button
              key={id}
              type="button"
              className={[
                "co-address-book-card",
                selectedAddressId === id ? "co-address-book-card--selected" : "",
              ].join(" ")}
              onClick={() => onSelect?.(row)}
            >
              <span className="co-address-book-card__icon">
                <AddressIcon kind={kind} />
              </span>
              <span className="co-address-book-card__content">
                <strong className="co-address-book-card__title">{String(row.label || kind)}</strong>
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
              </span>
              <MoreIcon className="co-address-book-card__more" />
            </button>
          );
        })}
        {warehouses.map((warehouse) => {
          const slug = String(warehouse.slug ?? "");
          const id = `warehouse:${slug}`;
          const formattedAddress = String(
            warehouse.address || warehouse.formattedAddress || warehouse.addressLine1 || "",
          );
          const pickupAddress = {
            ...warehouse,
            id,
            label: "Pickup Address",
            addressKind: "pickup",
            warehouseSlug: slug,
            addressLine1: formattedAddress,
            formattedAddress,
          };
          return (
            <button
              key={slug}
              type="button"
              className={[
                "co-address-book-card",
                selectedAddressId === id ? "co-address-book-card--selected" : "",
              ].join(" ")}
              onClick={() => onSelect?.(pickupAddress)}
            >
              <span className="co-address-book-card__icon co-address-book-card__icon--pickup">
                <AddressIcon kind="pickup" />
              </span>
              <span className="co-address-book-card__content">
                <strong className="co-address-book-card__title">Pickup Address</strong>
                <span className="co-address-book-card__meta">
                  Name: {String(warehouse.name || "Black Tiger Warehouse")}
                </span>
                {slug ? (
                  <span className="co-address-book-card__meta">
                    Location: <span className="text-primary underline">{slug}</span>
                  </span>
                ) : null}
                <span className="co-address-book-card__address">Address: {formattedAddress}</span>
              </span>
              <MoreIcon className="co-address-book-card__more" />
            </button>
          );
        })}
      </div>
      {!loading && !addresses.length && !warehouses.length && !error ? (
        <p className="py-8 text-center text-sm text-neutral-500">No saved addresses yet.</p>
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
