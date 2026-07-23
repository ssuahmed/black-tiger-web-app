"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import { Alert, LoadingCenter } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutAuth } from "@/hooks/useCheckoutAuth";
import { useCommerceCart } from "@/hooks/useCommerceCart";
import { CommerceApiError } from "@/lib/api/client";
import * as checkoutApi from "@/lib/api/checkout";
import { routes } from "@/lib/routes";

const POLL_MS = 1500;
const MAX_ATTEMPTS = 40;

/** Prevents duplicate submits across React Strict Mode remounts (same cart). */
const submitLocks = new Map();

export default function PaymentReturnPageClient() {
  const { cart, cartId: sessionCartId, clearCart } = useCart();
  const activeCartId = cart?.id ?? sessionCartId;
  const { lines, totals, ready } = useCommerceCart();
  const { canRender } = useCheckoutAuth("/cart/payment/return");
  const [phase, setPhase] = useState("polling");
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!ready || !canRender || !activeCartId || doneRef.current) return;

    let cancelled = false;
    let attempts = 0;
    let timer = 0;

    async function placeOrder() {
      if (doneRef.current) return;
      setPhase("submitting");

      // Set the lock synchronously so Strict Mode remounts share one submit.
      let promise = submitLocks.get(activeCartId);
      if (!promise) {
        promise = checkoutApi.submitCheckout(activeCartId, {
          confirm: true,
          paymentMethod: "card",
        });
        submitLocks.set(activeCartId, promise);
      }

      try {
        const result = await promise;
        // Always apply success even if this effect instance was cleaned up (Strict Mode).
        if (doneRef.current) return;
        doneRef.current = true;
        setDone(result);
        setPhase("done");
        submitLocks.delete(activeCartId);
        await clearCart();
      } catch (err) {
        submitLocks.delete(activeCartId);
        if (cancelled && !doneRef.current) {
          // Remount will retry.
          return;
        }
        const msg =
          err instanceof CommerceApiError ? err.message : "Could not create your order.";
        setPhase("failed");
        setError(msg);
      }
    }

    async function tick() {
      if (cancelled || doneRef.current) return;
      attempts += 1;
      try {
        let intent = await checkoutApi.getPaymentIntent(activeCartId);
        if (
          intent?.status !== "succeeded" &&
          intent?.status !== "failed" &&
          intent?.paymentIntentId
        ) {
          try {
            await checkoutApi.confirmPaymentIntent(activeCartId, {
              paymentIntentId: intent.paymentIntentId,
            });
            intent = await checkoutApi.getPaymentIntent(activeCartId);
          } catch {
            /* still pending */
          }
        }

        if (intent?.status === "succeeded") {
          await placeOrder();
          return;
        }

        if (intent?.status === "failed") {
          setPhase("failed");
          setError("Payment was declined or failed. You can try again from the payment step.");
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          setPhase("failed");
          setError(
            "Payment confirmation timed out. If you completed payment, wait a moment and try placing the order again from Payment.",
          );
          return;
        }

        timer = window.setTimeout(tick, POLL_MS);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof CommerceApiError ? err.message : "Could not confirm payment status.";
        setPhase("failed");
        setError(msg);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [ready, canRender, activeCartId, clearCart]);

  if (!ready || !canRender) return <LoadingCenter />;

  if (done || phase === "done") {
    return (
      <CheckoutLayout formLayout sidebar={<CartOrderSummary variant="payment" lines={lines} totals={totals} />}>
        <Alert variant="success" role="status">
          Order placed. Your order number is {String(done?.orderNumber ?? "")}.
        </Alert>
        <p className="mt-2 text-sm text-neutral-600">{String(done?.message ?? "Thank you for your order.")}</p>
        <Link href={routes.accountOrders} className="btn btn-primary mt-6 inline-flex">
          View orders
        </Link>
        <Link href={routes.shop} className="btn btn-outline mt-3 inline-flex">
          Continue shopping
        </Link>
      </CheckoutLayout>
    );
  }

  if (phase === "failed") {
    return (
      <CheckoutLayout formLayout sidebar={<CartOrderSummary variant="payment" lines={lines} totals={totals} />}>
        <Alert variant="error" className="mb-4">
          {error || "Payment failed."}
        </Alert>
        <Link href={routes.cartPayment} className="btn btn-primary inline-flex">
          Back to payment
        </Link>
        <Link href={routes.accountOrders} className="btn btn-outline mt-3 inline-flex">
          View orders
        </Link>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout formLayout sidebar={<CartOrderSummary variant="payment" lines={lines} totals={totals} />}>
      <Alert variant="info" role="status">
        {phase === "submitting"
          ? "Payment confirmed. Creating your order…"
          : "Confirming your PayTabs payment…"}
      </Alert>
      <LoadingCenter className="py-12" />
    </CheckoutLayout>
  );
}
