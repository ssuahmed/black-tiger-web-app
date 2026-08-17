"use client";

/**
 * Global cart session: loads/creates a Commerce API cart keyed by `bt_cart_id` in localStorage.
 *
 * Stale carts (404) are dropped and recreated. Mutations always refresh the full cart snapshot
 * so totals/logistics stay consistent across checkout steps.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as cartApi from "@/lib/api/cart";
import { isCartNotFoundError } from "@/lib/cart/cartErrors";
import { readCartId, writeCartId } from "@/lib/cart/cartStorage";

const CartContext = createContext(null);
export { BT_CART_ID_KEY } from "@/lib/cart/cartStorage";

function readStoredCartId() {
  return readCartId();
}

export function CartProvider({ children }) {
  const [cartId, setCartId] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(readStoredCartId()));
  const cartIdRef = useRef(null);
  const inflightRef = useRef(0);

  const persistCartId = useCallback((cid) => {
    cartIdRef.current = cid;
    setCartId(cid);
    writeCartId(cid);
  }, []);

  const resetCartSession = useCallback(() => {
    cartIdRef.current = null;
    writeCartId(null);
    setCartId(null);
    setCart(null);
  }, []);

  const createNewCart = useCallback(async () => {
    const created = await cartApi.createCart({});
    const cid = created?.id;
    if (cid) {
      persistCartId(cid);
      setCart(created);
    }
    return cid ?? null;
  }, [persistCartId]);

  const refreshCart = useCallback(
    async (id) => {
      const cid = id ?? cartIdRef.current ?? readStoredCartId();
      if (!cid) {
        setCart(null);
        return null;
      }
      inflightRef.current += 1;
      if (inflightRef.current === 1) setLoading(true);
      try {
        const data = await cartApi.getCart(cid);
        persistCartId(cid);
        setCart(data);
        return data;
      } catch (err) {
        if (isCartNotFoundError(err)) {
          // Only clear storage if this id is still the active one (avoid racing a newer cart).
          const stillCurrent = (cartIdRef.current ?? readStoredCartId()) === cid;
          if (stillCurrent) {
            resetCartSession();
          }
          return null;
        }
        throw err;
      } finally {
        inflightRef.current = Math.max(0, inflightRef.current - 1);
        if (inflightRef.current === 0) setLoading(false);
      }
    },
    [persistCartId, resetCartSession],
  );

  /** Ensure a usable cart id exists (create if missing/stale). */
  const ensureCart = useCallback(async () => {
    const cid = cartIdRef.current ?? readStoredCartId();
    if (!cid) {
      return createNewCart();
    }
    const data = await refreshCart(cid);
    if (!data) {
      return createNewCart();
    }
    return cid;
  }, [refreshCart, createNewCart]);

  const addLine = useCallback(
    async (line) => {
      let cid = await ensureCart();
      if (!cid) {
        throw new Error("Could not create cart.");
      }
      try {
        await cartApi.addCartItem(cid, line);
      } catch (err) {
        // Retry once on a freshly created cart when the stored id was deleted server-side.
        if (!isCartNotFoundError(err)) throw err;
        resetCartSession();
        cid = await createNewCart();
        if (!cid) throw err;
        await cartApi.addCartItem(cid, line);
      }
      return refreshCart(cid);
    },
    [ensureCart, resetCartSession, createNewCart, refreshCart],
  );

  const updateLine = useCallback(
    async (lineId, patch) => {
      const cid = cartIdRef.current ?? readCartId();
      if (!cid) return null;
      try {
        await cartApi.updateCartItem(cid, lineId, patch);
        return refreshCart(cid);
      } catch (err) {
        if (!isCartNotFoundError(err)) throw err;
        resetCartSession();
        return null;
      }
    },
    [refreshCart, resetCartSession],
  );

  const removeLine = useCallback(
    async (lineId) => {
      const cid = cartIdRef.current ?? readCartId();
      if (!cid) return null;
      try {
        await cartApi.removeCartItem(cid, lineId);
        return refreshCart(cid);
      } catch (err) {
        if (!isCartNotFoundError(err)) throw err;
        resetCartSession();
        return null;
      }
    },
    [refreshCart, resetCartSession],
  );

  const clearCart = useCallback(async () => {
    const cid = cartIdRef.current ?? readCartId();
    if (cid) {
      try {
        await cartApi.deleteCart(cid);
      } catch {
        /* cart may already be gone after checkout */
      }
    }
    resetCartSession();
  }, [resetCartSession]);

  useEffect(() => {
    const cid = readCartId();
    if (!cid) {
      setLoading(false);
      return;
    }
    cartIdRef.current = cid;
    setCartId(cid);
    refreshCart(cid).catch((err) => {
      if (!isCartNotFoundError(err)) return;
      if ((cartIdRef.current ?? readCartId()) === cid) {
        resetCartSession();
      }
    });
  }, [refreshCart, resetCartSession]);

  const value = useMemo(() => {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    const itemCount =
      typeof cart?.totals?.itemCount === "number"
        ? cart.totals.itemCount
        : items.reduce((sum, row) => sum + Number(row?.quantity ?? 0), 0);
    return {
      cartId,
      cart,
      loading,
      itemCount,
      ensureCart,
      refreshCart,
      addLine,
      updateLine,
      removeLine,
      clearCart,
      setCart,
    };
  }, [cartId, cart, loading, ensureCart, refreshCart, addLine, updateLine, removeLine, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart requires CartProvider");
  return ctx;
}
