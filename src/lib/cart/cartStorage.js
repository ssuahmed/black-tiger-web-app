export const BT_CART_ID_KEY = "bt_cart_id";

export function readCartId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(BT_CART_ID_KEY);
}

/** @param {string | null | undefined} id */
export function writeCartId(id) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(BT_CART_ID_KEY, id);
  else window.localStorage.removeItem(BT_CART_ID_KEY);
}
