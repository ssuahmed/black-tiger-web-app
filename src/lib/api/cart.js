/**
 * Cart CRUD helpers for the Commerce API (`/v1/cart/*`).
 * Cart identity is stored client-side (`bt_cart_id`); CartContext owns create/refresh orchestration.
 */

import { commerceFetch } from "./client.js";

export function createCart(body) {
  return commerceFetch("cart", { method: "POST", json: body });
}

export function getCart(cartId) {
  return commerceFetch(`cart/${encodeURIComponent(cartId)}`, { method: "GET" });
}

export function addCartItem(cartId, body) {
  return commerceFetch(`cart/${encodeURIComponent(cartId)}/items`, {
    method: "POST",
    json: body,
  });
}

export function updateCartItem(cartId, lineId, body) {
  return commerceFetch(`cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(lineId)}`, {
    method: "PATCH",
    json: body,
  });
}

export function removeCartItem(cartId, lineId) {
  return commerceFetch(`cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(lineId)}`, {
    method: "DELETE",
  });
}

export function deleteCart(cartId) {
  return commerceFetch(`cart/${encodeURIComponent(cartId)}`, { method: "DELETE" });
}

export function applyCartPromo(cartId, code) {
  return commerceFetch(`cart/${encodeURIComponent(cartId)}/promo`, {
    method: "PUT",
    json: { code },
  });
}

export function removeCartPromo(cartId) {
  return commerceFetch(`cart/${encodeURIComponent(cartId)}/promo`, {
    method: "DELETE",
  });
}
