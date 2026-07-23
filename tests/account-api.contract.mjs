#!/usr/bin/env node
/**
 * Account API contract — validates Commerce API account endpoints.
 */
import assert from "node:assert/strict";
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

async function login() {
  const res = await apiJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  assert.ok(res.ok, `login HTTP ${res.status}`);
  const tokens = data(res.json);
  assert.ok(tokens.accessToken, "accessToken");
  return tokens.accessToken;
}

async function testAccountEndpoints() {
  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };

  const summaryRes = await apiJson("/account/summary", { headers });
  assert.ok(summaryRes.ok);
  const summary = data(summaryRes.json);
  assert.ok(typeof summary.displayName === "string", "summary.displayName");
  assert.ok(typeof summary.email === "string", "summary.email");
  record("GET /account/summary", true, summary.displayName);

  const profileRes = await apiJson("/account/profile", { headers });
  assert.ok(profileRes.ok);
  const profile = data(profileRes.json);
  assert.equal(profile.email, DEMO_EMAIL);
  record("GET /account/profile", true);

  const ordersRes = await apiJson("/account/orders?page=1&pageSize=10", { headers });
  assert.ok(ordersRes.ok);
  const orders = data(ordersRes.json);
  assert.ok(Array.isArray(orders.items), "orders.items");
  record("GET /account/orders", true, `${orders.items.length} items`);

  const creditsRes = await apiJson("/account/credits", { headers });
  assert.ok(creditsRes.ok);
  const credits = data(creditsRes.json);
  assert.ok(credits.balance && typeof credits.balance.formatted === "string", "credits.balance");
  record("GET /account/credits", true, credits.balance.formatted);

  const addressesRes = await apiJson("/account/addresses", { headers });
  assert.ok(addressesRes.ok);
  const addresses = data(addressesRes.json);
  assert.ok(Array.isArray(addresses.items), "addresses.items");
  record("GET /account/addresses", true, `${addresses.items.length} saved`);

  const notifRes = await apiJson("/account/notifications", { headers });
  assert.ok(notifRes.ok);
  record("GET /account/notifications", true);

  const securityRes = await apiJson("/account/security", { headers });
  assert.ok(securityRes.ok);
  record("GET /account/security", true);
}

async function testAccountPages() {
  const res = await fetch(`${WEB_BASE}/account/credits`);
  assert.ok(res.ok, `account credits HTTP ${res.status}`);
  record("GET /account/credits page", true);
}

async function main() {
  try {
    await testAccountEndpoints();
  } catch (err) {
    record("Account API endpoints", false, err instanceof Error ? err.message : String(err));
  }

  try {
    await testAccountPages();
  } catch (err) {
    record("GET /account/credits page", false, err instanceof Error ? err.message : String(err));
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`\n${failed.length} account contract check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} account contract checks passed.`);
}

main();
