#!/usr/bin/env node
/**
 * Auth API contract — validates Commerce API auth endpoints used by the web app.
 */
import assert from "node:assert/strict";
import { DEMO_PRODUCT_SLUG, fetchDefaultPackagingId } from "./helpers/catalog.mjs";
import { createApiJson, data } from "./helpers/api.mjs";

const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
const WEB_BASE = (process.env.WEB_BASE || "http://localhost:3000").replace(/\/$/, "");

const DEMO_EMAIL = process.env.AUTH_DEMO_EMAIL || "demo@blacktiger.com.sa";
const DEMO_PASSWORD = process.env.AUTH_DEMO_PASSWORD || "Password1!";

/** @type {Array<{ name: string; pass: boolean; detail?: string }>} */
const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const apiJson = createApiJson(API_BASE);

async function testPasswordPolicy() {
  const { ok, json } = await apiJson("/auth/password/policy");
  assert.ok(ok);
  const policy = data(json);
  assert.ok(Array.isArray(policy.rules) && policy.rules.length >= 1, "rules");
  record("GET /auth/password/policy", true, `${policy.rules.length} rules`);
}

async function testIdentifierAndLogin() {
  const idRes = await apiJson("/auth/identifier", {
    method: "POST",
    body: JSON.stringify({ identifier: DEMO_EMAIL, intent: "login" }),
  });
  assert.ok(idRes.ok, `identifier HTTP ${idRes.status}`);
  const challenge = data(idRes.json);
  assert.ok(typeof challenge.challengeId === "string", "challengeId");
  assert.equal(challenge.nextStep, "login_method");

  const loginRes = await apiJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      challengeId: challenge.challengeId,
    }),
  });
  assert.ok(loginRes.ok, `login HTTP ${loginRes.status}`);
  const tokens = data(loginRes.json);
  assert.ok(typeof tokens.accessToken === "string", "accessToken");
  assert.ok(typeof tokens.refreshToken === "string", "refreshToken");
  assert.ok(tokens.user && tokens.user.email === DEMO_EMAIL, "user.email");

  const refreshRes = await apiJson("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  assert.ok(refreshRes.ok);
  const refreshed = data(refreshRes.json);
  assert.ok(typeof refreshed.accessToken === "string", "refreshed accessToken");

  const ordersRes = await apiJson("/account/orders", {
    headers: { Authorization: `Bearer ${refreshed.accessToken}` },
  });
  assert.ok(ordersRes.ok, `account orders HTTP ${ordersRes.status}`);
  const orders = data(ordersRes.json);
  assert.ok(Array.isArray(orders.items), "orders.items");

  await apiJson("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshed.accessToken}` },
  });

  record("Auth identifier → login → refresh → account → logout", true, DEMO_EMAIL);
}

async function testCartMergeOnAuth() {
  const packagingOptionId = await fetchDefaultPackagingId(API_BASE);
  const anonCartRes = await apiJson("/cart", { method: "POST", body: "{}" });
  assert.ok(anonCartRes.ok);
  const anonCart = data(anonCartRes.json);

  await apiJson(`/cart/${encodeURIComponent(anonCart.id)}/items`, {
    method: "POST",
    body: JSON.stringify({
      productSlug: DEMO_PRODUCT_SLUG,
      packagingOptionId,
      quantity: 1,
      palletType: "unit",
    }),
  });

  const loginRes = await apiJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  assert.ok(loginRes.ok);
  const tokens = data(loginRes.json);

  const mergeRes = await apiJson("/cart", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    body: JSON.stringify({ mergeCartId: anonCart.id }),
  });
  assert.ok(mergeRes.ok);
  const merged = data(mergeRes.json);
  assert.equal(merged.id, anonCart.id, "same cart id after merge");
  assert.ok(Array.isArray(merged.items) && merged.items.length === 1, "items preserved");

  await apiJson(`/cart/${encodeURIComponent(anonCart.id)}`, { method: "DELETE" });
  record("POST /cart mergeCartId attaches user cart", true);
}

async function testSignInPage() {
  const res = await fetch(`${WEB_BASE}/sign-in`);
  assert.ok(res.ok, `sign-in HTTP ${res.status}`);
  const html = await res.text();
  assert.ok(html.includes("Welcome back") || html.includes("sign"), "sign-in shell");
  record("GET /sign-in page", true);
}

async function main() {
  const suites = [
    ["GET /auth/password/policy", testPasswordPolicy],
    ["Auth identifier → login → refresh → account → logout", testIdentifierAndLogin],
    ["POST /cart mergeCartId attaches user cart", testCartMergeOnAuth],
    ["GET /sign-in page", testSignInPage],
  ];

  for (const [name, fn] of suites) {
    try {
      await fn();
    } catch (err) {
      record(name, false, err instanceof Error ? err.message : String(err));
    }
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`\n${failed.length} auth contract check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} auth contract checks passed.`);
}

main();
