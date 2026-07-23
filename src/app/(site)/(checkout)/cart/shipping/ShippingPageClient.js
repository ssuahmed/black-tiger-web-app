"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CartLineItem from "@/components/cart/CartLineItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import CheckoutStepTitle from "@/components/cart/CheckoutStepTitle";
import ShippingRecommendationPanel from "@/components/cart/ShippingRecommendationPanel";
import { Alert, LoadingCenter } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutAuth } from "@/hooks/useCheckoutAuth";
import { useCheckoutStepGuard } from "@/hooks/useCheckoutStepGuard";
import { useCommerceCart } from "@/hooks/useCommerceCart";
import { CommerceApiError } from "@/lib/api/client";
import * as checkoutApi from "@/lib/api/checkout";
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

  const { lines, totals, ready, isEmpty } = useCommerceCart();
  const { canRender } = useCheckoutAuth("/cart/shipping");
  const { shouldRender, summary, summaryLoading } = useCheckoutStepGuard({
    step: "shipping",
    cartId: activeCartId,
    ready,
    isEmpty,
  });

  const selectedShipping = useMemo(() => {
    const row = shippingOpts.find((o) => o && typeof o === "object" && String(o.id) === shippingOptionId);
    return normalizeShippingOption(row && typeof row === "object" ? row : {});
  }, [shippingOpts, shippingOptionId]);

  const shippingTotals = useMemo(
    () => ({
      ...totals,
      shipping: selectedShipping.priceAmount,
      totalInclVat: totals.subtotal + selectedShipping.priceAmount,
      formattedShipping: selectedShipping.priceFormatted || totals.formattedShipping,
      formattedTotalInclVat: formatTotal(totals.subtotal + selectedShipping.priceAmount),
    }),
    [totals, selectedShipping],
  );

  const shippingMethods = useMemo(
    () => shippingOpts.map((row) => normalizeShippingOption(row && typeof row === "object" ? row : {})),
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
        const savedId = summary?.shippingOptionId ? String(summary.shippingOptionId) : "";
        const recommended = options.find((row) => row && typeof row === "object" && row.recommended === true);
        const initial =
          savedId && options.some((row) => row && typeof row === "object" && String(row.id) === savedId)
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
      await checkoutApi.setCheckoutShipping(activeCartId, { shippingOptionId });
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
      sidebar={
        <CartOrderSummary
          variant="shipping"
          lines={lines}
          totals={shippingTotals}
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
            etaDays: m.etaDays,
          }))}
          selectedShippingId={shippingOptionId}
        />
      }
    >
      <CheckoutStepTitle step="3" title="Shipping" continueHref="/cart/address" />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      <ShippingRecommendationPanel recommendation={normalizedRecommendation} />
      <section className="mb-6">
        <h2 className="font-magistral m-0 mb-3 text-base font-bold">Shipping method</h2>
        <div className="grid gap-2">
          {shippingMethods.map((method) => (
            <label
              key={method.id}
              className={[
                "flex cursor-pointer items-center justify-between gap-3 border px-4 py-3",
                shippingOptionId === method.id ? "border-neutral-900 shadow-[0_0_0_1px_#171717]" : "border-neutral-300",
              ].join(" ")}
            >
              <span className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="shippingOption"
                  value={method.id}
                  checked={shippingOptionId === method.id}
                  onChange={() => setShippingOptionId(method.id)}
                  disabled={busy}
                />
                <span>
                  {method.label}
                  {method.recommended ? (
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Recommended
                    </span>
                  ) : null}
                  {method.etaDays != null ? (
                    <span className="ml-1 text-neutral-500">· Est. {method.etaDays} days</span>
                  ) : null}
                </span>
              </span>
              {method.priceFormatted ? <span className="text-sm font-semibold">{method.priceFormatted}</span> : null}
            </label>
          ))}
        </div>
      </section>
      <div>
        {lines.map((line) => (
          <CartLineItem key={`ship-${line.id}`} line={line} />
        ))}
      </div>
    </CheckoutLayout>
  );
}

/** @param {number} amount */
function formatTotal(amount) {
  return `\uFDFC ${amount.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
