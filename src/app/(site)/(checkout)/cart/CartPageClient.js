"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import CartLineItem from "@/components/cart/CartLineItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CartPricingModal from "@/components/cart/CartPricingModal";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import CheckoutStepTitle from "@/components/cart/CheckoutStepTitle";
import { EmptyState, LoadingCenter } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useCommerceCart } from "@/hooks/useCommerceCart";

export default function CartPageClient() {
  const { cart } = useCart();
  const { lines, totals, logistics, promo, ready, updateQuantity, removeLine, isEmpty, refreshCart } = useCommerceCart();
  const [busy, setBusy] = useState(false);
  const [pricingLine, setPricingLine] = useState(null);

  const refresh = useCallback(async () => {
    await refreshCart?.();
  }, [refreshCart]);

  if (!ready) return <LoadingCenter />;

  if (isEmpty) {
    return (
      <div className="co-root co-cart-page">
        <CheckoutStepTitle step="1" title="Your Cart" variant="cart" />
        <EmptyState
          title="Your cart is empty"
          description="Browse products and add items to your cart."
          action={
            <Link href="/products" className="btn btn-primary inline-flex">
              Continue shopping
            </Link>
          }
        />
      </div>
    );
  }

  async function onQtyChange(lineId, qty) {
    setBusy(true);
    try {
      await updateQuantity(lineId, qty);
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(lineId) {
    setBusy(true);
    try {
      await removeLine(lineId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <CheckoutLayout
        preset="cart"
        className="co-cart-page"
        top={<CheckoutStepTitle step="1" title="Your Cart" variant="cart" />}
        sidebar={
          <CartOrderSummary
            variant="cart"
            lines={lines}
            totals={totals}
            logistics={logistics}
            promo={promo}
            cartId={cart?.id}
            onPromoChanged={refresh}
            ctaHref="/cart/address"
            ctaLabel="Check out"
          />
        }
      >
        <div>
          {lines.map((line) => (
            <CartLineItem
              key={line.id}
              line={line}
              onRemove={onRemove}
              onOpenPricing={setPricingLine}
              busy={busy}
            />
          ))}
        </div>
      </CheckoutLayout>
      <CartPricingModal
        key={pricingLine ? `${pricingLine.id}-${pricingLine.quantity}` : "cart-pricing-closed"}
        open={Boolean(pricingLine)}
        line={pricingLine}
        onClose={() => setPricingLine(null)}
        onUpdateQuantity={onQtyChange}
      />
    </>
  );
}
