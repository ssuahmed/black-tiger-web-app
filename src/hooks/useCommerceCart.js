"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { mapApiCartLine, mapApiCartTotals, mapApiLogistics, mapApiPromo } from "@/lib/cart/mapApiCart.mjs";

/** @param {{ shipping?: number }} [opts] */
export function useCommerceCart(opts = {}) {
  const { cart, loading, ensureCart, updateLine, removeLine, refreshCart } = useCart();
  const [ready, setReady] = useState(false);
  const shipping = opts.shipping ?? 0;

  useEffect(() => {
    let alive = true;
    ensureCart()
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [ensureCart]);

  const lines = useMemo(() => {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    return items.map((row) => mapApiCartLine(row && typeof row === "object" ? row : {}));
  }, [cart]);

  const totals = useMemo(() => mapApiCartTotals(cart, shipping), [cart, shipping]);
  const logistics = useMemo(() => mapApiLogistics(cart?.logistics), [cart]);
  const promo = useMemo(() => mapApiPromo(cart), [cart]);

  const updateQuantity = useCallback(
    async (lineId, quantity) => {
      const qty = Math.max(1, Number(quantity) || 1);
      await updateLine(lineId, { quantity: qty });
    },
    [updateLine],
  );

  const removeLineById = useCallback(
    async (lineId) => {
      await removeLine(lineId);
    },
    [removeLine],
  );

  return {
    cart,
    lines,
    totals,
    logistics,
    promo,
    ready: ready && !loading,
    loading,
    isEmpty: lines.length === 0,
    updateQuantity,
    removeLine: removeLineById,
    refreshCart,
  };
}
