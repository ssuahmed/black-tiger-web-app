#!/usr/bin/env node
/**
 * Shop page API contract — validates Commerce API field shapes for /shop.
 * Requires API at API_BASE (default http://localhost:3001/v1).
 */
import assert from "node:assert/strict";

const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
const WEB_BASE = (process.env.WEB_BASE || "http://localhost:3000").replace(/\/$/, "");

/** @type {Array<{ name: string; pass: boolean; detail?: string }>} */
const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

function data(body) {
  return body?.data ?? body;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function validateCategoryNode(node, path = "category") {
  assert.ok(node && typeof node === "object", `${path} must be object`);
  assert.ok(isNonEmptyString(node.slug), `${path}.slug`);
  assert.ok(isNonEmptyString(node.name), `${path}.name`);
  if (node.children != null) {
    assert.ok(Array.isArray(node.children), `${path}.children array`);
    for (let i = 0; i < node.children.length; i++) {
      validateCategoryNode(node.children[i], `${path}.children[${i}]`);
    }
  }
}

function validateProductCard(item, index) {
  const p = `items[${index}]`;
  assert.ok(isNonEmptyString(item.slug), `${p}.slug`);
  assert.ok(isNonEmptyString(item.name), `${p}.name`);
  assert.ok(item.image && typeof item.image === "object", `${p}.image`);
  assert.ok(isNonEmptyString(item.image.url), `${p}.image.url`);
  assert.ok(item.price && typeof item.price === "object", `${p}.price`);
  assert.ok(isNonEmptyString(item.price.formatted), `${p}.price.formatted`);
  if (item.productCode != null) {
    assert.ok(typeof item.productCode === "string", `${p}.productCode string`);
  }
}

async function testCategories() {
  const { ok, status, json } = await apiGet("/catalog/categories");
  assert.ok(ok, `HTTP ${status}`);
  const payload = data(json);
  assert.equal(payload.dataSource, "odoo", "categories dataSource");
  assert.ok(Array.isArray(payload.categories) && payload.categories.length > 0, "categories root");
  for (const root of payload.categories) {
    validateCategoryNode(root, "root");
  }
  const flat = payload.categories.flatMap((r) => r.children ?? []);
  record("GET /catalog/categories", flat.length >= 3, `${flat.length} child categories, dataSource=odoo`);
}

async function testProducts() {
  const { ok, status, json } = await apiGet("/catalog/products?pageSize=10&view=list&sort=relevance");
  assert.ok(ok, `HTTP ${status}`);
  const payload = data(json);
  assert.ok(Array.isArray(payload.items), "items array");
  assert.ok(payload.items.length >= 1, "at least 1 product");
  assert.ok(Array.isArray(payload.facets), "facets array");
  assert.ok(payload.pagination && typeof payload.pagination === "object", "pagination");
  assert.equal(typeof payload.pagination.total, "number");
  assert.equal(typeof payload.pagination.loaded, "number");
  assert.equal(typeof payload.pagination.hasMore, "boolean");
  for (let i = 0; i < payload.items.length; i++) {
    validateProductCard(payload.items[i], i);
  }
  record(
    "GET /catalog/products",
    true,
    `${payload.items.length} products, ${payload.facets.length} facets, total=${payload.pagination.total}`,
  );
}

async function testShopCms() {
  const { ok, status, json } = await apiGet("/content/pages/shop");
  assert.ok(ok, `HTTP ${status}`);
  const page = data(json);
  assert.equal(page.slug, "shop");
  assert.ok(page.blocks && typeof page.blocks === "object", "blocks map");
  assert.ok(page.blocks["hero.title"]?.text || page.blocks["hero.title"]?.html, "hero.title");
  record("GET /content/pages/shop", true, `blocks=${Object.keys(page.blocks).length}`);
}

async function testCategoryFilter() {
  const cats = data((await apiGet("/catalog/categories")).json);
  const slug = cats.categories?.[0]?.children?.[0]?.slug;
  assert.ok(slug, "category slug for filter test");
  const { ok, json } = await apiGet(`/catalog/products?category=${encodeURIComponent(slug)}&pageSize=10`);
  assert.ok(ok);
  const payload = data(json);
  assert.ok(Array.isArray(payload.items));
  record("GET /catalog/products?category=", true, `category=${slug}, items=${payload.items.length}`);
}

async function testReady() {
  const res = await fetch(`${API_BASE.replace(/\/v1$/, "")}/ready`);
  const json = await res.json();
  const ready = data(json);
  assert.equal(ready.integration?.sources?.catalog, "odoo");
  record("GET /ready integration", res.ok && ready.status === "ready", `catalog=${ready.integration?.sources?.catalog}`);
}

async function testShopPageHtml() {
  const res = await fetch(`${WEB_BASE}/shop`);
  const html = await res.text();
  assert.ok(res.ok, `shop page HTTP ${res.status}`);
  assert.ok(html.includes("Categories") || html.includes("categories"), "category nav markup");
  record("GET /shop HTML", true, `HTTP ${res.status}, length=${html.length}`);
}

async function main() {
  console.log(`\nShop API contract tests`);
  console.log(`  API: ${API_BASE}`);
  console.log(`  Web: ${WEB_BASE}\n`);

  const tests = [
    ["ready", testReady],
    ["categories", testCategories],
    ["products", testProducts],
    ["shop cms", testShopCms],
    ["category filter", testCategoryFilter],
    ["shop html", testShopPageHtml],
  ];

  for (const [name, fn] of tests) {
    try {
      await fn();
    } catch (err) {
      record(name, false, err instanceof Error ? err.message : String(err));
    }
  }

  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n--- ${results.length - failed}/${results.length} passed ---\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
