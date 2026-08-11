"use client";

/**
 * Checkout payment step: creates a payment intent, redirects to PayTabs for card/Apple Pay,
 * or submits immediately for COD/wire. Wire success routes to the receipt upload page.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import CheckoutStepTitle from "@/components/cart/CheckoutStepTitle";
import PaymentForm from "@/components/cart/PaymentForm";
import { BagIcon } from "@/components/checkout/icons/CheckoutIcons";
import { Alert, LoadingCenter, Money } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutAuth } from "@/hooks/useCheckoutAuth";
import { useCheckoutStepGuard } from "@/hooks/useCheckoutStepGuard";
import { useCommerceCart } from "@/hooks/useCommerceCart";
import { CommerceApiError } from "@/lib/api/client";
import * as checkoutApi from "@/lib/api/checkout";
import { createQuoteAndDownloadPdf } from "@/lib/api/quotes";
import { normalizeCheckoutTotals } from "@/lib/checkout/mapCheckout.mjs";
import { formatApiError } from "@/lib/formatApiError";
import { routes } from "@/lib/routes";

export default function PaymentPageClient() {
  const router = useRouter();
  const { cart, cartId: sessionCartId, clearCart, refreshCart } = useCart();
  const activeCartId = cart?.id ?? sessionCartId;
  const { lines, totals, logistics, promo, ready, isEmpty } = useCommerceCart();
  const { canRender } = useCheckoutAuth("/cart/payment");
  const [busy, setBusy] = useState(false);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [error, setError] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [done, setDone] = useState(null);
  const { shouldRender, summary, summaryLoading } = useCheckoutStepGuard({
    step: "payment",
    cartId: activeCartId,
    ready,
    isEmpty,
    enabled: !done,
  });

  const checkoutTotals = useMemo(() => normalizeCheckoutTotals(summary), [summary]);
  const paymentTotals = useMemo(() => {
    const shipping = checkoutTotals.shipping;
    const discount = checkoutTotals.discount || totals.discount || 0;
    const vat = checkoutTotals.vat || totals.vat || 0;
    const grandTotal =
      checkoutTotals.grandTotal || totals.subtotal - discount + vat + shipping;
    return {
      ...totals,
      discount,
      vat,
      shipping,
      grandTotal,
      totalInclVat: grandTotal,
      formattedDiscount: checkoutTotals.formattedDiscount || totals.formattedDiscount,
      formattedVat: checkoutTotals.formattedVat || totals.formattedVat,
      formattedShipping: checkoutTotals.formattedShipping || totals.formattedShipping,
      formattedGrandTotal: checkoutTotals.formattedGrandTotal || totals.formattedGrandTotal,
      formattedTotalInclVat: checkoutTotals.formattedGrandTotal || totals.formattedTotalInclVat,
    };
  }, [totals, checkoutTotals]);

  if (done) {
    return (
      <CheckoutLayout
        formLayout
        preset="checkoutForm"
        className="co-payment-page font-sf-pro"
        sidebar={<CartOrderSummary variant="payment" lines={lines} totals={paymentTotals} />}
      >
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
      const hosted = method === "card" || method === "apple_pay";
      // Hosted methods leave the site; order placement happens on /cart/payment/return.
      if (hosted && intent?.redirectUrl) {
        window.location.assign(intent.redirectUrl);
        return;
      }
      // Sandbox / non-redirect hosted path: confirm then submit in-place.
      if (hosted && intent?.paymentIntentId) {
        await checkoutApi.confirmPaymentIntent(activeCartId, {
          paymentIntentId: intent.paymentIntentId,
        });
      }
      const result = await checkoutApi.submitCheckout(activeCartId, {
        confirm: true,
        paymentMethod: method,
      });
      await clearCart();
      if (method === "wire") {
        const orderId = encodeURIComponent(String(result?.orderId ?? ""));
        const orderNumber = encodeURIComponent(String(result?.orderNumber ?? ""));
        router.push(
          `${routes.accountWireTransfer}?orderId=${orderId}&orderNumber=${orderNumber}`,
        );
        return;
      }
      setDone(result);
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Checkout failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateQuote() {
    if (!activeCartId) {
      setError("Cart not ready.");
      return;
    }
    setQuoteBusy(true);
    setError("");
    setQuoteMessage("");
    try {
      const result = await createQuoteAndDownloadPdf({
        cartId: activeCartId,
        purchaseOrderNumber: summary?.purchaseOrderNumber
          ? String(summary.purchaseOrderNumber)
          : undefined,
        notes: summary?.orderNotes ? String(summary.orderNotes) : undefined,
      });
      setQuoteMessage(
        `Quote ${String(result?.quoteId ?? "")} downloaded as PDF.`,
      );
    } catch (err) {
      setError(formatApiError(err, "Could not create quote PDF."));
    } finally {
      setQuoteBusy(false);
    }
  }

  return (
    <CheckoutLayout
      formLayout
      preset="checkoutForm"
      className="co-payment-page font-sf-pro"
      sidebar={
        <CartOrderSummary
          variant="payment"
          lines={lines}
          totals={paymentTotals}
          logistics={logistics}
          promo={promo}
          cartId={activeCartId}
          onPromoChanged={refreshCart}
        />
      }
    >
      <CheckoutStepTitle
        step="4"
        title="Payment"
        showContinue={false}
        trailing={
          <div className="co-payment-head__actions">
            <button
              type="button"
              className="co-payment-quote"
              onClick={handleCreateQuote}
              disabled={quoteBusy || busy}
            >
              {quoteBusy ? "Preparing PDF…" : "Create Quote"}
            </button>
            <Link href={routes.cart} className="co-payment-bag" aria-label="Cart">
              <BagIcon className="size-5" />
            </Link>
          </div>
        }
      />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {quoteMessage ? (
        <Alert variant="success" className="mb-4">
          {quoteMessage}
        </Alert>
      ) : null}
      {summary?.selectedShipping ? (
        <Alert variant="info" className="mb-4 hidden" hidden>
          Shipping: {String(summary.selectedShipping.label ?? "Selected")} ·{" "}
          <Money
            value={String(
              summary.selectedShipping.price?.formatted ?? checkoutTotals.formattedShipping,
            )}
          />
        </Alert>
      ) : null}
      <PaymentForm onPay={handlePay} busy={busy} />
    </CheckoutLayout>
  );
}
