"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CartLineItem from "@/components/cart/CartLineItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import CheckoutStepTitle from "@/components/cart/CheckoutStepTitle";
// Kept for later: AI Partial Pallet Optimizer panel
// import ShippingRecommendationPanel from "@/components/cart/ShippingRecommendationPanel";
import { Alert, LoadingCenter } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutAuth } from "@/hooks/useCheckoutAuth";
import { useCheckoutStepGuard } from "@/hooks/useCheckoutStepGuard";
import { useCommerceCart } from "@/hooks/useCommerceCart";
import { CommerceApiError } from "@/lib/api/client";
import * as checkoutApi from "@/lib/api/checkout";
import { mapApiLogistics } from "@/lib/cart/mapApiCart.mjs";
import { formatSarSymbol } from "@/lib/format/money";
import {
  normalizeShippingOption,
  normalizeShippingRecommendation,
  unwrapShippingOptionsPayload,
} from "@/lib/checkout/mapCheckout.mjs";

export default function ShippingPageClient() {
  const router = useRouter();
  const { cart, cartId: sessionCartId } = useCart();
  const activeCartId = cart?.id ?? sessionCartId;
  const [shippingOpts, setShippingOpts] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [shippingOptionId, setShippingOptionId] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { lines, totals, logistics, ready, isEmpty } = useCommerceCart();
  const { canRender } = useCheckoutAuth("/cart/shipping");
  const { shouldRender, summary, summaryLoading } = useCheckoutStepGuard({
    step: "shipping",
    cartId: activeCartId,
    ready,
    isEmpty,
  });

  const selectedShipping = useMemo(() => {
    const fleet = shippingOpts.find(
      (o) =>
        o &&
        typeof o === "object" &&
        (o.isFleetTotal === true || String(o.id) === "fleet-auto" || String(o.id) === shippingOptionId),
    );
    const row =
      shippingOpts.find((o) => o && typeof o === "object" && String(o.id) === "fleet-auto") ||
      fleet ||
      shippingOpts.find((o) => o && typeof o === "object" && String(o.id) === shippingOptionId);
    const normalized = normalizeShippingOption(row && typeof row === "object" ? row : {});
    if (normalized.isFleetTotal || normalized.id === "fleet-auto") {
      return {
        ...normalized,
        priceAmount: normalized.lineTotal || normalized.priceAmount,
        priceFormatted: normalized.priceFormatted,
      };
    }
    return normalized;
  }, [shippingOpts, shippingOptionId]);

  const shippingTotals = useMemo(() => {
    const shipping = Number(selectedShipping.priceAmount || 0);
    const discount = Number(totals.discount || 0);
    const vat = Number(totals.vat || Math.round((totals.subtotal - discount) * 0.15 * 100) / 100);
    const grandTotal = totals.subtotal - discount + vat + shipping;
    return {
      ...totals,
      shipping,
      vat,
      grandTotal,
      totalInclVat: grandTotal,
      formattedShipping: selectedShipping.priceFormatted || formatSarSymbol(shipping),
      formattedVat: formatSarSymbol(vat),
      formattedGrandTotal: formatSarSymbol(grandTotal),
      formattedTotalInclVat: formatSarSymbol(grandTotal),
    };
  }, [totals, selectedShipping]);

  const shippingMethods = useMemo(
    () =>
      shippingOpts
        .map((row) => normalizeShippingOption(row && typeof row === "object" ? row : {}))
        .filter((m) => m.id && !m.isFleetTotal),
    [shippingOpts],
  );

  const normalizedRecommendation = useMemo(
    () =>
      normalizeShippingRecommendation(recommendation) ||
      normalizeShippingRecommendation(
        summary?.shippingRecommendation && typeof summary.shippingRecommendation === "object"
          ? summary.shippingRecommendation
          : null,
      ),
    [recommendation, summary?.shippingRecommendation],
  );

  const sidebarLogistics = useMemo(() => {
    if (normalizedRecommendation?.palletBreakdown) {
      return mapApiLogistics(normalizedRecommendation.palletBreakdown);
    }
    if (summary?.logistics) return mapApiLogistics(summary.logistics);
    return logistics;
  }, [normalizedRecommendation, summary?.logistics, logistics]);

  useEffect(() => {
    if (summary?.orderNotes) setOrderNote(String(summary.orderNotes));
  }, [summary?.orderNotes]);

  useEffect(() => {
    if (!activeCartId || !canRender) return;
    let alive = true;
    async function load() {
      try {
        const payload = await checkoutApi.getShippingOptions(activeCartId);
        if (!alive) return;
        const { options, recommendation: rec } = unwrapShippingOptionsPayload(payload);
        setShippingOpts(options);
        setRecommendation(rec);
        const fleetAuto = options.find(
          (row) =>
            row &&
            typeof row === "object" &&
            (row.isFleetTotal === true || String(row.id) === "fleet-auto"),
        );
        const recommended = options.find((row) => row && typeof row === "object" && row.recommended === true);
        const initial =
          fleetAuto && typeof fleetAuto === "object" && fleetAuto.id
            ? String(fleetAuto.id)
            : savedId && options.some((row) => row && typeof row === "object" && String(row.id) === savedId)
              ? savedId
              : recommended && typeof recommended === "object" && recommended.id
                ? String(recommended.id)
                : options[0] && typeof options[0] === "object" && options[0].id
                  ? String(options[0].id)
                  : "";
        setShippingOptionId(initial);
      } catch {
        if (!alive) return;
        setShippingOpts([]);
        setRecommendation(null);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [activeCartId, canRender, summary?.shippingOptionId]);

  if (!ready || !canRender || summaryLoading) return <LoadingCenter />;
  if (!shouldRender) return null;

  async function continueToPayment() {
    if (!activeCartId || !shippingOptionId) {
      setError("Select a shipping method.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await checkoutApi.setCheckoutShipping(activeCartId, {
        shippingOptionId,
        orderNotes: orderNote || undefined,
      });
      router.push("/cart/payment");
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Could not save shipping.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <CheckoutLayout
      className="co-shipping-page font-sf-pro"
      preset="checkoutShipping"
      sidebar={
        <CartOrderSummary
          variant="shipping"
          lines={lines}
          totals={shippingTotals}
          logistics={sidebarLogistics}
          ctaLabel="Next"
          onCtaClick={continueToPayment}
          ctaDisabled={busy || !shippingOptionId}
          orderNote={orderNote}
          onOrderNoteChange={setOrderNote}
          deliveryAddress={summary?.deliveryAddress ? String(summary.deliveryAddress) : null}
          shippingMethods={shippingMethods.map((m) => ({
            id: m.id,
            label: m.label,
            priceFormatted: m.priceFormatted,
            priceAmount: m.priceAmount,
            etaDays: m.etaDays,
            qty: m.qty,
            palletsLoaded: m.palletsLoaded,
            lineTotal: m.lineTotal,
          }))}
          selectedShippingId={shippingOptionId}
          efficiencyScore={normalizedRecommendation?.score ?? null}
          recommendationMessage={normalizedRecommendation?.message || null}
        />
      }
    >
      <CheckoutStepTitle step="3" title="Shipping (Local shipping)" continueHref="/cart/address" />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {/* Kept for later: AI Partial Pallet Optimizer
      <ShippingRecommendationPanel recommendation={normalizedRecommendation} />
      */}
      <div>
        {lines.map((line) => (
          <CartLineItem key={`ship-${line.id}`} line={line} />
        ))}
      </div>
    </CheckoutLayout>
  );
}
