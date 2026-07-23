"use client";

import Link from "next/link";
import { useState } from "react";
import CartLineItem from "@/components/cart/CartLineItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CheckoutLayout from "@/components/cart/CheckoutLayout";
import CheckoutStepTitle from "@/components/cart/CheckoutStepTitle";
import { EmptyState, LoadingCenter } from "@/components/ui";
import { useCommerceCart } from "@/hooks/useCommerceCart";

export default function CartPageClient() {
  const { lines, totals, ready, updateQuantity, removeLine, isEmpty } = useCommerceCart();
  const [busy, setBusy] = useState(false);

  if (!ready) return <LoadingCenter />;

  if (isEmpty) {
    return (
      <>
        <CheckoutStepTitle step="1" title="Your Cart" />
        <EmptyState
          title="Your cart is empty"
          description="Browse products and add items to your cart."
          action={
            <Link href="/shop" className="btn btn-primary inline-flex">
              Continue shopping
            </Link>
          }
        />
      </>
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
    <CheckoutLayout
      sidebar={
        <CartOrderSummary variant="cart" lines={lines} totals={totals} ctaHref="/cart/address" ctaLabel="Check out" />
      }
    >
      <CheckoutStepTitle step="1" title="Your Cart" />
      <div>
        {lines.map((line) => (
          <CartLineItem
            key={line.id}
            line={line}
            onQtyChange={onQtyChange}
            onRemove={onRemove}
            busy={busy}
          />
        ))}
      </div>
    </CheckoutLayout>
  );
}
