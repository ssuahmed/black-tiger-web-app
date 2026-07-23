#!/usr/bin/env node
import assert from "node:assert/strict";
import { createApiJson, data } from "./helpers/api.mjs";
import { DEMO_PRODUCT_SLUG, fetchDefaultPackagingId } from "./helpers/catalog.mjs";

const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
const DEMO_EMAIL = process.env.AUTH_DEMO_EMAIL || "demo@blacktiger.com.sa";
const DEMO_PASSWORD = process.env.AUTH_DEMO_PASSWORD || "Password1!";

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

async function testListsCrud() {
  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };
  const packagingOptionId = await fetchDefaultPackagingId(API_BASE);

  const createRes = await apiJson("/lists", {
    method: "POST",
    headers,
    body: JSON.stringify({ name: `M3 Test List ${Date.now()}`, listType: "wishlist" }),
  });
  assert.ok(createRes.ok, `create HTTP ${createRes.status}`);
  const created = data(createRes.json);
  assert.ok(typeof created.id === "string", "list.id");

  const addRes = await apiJson(`/lists/${encodeURIComponent(created.id)}/items`, {
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

  const detailRes = await apiJson(`/lists/${encodeURIComponent(created.id)}?includeItems=true`, { headers });
  assert.ok(detailRes.ok);
  const detail = data(detailRes.json);
  assert.ok(Array.isArray(detail.items) && detail.items.length === 1, "detail.items");

  await apiJson(`/lists/${encodeURIComponent(created.id)}`, { method: "DELETE", headers });
  record("Lists create → add item → get → delete", true, created.name);
}

async function main() {
  try {
    await testListsCrud();
  } catch (err) {
    record("Lists create → add item → get → delete", false, err instanceof Error ? err.message : String(err));
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`\n${failed.length} lists contract check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} lists contract checks passed.`);
}

main();
