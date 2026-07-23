"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AddressForm from "@/components/cart/AddressForm";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import CheckoutStepTitle from "@/components/cart/CheckoutStepTitle";
import { Alert, LoadingCenter } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCartStepGuard } from "@/hooks/useCartStepGuard";
import { useCheckoutAuth } from "@/hooks/useCheckoutAuth";
import { useCommerceCart } from "@/hooks/useCommerceCart";
import { CommerceApiError } from "@/lib/api/client";
import * as checkoutApi from "@/lib/api/checkout";
import { buildCheckoutAddressPayload } from "@/lib/cart/checkoutAddress";

export default function AddressPageClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartId: sessionCartId } = useCart();
  const activeCartId = cart?.id ?? sessionCartId;
  const { lines, totals, ready, isEmpty } = useCommerceCart();
  const { canRender, isAuthenticated, ready: authReady } = useCheckoutAuth("/cart/address");
  const { shouldRender } = useCartStepGuard({
    ready: ready && authReady && isAuthenticated,
    isEmpty,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready || !authReady || !canRender) return <LoadingCenter />;
  if (!shouldRender) return null;

  async function handleSubmit(form) {
    if (!activeCartId) {
      setError("Cart not ready.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await checkoutApi.setCheckoutAddress(activeCartId, buildCheckoutAddressPayload(form, user));
      router.push("/cart/shipping");
    } catch (err) {
      const msg =
        err instanceof CommerceApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save address.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <CheckoutLayout
      formLayout
      sidebar={<CartOrderSummary variant="compact" lines={lines} totals={totals} />}
    >
      <CheckoutStepTitle step="2" title="Your Address" continueHref="/cart" />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      <AddressForm onSubmit={handleSubmit} submitLabel="Continue to shipping" busy={busy} />
    </CheckoutLayout>
  );
}
