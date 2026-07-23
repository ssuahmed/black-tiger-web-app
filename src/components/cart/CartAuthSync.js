"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { createCart } from "@/lib/api/cart";
import { readCartId, writeCartId } from "@/lib/cart/cartStorage";

/** Attaches anonymous cart to the signed-in user after login or on session restore. */
export default function CartAuthSync() {
  const { isAuthenticated, ready } = useAuth();
  const { refreshCart } = useCart();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!ready || !isAuthenticated || syncingRef.current) return;

    const mergeCartId = readCartId();
    if (!mergeCartId) return;

    let alive = true;
    syncingRef.current = true;

    createCart({ mergeCartId })
      .then((cart) => {
        if (!alive || !cart?.id) return;
        return refreshCart(cart.id);
      })
      .catch(() => {
        if (!alive) return;
        writeCartId(null);
      })
      .finally(() => {
        syncingRef.current = false;
      });

    return () => {
      alive = false;
    };
  }, [ready, isAuthenticated, refreshCart]);

  return null;
}
