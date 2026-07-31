"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PinIcon } from "@/components/checkout/icons/CheckoutIcons";
import { Alert, LoadingCenter } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutAuth } from "@/hooks/useCheckoutAuth";
import * as checkoutApi from "@/lib/api/checkout";
import { EMPTY_ADDRESS_FORM } from "@/lib/cart/addressFormDefaults";
import { buildCheckoutAddressPayload } from "@/lib/cart/checkoutAddress";
import { formatApiError } from "@/lib/formatApiError";

export default function WarehousePageClient({ slug }) {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartId } = useCart();
  const activeCartId = cart?.id ?? cartId;
  const { canRender, ready } = useCheckoutAuth(`/warehouses/${slug}`);
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug || !canRender) return;
    let alive = true;
    checkoutApi
      .getWarehouse(slug)
      .then((data) => {
        if (alive) setWarehouse(data?.item ?? data?.warehouse ?? data);
      })
      .catch((err) => {
        if (alive) setError(formatApiError(err, "Could not load this warehouse."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug, canRender]);

  const coordinates = useMemo(() => {
    const lat = Number(warehouse?.latitude ?? warehouse?.lat);
    const lng = Number(warehouse?.longitude ?? warehouse?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }, [warehouse]);
  const address = String(warehouse?.formattedAddress || warehouse?.address || "");
  const mapsQuery = coordinates ? `${coordinates.lat},${coordinates.lng}` : address;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`;

  async function selectWarehouse() {
    if (!activeCartId || !warehouse) {
      setError("Cart not ready.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const pickupForm = {
        ...EMPTY_ADDRESS_FORM,
        contact: { ...EMPTY_ADDRESS_FORM.contact, email: user?.email || "" },
        delivery: {
          ...EMPTY_ADDRESS_FORM.delivery,
          label: String(warehouse.name || "Warehouse pickup"),
          addressPreview: address,
          addressKind: "pickup",
        },
        recipients: EMPTY_ADDRESS_FORM.recipients.map((item, index) =>
          index === 0 ? { ...item, name: user?.displayName || "", phone: user?.phone || "" } : item,
        ),
        countryCode: String(warehouse.countryCode || "SA"),
        street: address || String(warehouse.name || "Warehouse pickup"),
        city: String(warehouse.city || "Riyadh"),
        phone: String(warehouse.phone || user?.phone || ""),
        warehouseSlug: slug,
        location: {
          lat: coordinates?.lat ?? null,
          lng: coordinates?.lng ?? null,
          placeId: String(warehouse.placeId || ""),
          formattedAddress: address,
        },
      };
      await checkoutApi.setCheckoutAddress(activeCartId, buildCheckoutAddressPayload(pickupForm, user));
      sessionStorage.setItem("bt_checkout_pickup", JSON.stringify(pickupForm));
      router.push("/cart/address");
    } catch (err) {
      setError(formatApiError(err, "Could not select this warehouse."));
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !canRender || loading) return <LoadingCenter />;

  return (
    <main className="co-root mx-auto w-full max-w-5xl px-4 py-8">
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {warehouse ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section>
            <p className="mb-2 text-xs font-bold tracking-wider text-blue-700 uppercase">Pickup warehouse</p>
            <h1 className="font-magistral mt-0 mb-4 text-3xl font-bold">{String(warehouse.name || "Warehouse")}</h1>
            <div className="co-panel mb-5">
              <p className="flex items-start gap-2 text-sm"><PinIcon className="mt-0.5 size-5" />{address || "Address unavailable"}</p>
              {warehouse.phone ? <p className="text-sm"><strong>Phone:</strong> {String(warehouse.phone)}</p> : null}
              <OpeningHours value={warehouse.openingHours} />
              <a className="co-cta mt-5 inline-flex w-auto px-6 no-underline" href={directionsUrl} target="_blank" rel="noreferrer">
                Get Directions
              </a>
            </div>
            <button type="button" className="co-cta co-cta--blue w-full sm:w-auto sm:min-w-72" onClick={selectWarehouse} disabled={busy}>
              {busy ? "Selecting…" : "Select this warehouse"}
            </button>
          </section>
          <aside className="h-80 overflow-hidden border border-neutral-300 bg-neutral-100 lg:h-[28rem]">
            {mapsQuery ? (
              <iframe
                title={`${String(warehouse.name || "Warehouse")} map`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">Map unavailable</div>
            )}
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function OpeningHours({ value }) {
  if (!value) return null;
  if (Array.isArray(value)) {
    return (
      <div className="text-sm">
        <strong>Opening hours</strong>
        {value.map((row, index) => <p key={`${String(row?.day || "day")}-${index}`} className="my-1">{String(row?.day || "")} {String(row?.hours || row?.value || "")}</p>)}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="text-sm">
        <strong>Opening hours</strong>
        {Object.entries(value).map(([day, hours]) => <p key={day} className="my-1 capitalize">{day}: {String(hours)}</p>)}
      </div>
    );
  }
  return <p className="text-sm"><strong>Opening hours:</strong> {String(value)}</p>;
}
