#!/usr/bin/env node
/**
 * Cart API contract — validates Commerce API cart fields for /cart.
 */
import assert from "node:assert/strict";
import { DEMO_PRODUCT_SLUG, fetchDefaultPackagingId } from "./helpers/catalog.mjs";
import { createApiJson, data } from "./helpers/api.mjs";

const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
const WEB_BASE = (process.env.WEB_BASE || "http://localhost:3000").replace(/\/$/, "");

/** @type {Array<{ name: string; pass: boolean; detail?: string }>} */
const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const apiJson = createApiJson(API_BASE);

function validateCartLine(item, index) {
  const p = `items[${index}]`;
  assert.ok(typeof item.id === "string" && item.id.length > 0, `${p}.id`);
  assert.ok(typeof item.productSlug === "string", `${p}.productSlug`);
  assert.ok(typeof item.productName === "string" && item.productName.length > 0, `${p}.productName`);
  assert.ok(typeof item.packagingLabel === "string", `${p}.packagingLabel`);
  assert.ok(typeof item.quantity === "number" && item.quantity > 0, `${p}.quantity`);
  assert.ok(["unit", "partial", "full"].includes(item.palletType), `${p}.palletType`);
  assert.ok(typeof item.unitPrice === "number" && item.unitPrice > 0, `${p}.unitPrice`);
  assert.ok(typeof item.totalPrice === "number" && item.totalPrice > 0, `${p}.totalPrice`);
  assert.ok(typeof item.imageUrl === "string" && item.imageUrl.length > 0, `${p}.imageUrl`);
}

async function testCartFlow() {
  const packagingOptionId = await fetchDefaultPackagingId(API_BASE);
  const createRes = await apiJson("/cart", { method: "POST", body: "{}" });
  assert.ok(createRes.ok, `create HTTP ${createRes.status}`);
  const created = data(createRes.json);
  assert.ok(typeof created.id === "string", "cart.id");
  const cartId = created.id;

  const addRes = await apiJson(`/cart/${encodeURIComponent(cartId)}/items`, {
    method: "POST",
    body: JSON.stringify({
      productSlug: DEMO_PRODUCT_SLUG,
      packagingOptionId,
      quantity: 2,
      palletType: "unit",
    }),
  });
  assert.ok(addRes.ok, `add item HTTP ${addRes.status}`);

  const getRes = await apiJson(`/cart/${encodeURIComponent(cartId)}`);
  assert.ok(getRes.ok, `get cart HTTP ${getRes.status}`);
  const cart = data(getRes.json);
  assert.ok(Array.isArray(cart.items) && cart.items.length === 1, "cart.items");
  validateCartLine(cart.items[0], 0);
  assert.ok(cart.totals && typeof cart.totals.subtotal === "number", "totals.subtotal");
  assert.ok(typeof cart.totals.formattedSubtotal === "string", "totals.formattedSubtotal");
  assert.equal(cart.totals.itemCount, 2, "totals.itemCount sums quantities");
  assert.equal(cart.items[0].unitPrice, 88.5, "variant unit price");
  assert.equal(cart.items[0].totalPrice, 177, "line total");

  await apiJson(`/cart/${encodeURIComponent(cartId)}`, { method: "DELETE" });
  record("Cart create → add → get → delete", true, `subtotal ${cart.totals.subtotal} SAR`);
}

async function testCartPage() {
  const res = await fetch(`${WEB_BASE}/cart`);
  assert.ok(res.ok, `cart page HTTP ${res.status}`);
  const html = await res.text();
  assert.ok(html.includes("Your Cart") || html.includes("cart"), "cart page shell");
  record("GET /cart page", true);
}

async function testStaleCartId() {
  const packagingOptionId = await fetchDefaultPackagingId(API_BASE);
  const createRes = await apiJson("/cart", { method: "POST", body: "{}" });
  assert.ok(createRes.ok);
  const staleId = data(createRes.json).id;

  const delRes = await apiJson(`/cart/${encodeURIComponent(staleId)}`, { method: "DELETE" });
  assert.ok(delRes.ok || delRes.status === 204, `delete HTTP ${delRes.status}`);

  const getStale = await apiJson(`/cart/${encodeURIComponent(staleId)}`);
  assert.equal(getStale.status, 404, "deleted cart GET is 404");

  const addStale = await apiJson(`/cart/${encodeURIComponent(staleId)}/items`, {
    method: "POST",
    body: JSON.stringify({
      productSlug: DEMO_PRODUCT_SLUG,
      packagingOptionId,
      quantity: 1,
      palletType: "unit",
    }),
  });
  assert.equal(addStale.status, 404, "deleted cart add is 404");

  const freshRes = await apiJson("/cart", { method: "POST", body: "{}" });
  assert.ok(freshRes.ok);
  const freshId = data(freshRes.json).id;
  assert.notEqual(freshId, staleId);

  const addFresh = await apiJson(`/cart/${encodeURIComponent(freshId)}/items`, {
    method: "POST",
    body: JSON.stringify({
      productSlug: DEMO_PRODUCT_SLUG,
      packagingOptionId,
      quantity: 1,
      palletType: "unit",
    }),
  });
  assert.ok(addFresh.ok, `fresh cart add HTTP ${addFresh.status}`);
  await apiJson(`/cart/${encodeURIComponent(freshId)}`, { method: "DELETE" });

  record("Stale cart id returns 404; replacement cart accepts items", true);
}

async function main() {
  try {
    await testCartFlow();
  } catch (err) {
    record("Cart create → add → get → delete", false, err instanceof Error ? err.message : String(err));
  }

  try {
    await testStaleCartId();
  } catch (err) {
    record(
      "Stale cart id returns 404; replacement cart accepts items",
      false,
      err instanceof Error ? err.message : String(err),
    );
  }

  try {
    await testCartPage();
  } catch (err) {
    record("GET /cart page", false, err instanceof Error ? err.message : String(err));
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`\n${failed.length} contract check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} cart contract checks passed.`);
}

main();
