/**
 * Checkout orchestration against the Commerce API (`/v1/checkout/*`).
 *
 * Typical flow: address → shipping options → shipping selection → payment-intent
 * (hosted PayTabs redirect or on-site methods) → confirm → submit order.
 */

import { commerceFetch } from "./client.js";

export function setCheckoutAddress(cartId, body) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/address`, {
    method: "PUT",
    json: body,
  });
}

export function resolveCheckoutAddress(body) {
  return commerceFetch("checkout/address/resolve", { method: "POST", json: body });
}

export function listWarehouses() {
  return commerceFetch("checkout/warehouses", { method: "GET" });
}

export function getWarehouse(slug) {
  return commerceFetch(`checkout/warehouses/${encodeURIComponent(slug)}`, { method: "GET" });
}

export function getCheckoutSummary(cartId) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/summary`, { method: "GET" });
}

export function getShippingOptions(cartId) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/shipping-options`, { method: "GET" });
}

export function setCheckoutShipping(cartId, body) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/shipping`, {
    method: "PUT",
    json: body,
  });
}

export function submitCheckout(cartId, body) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/submit`, {
    method: "POST",
    json: body ?? { confirm: true },
  });
}

export function createPaymentIntent(cartId, body) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/payment-intent`, {
    method: "POST",
    json: body,
  });
}

export function getPaymentIntent(cartId) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/payment-intent`, {
    method: "GET",
  });
}

export function confirmPaymentIntent(cartId, body) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/payment-intent/confirm`, {
    method: "POST",
    json: body,
  });
}
