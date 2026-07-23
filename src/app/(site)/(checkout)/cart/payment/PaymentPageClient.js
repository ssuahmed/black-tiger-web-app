"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import CheckoutStepTitle from "@/components/cart/CheckoutStepTitle";
import PaymentForm from "@/components/cart/PaymentForm";
import { Alert, LoadingCenter } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutAuth } from "@/hooks/useCheckoutAuth";
import { useCheckoutStepGuard } from "@/hooks/useCheckoutStepGuard";
import { useCommerceCart } from "@/hooks/useCommerceCart";
import { CommerceApiError } from "@/lib/api/client";
import * as checkoutApi from "@/lib/api/checkout";
import { normalizeCheckoutTotals } from "@/lib/checkout/mapCheckout.mjs";
import { routes } from "@/lib/routes";

export default function PaymentPageClient() {
  const { cart, cartId: sessionCartId, clearCart } = useCart();
  const activeCartId = cart?.id ?? sessionCartId;
  const { lines, totals, ready, isEmpty } = useCommerceCart();
  const { canRender } = useCheckoutAuth("/cart/payment");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const { shouldRender, summary, summaryLoading } = useCheckoutStepGuard({
    step: "payment",
    cartId: activeCartId,
    ready,
    isEmpty,
    enabled: !done,
  });

  const checkoutTotals = useMemo(() => normalizeCheckoutTotals(summary), [summary]);
  const paymentTotals = useMemo(
    () => ({
      ...totals,
      shipping: checkoutTotals.shipping,
      totalInclVat: checkoutTotals.grandTotal || totals.subtotal + checkoutTotals.shipping,
      formattedShipping: checkoutTotals.formattedShipping || totals.formattedShipping,
      formattedTotalInclVat: checkoutTotals.formattedGrandTotal || totals.formattedTotalInclVat,
    }),
    [totals, checkoutTotals],
  );

  if (done) {
    return (
      <CheckoutLayout formLayout sidebar={<CartOrderSummary variant="payment" lines={lines} totals={paymentTotals} />}>
        <Alert variant="success" role="status">
          Order placed. Your order number is {String(done.orderNumber ?? "")}.
        </Alert>
        <p className="mt-2 text-sm text-neutral-600">{String(done.message ?? "Thank you for your order.")}</p>
        <Link href={routes.accountOrders} className="btn btn-primary mt-6 inline-flex">
          View orders
        </Link>
        <Link href={routes.shop} className="btn btn-outline mt-3 inline-flex">
          Continue shopping
        </Link>
      </CheckoutLayout>
    );
  }

  if (!ready || !canRender || summaryLoading) return <LoadingCenter />;
  if (!shouldRender) return null;

  async function handlePay({ method }) {
    if (!activeCartId) {
      setError("Cart not ready.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const intent = await checkoutApi.createPaymentIntent(activeCartId, { method });
      if (method === "card" && intent?.redirectUrl) {
        window.location.assign(intent.redirectUrl);
        return;
      }
      if (method === "card" && intent?.paymentIntentId) {
        await checkoutApi.confirmPaymentIntent(activeCartId, {
          paymentIntentId: intent.paymentIntentId,
        });
      }
      const result = await checkoutApi.submitCheckout(activeCartId, {
        confirm: true,
        paymentMethod: method,
      });
      setDone(result);
      await clearCart();
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Checkout failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <CheckoutLayout formLayout sidebar={<CartOrderSummary variant="payment" lines={lines} totals={paymentTotals} />}>
      <CheckoutStepTitle step="4" title="Payment" continueHref="/cart/shipping" />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {summary?.selectedShipping ? (
        <Alert variant="info" className="mb-4">
          Shipping: {String(summary.selectedShipping.label ?? "Selected")} ·{" "}
          {String(summary.selectedShipping.price?.formatted ?? checkoutTotals.formattedShipping)}
        </Alert>
      ) : null}
      <PaymentForm onPay={handlePay} busy={busy} />
    </CheckoutLayout>
  );
}
