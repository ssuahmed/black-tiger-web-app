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
  const syncedKeyRef = useRef("");

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      syncedKeyRef.current = "";
      return;
    }

    const mergeCartId = readCartId();
    if (!mergeCartId) return;

    const syncKey = mergeCartId;
    if (syncedKeyRef.current === syncKey) return;
    syncedKeyRef.current = syncKey;

    let alive = true;

    createCart({ mergeCartId })
      .then((cart) => {
        if (!alive || !cart?.id) return;
        if (cart.id !== mergeCartId) {
          writeCartId(cart.id);
          syncedKeyRef.current = cart.id;
        }
        return refreshCart(cart.id);
      })
      .catch(() => {
        if (!alive) return;
        syncedKeyRef.current = "";
        writeCartId(null);
      });

    return () => {
      alive = false;
    };
  }, [ready, isAuthenticated, refreshCart]);

  return null;
}
