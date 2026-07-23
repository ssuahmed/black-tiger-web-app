"use client";

import { useCallback, useEffect, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, Button, EmptyState, FormField, Input, LoadingCenter, Spinner } from "@/components/ui";
import { createAccountAddress, deleteAccountAddress, listAccountAddresses } from "@/lib/api/account";
import { formatAddressPreview } from "@/lib/account/mapAccount.mjs";
import { formatApiError } from "@/lib/formatApiError";

/** @param {Record<string, unknown>} row */
function AddressCard({ row, onDelete, busy }) {
  const tags = [];
  if (row.isDefaultShipping) tags.push("Default shipping");
  if (row.isDefaultBilling) tags.push("Default billing");
  const usage = Array.isArray(row.usageTypes) ? row.usageTypes.join(", ") : "";

  return (
    <article className="rounded border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 font-semibold text-neutral-900">{String(row.label ?? "Address")}</p>
          <p className="mt-1 mb-0 text-sm text-neutral-600">{formatAddressPreview(row)}</p>
          {usage ? <p className="mt-1 mb-0 text-xs text-neutral-500 capitalize">{usage}</p> : null}
          {tags.length ? (
            <p className="mt-2 mb-0 text-xs font-semibold text-primary">{tags.join(" · ")}</p>
          ) : null}
        </div>
        <Button type="button" variant="outline" disabled={busy} onClick={() => onDelete(String(row.id ?? ""))}>
          Remove
        </Button>
      </div>
    </article>
  );
}

export default function AccountAddressesClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    label: "Home",
    addressLine1: "",
    addressLine2: "",
    city: "Riyadh",
    postalCode: "",
    phone: "",
  });

  const load = useCallback(async () => {
    setError("");
    const data = await listAccountAddresses();
    setItems(Array.isArray(data?.items) ? data.items : []);
  }, []);

  useEffect(() => {
    let alive = true;
    load()
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load addresses."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [load]);

  async function onCreate(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createAccountAddress({
        label: draft.label.trim() || "Address",
        usageTypes: ["shipping", "billing"],
        countryCode: "SA",
        addressLine1: draft.addressLine1.trim(),
        addressLine2: draft.addressLine2.trim() || undefined,
        city: draft.city.trim() || "Riyadh",
        postalCode: draft.postalCode.trim(),
        phone: draft.phone.trim() || undefined,
        isDefaultShipping: items.length === 0,
        isDefaultBilling: items.length === 0,
      });
      await load();
      setShowForm(false);
      setDraft({
        label: "Home",
        addressLine1: "",
        addressLine2: "",
        city: "Riyadh",
        postalCode: "",
        phone: "",
      });
    } catch (err) {
      setError(formatApiError(err, "Could not add address."));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(addressId) {
    if (!addressId) return;
    setBusy(true);
    setError("");
    try {
      await deleteAccountAddress(addressId);
      await load();
    } catch (err) {
      setError(formatApiError(err, "Could not remove address."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader
        title="Addresses"
        description="Shipping and billing addresses for checkout."
        action={
          <Button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)} disabled={busy}>
            {showForm ? "Cancel" : "Add address"}
          </Button>
        }
      />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {showForm ? (
        <Card className="mb-6">
          <form className="form-stack max-w-xl" onSubmit={onCreate}>
            <FormField id="addr-label" label="Label">
              <Input
                id="addr-label"
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                disabled={busy}
              />
            </FormField>
            <FormField id="addr-line1" label="Address line 1" required>
              <Input
                id="addr-line1"
                value={draft.addressLine1}
                onChange={(e) => setDraft((d) => ({ ...d, addressLine1: e.target.value }))}
                disabled={busy}
              />
            </FormField>
            <FormField id="addr-line2" label="Address line 2">
              <Input
                id="addr-line2"
                value={draft.addressLine2}
                onChange={(e) => setDraft((d) => ({ ...d, addressLine2: e.target.value }))}
                disabled={busy}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="addr-city" label="City">
                <Input
                  id="addr-city"
                  value={draft.city}
                  onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                  disabled={busy}
                />
              </FormField>
              <FormField id="addr-postal" label="Postal code">
                <Input
                  id="addr-postal"
                  value={draft.postalCode}
                  onChange={(e) => setDraft((d) => ({ ...d, postalCode: e.target.value }))}
                  disabled={busy}
                />
              </FormField>
            </div>
            <FormField id="addr-phone" label="Phone">
              <Input
                id="addr-phone"
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                disabled={busy}
              />
            </FormField>
            <Button type="submit" className="btn-primary" disabled={busy || !draft.addressLine1.trim()}>
              {busy ? <Spinner size="sm" /> : "Save address"}
            </Button>
          </form>
        </Card>
      ) : null}
      {!items.length ? (
        <EmptyState title="No saved addresses" description="Add an address to speed up checkout." />
      ) : (
        <div className="grid gap-4">
          {items.map((row) => (
            <AddressCard key={String(row.id)} row={row} onDelete={onDelete} busy={busy} />
          ))}
        </div>
      )}
    </>
  );
}
