#!/usr/bin/env node
/**
 * Checkout API contract — cart → address → shipping → summary → submit.
 */
import assert from "node:assert/strict";
import { DEMO_PRODUCT_SLUG, fetchDefaultPackagingId } from "./helpers/catalog.mjs";
import { createApiJson, data } from "./helpers/api.mjs";

const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
const DEMO_EMAIL = process.env.AUTH_DEMO_EMAIL || "demo@blacktiger.com.sa";
const DEMO_PASSWORD = process.env.AUTH_DEMO_PASSWORD || "Password1!";

/** @type {Array<{ name: string; pass: boolean; detail?: string }>} */
const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const apiJson = createApiJson(API_BASE);

async function login() {
  const res = await apiJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  assert.ok(res.ok);
  return data(res.json).accessToken;
}

async function testCheckoutFlow() {
  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };
  const packagingOptionId = await fetchDefaultPackagingId(API_BASE);

  const cartRes = await apiJson("/cart", { method: "POST", headers, body: "{}" });
  assert.ok(cartRes.ok);
  const cart = data(cartRes.json);

  const addRes = await apiJson(`/cart/${encodeURIComponent(cart.id)}/items`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      productSlug: DEMO_PRODUCT_SLUG,
      packagingOptionId,
      quantity: 1,
      palletType: "unit",
    }),
  });
  assert.ok(addRes.ok, `add item HTTP ${addRes.status}`);

  const addressRes = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/address`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      shippingAddress: {
        countryCode: "SA",
        addressLine1: "3462 Old Al-Kharj Road",
        city: "Riyadh",
        postalCode: "11564",
        usageTypes: ["shipping", "billing"],
        label: "Office",
      },
      billingSameAsShipping: true,
      deliveryContact: {
        usageTypes: ["delivery", "order_notifications"],
        firstName: "Demo",
        lastName: "Customer",
        email: DEMO_EMAIL,
        phone: "+966500000000",
      },
    }),
  });
  assert.ok(addressRes.ok, `address HTTP ${addressRes.status}`);

  const summaryAfterAddress = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/summary`, { headers });
  assert.ok(summaryAfterAddress.ok);
  const afterAddress = data(summaryAfterAddress.json);
  assert.equal(afterAddress.addressComplete, true);
  assert.ok(afterAddress.deliveryAddress, "deliveryAddress");

  const shipOptsRes = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/shipping-options`, { headers });
  assert.ok(shipOptsRes.ok);
  const shipPayload = data(shipOptsRes.json);
  const shipOpts = Array.isArray(shipPayload) ? shipPayload : shipPayload?.options;
  assert.ok(Array.isArray(shipOpts) && shipOpts.length > 0, "shipping options");
  assert.ok(shipPayload?.recommendation?.efficiency || Array.isArray(shipPayload), "recommendation or legacy array");
  if (shipPayload?.recommendation) {
    assert.ok(typeof shipPayload.recommendation.message === "string", "recommendation message");
    record("Shipping options include efficiency recommendation", true, String(shipPayload.recommendation.efficiency?.score));
  }

  const shipRes = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/shipping`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ shippingOptionId: shipOpts[0].id }),
  });
  assert.ok(shipRes.ok);

  const summaryAfterShipping = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/summary`, { headers });
  assert.ok(summaryAfterShipping.ok);
  const afterShipping = data(summaryAfterShipping.json);
  assert.equal(afterShipping.shippingComplete, true);
  assert.ok(afterShipping.totals && afterShipping.totals.grandTotal > afterShipping.totals.subtotal, "grand total");

  const cardIntentRes = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/payment-intent`, {
    method: "POST",
    headers,
    body: JSON.stringify({ method: "card" }),
  });
  assert.ok(cardIntentRes.ok, `card payment-intent HTTP ${cardIntentRes.status}`);
  const cardIntent = data(cardIntentRes.json);
  assert.ok(cardIntent.paymentIntentId, "paymentIntentId");
  if (cardIntent.redirectUrl) {
    assert.equal(cardIntent.gateway, "paytabs");
    assert.ok(String(cardIntent.redirectUrl).startsWith("http"), "PayTabs redirectUrl");
    record("Card payment-intent returns PayTabs redirectUrl", true, cardIntent.gateway);
  } else {
    assert.ok(
      cardIntent.status === "requires_confirmation" || cardIntent.status === "succeeded",
      `sandbox card status=${cardIntent.status}`,
    );
    record("Card payment-intent (sandbox, no redirect)", true, cardIntent.status);
  }

  const codIntentRes = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/payment-intent`, {
    method: "POST",
    headers,
    body: JSON.stringify({ method: "cod" }),
  });
  assert.ok(codIntentRes.ok, `cod payment-intent HTTP ${codIntentRes.status}`);
  const codIntent = data(codIntentRes.json);
  assert.equal(codIntent.status, "succeeded");
  assert.ok(!codIntent.redirectUrl, "COD should not redirect");

  const submitRes = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ confirm: true, paymentMethod: "cod" }),
  });
  assert.ok(submitRes.ok, `submit HTTP ${submitRes.status}`);
  const order = data(submitRes.json);
  assert.ok(order.orderNumber, "orderNumber");

  record("Checkout address → shipping → summary → submit", true, order.orderNumber);
}

async function testStaleCartDuringCheckout() {
  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };
  const packagingOptionId = await fetchDefaultPackagingId(API_BASE);

  const staleRes = await apiJson("/cart", { method: "POST", headers, body: "{}" });
  const staleId = data(staleRes.json).id;
  await apiJson(`/cart/${encodeURIComponent(staleId)}`, { method: "DELETE", headers });

  const cartRes = await apiJson("/cart", { method: "POST", headers, body: "{}" });
  assert.ok(cartRes.ok);
  const cart = data(cartRes.json);
  assert.notEqual(cart.id, staleId);

  await apiJson(`/cart/${encodeURIComponent(cart.id)}/items`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      productSlug: DEMO_PRODUCT_SLUG,
      packagingOptionId,
      quantity: 1,
      palletType: "unit",
    }),
  });

  const staleGet = await apiJson(`/cart/${encodeURIComponent(staleId)}`, { headers });
  assert.equal(staleGet.status, 404);

  const summaryRes = await apiJson(`/checkout/${encodeURIComponent(cart.id)}/summary`, { headers });
  assert.ok(summaryRes.ok, `summary HTTP ${summaryRes.status}`);

  record("Checkout proceeds after stale cart id discarded", true, cart.id);
}

async function main() {
  try {
    await testCheckoutFlow();
  } catch (err) {
    record("Checkout address → shipping → summary → submit", false, err instanceof Error ? err.message : String(err));
  }

  try {
    await testStaleCartDuringCheckout();
  } catch (err) {
    record(
      "Checkout proceeds after stale cart id discarded",
      false,
      err instanceof Error ? err.message : String(err),
    );
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`\n${failed.length} checkout contract check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} checkout contract checks passed.`);
}

main();
