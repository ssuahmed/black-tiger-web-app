import { commerceFetch } from "./client.js";

export function setCheckoutAddress(cartId, body) {
  return commerceFetch(`checkout/${encodeURIComponent(cartId)}/address`, {
    method: "PUT",
    json: body,
  });
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
