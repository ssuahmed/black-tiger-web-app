"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const resetCartSession = useCallback(() => {
    writeCartId(null);
    setCartId(null);
    setCart(null);
  }, []);

  const createNewCart = useCallback(async () => {
    const created = await cartApi.createCart({});
    const cid = created?.id;
    if (cid) {
      setCartId(cid);
      writeCartId(cid);
      setCart(created);
    }
    return cid ?? null;
  }, []);

  const refreshCart = useCallback(
    async (id) => {
      const cid = id ?? cartId ?? readStoredCartId();
      if (!cid) {
        setCart(null);
        return null;
      }
      setLoading(true);
      try {
        const data = await cartApi.getCart(cid);
        setCart(data);
        setCartId(cid);
        writeCartId(cid);
        return data;
      } catch (err) {
        if (isCartNotFoundError(err)) {
          const stillCurrent = readStoredCartId() === cid;
          if (stillCurrent) {
            resetCartSession();
          }
          return null;
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cartId, resetCartSession],
  );

  const ensureCart = useCallback(async () => {
    let cid = cartId ?? readStoredCartId();
    if (!cid) {
      return createNewCart();
    }
    const data = await refreshCart(cid);
    if (!data) {
      return createNewCart();
    }
    return cid;
  }, [cartId, refreshCart, createNewCart]);

  const addLine = useCallback(
    async (line) => {
      let cid = await ensureCart();
      if (!cid) {
        throw new Error("Could not create cart.");
      }
      try {
        await cartApi.addCartItem(cid, line);
      } catch (err) {
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
      const cid = cartId ?? readCartId();
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
    [cartId, refreshCart, resetCartSession],
  );

  const removeLine = useCallback(
    async (lineId) => {
      const cid = cartId ?? readCartId();
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
    [cartId, refreshCart, resetCartSession],
  );

  const clearCart = useCallback(async () => {
    const cid = cartId ?? readCartId();
    if (cid) {
      try {
        await cartApi.deleteCart(cid);
      } catch {
        /* cart may already be gone after checkout */
      }
    }
    resetCartSession();
  }, [cartId, resetCartSession]);

  useEffect(() => {
    const cid = readCartId();
    if (!cid) return;
    setCartId(cid);
    refreshCart(cid).catch((err) => {
      if (!isCartNotFoundError(err)) return;
      if (readCartId() === cid) {
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
