#!/usr/bin/env node
/**
 * Category PLP API contract — validates Commerce API fields for /products/[categorySlug].
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

function validateProductCard(item, index) {
  const p = `items[${index}]`;
  assert.ok(typeof item.slug === "string" && item.slug.length > 0, `${p}.slug`);
  assert.ok(typeof item.name === "string" && item.name.length > 0, `${p}.name`);
  assert.ok(item.image && typeof item.image === "object", `${p}.image`);
  assert.ok(typeof item.image.url === "string", `${p}.image.url`);
  assert.ok(item.price && typeof item.price === "object", `${p}.price`);
  assert.ok(typeof item.price.formatted === "string", `${p}.price.formatted`);
}

async function resolveCategorySlug() {
  const { ok, json } = await apiGet("/catalog/categories");
  assert.ok(ok);
  const payload = data(json);
  const slug = payload.categories?.[0]?.children?.[0]?.slug;
  assert.ok(slug, "category slug from tree");
  return String(slug);
}

async function testCategoryDetail(slug) {
  const { ok, status, json } = await apiGet(`/catalog/categories/${encodeURIComponent(slug)}`);
  assert.ok(ok, `HTTP ${status}`);
  const cat = data(json);
  assert.ok(cat.slug === slug, "category.slug");
  assert.ok(typeof cat.name === "string" && cat.name.length > 0, "category.name");
  assert.ok(Array.isArray(cat.breadcrumbs) && cat.breadcrumbs.length >= 2, "breadcrumbs");
  record("GET /catalog/categories/:slug", true, `${cat.name} (${cat.slug})`);
}

async function testCategoryProducts(slug) {
  const { ok, status, json } = await apiGet(
    `/catalog/products?category=${encodeURIComponent(slug)}&pageSize=24&view=list&sort=relevance`,
  );
  assert.ok(ok, `HTTP ${status}`);
  const payload = data(json);
  assert.ok(payload.category && payload.category.slug === slug, "category meta");
  assert.ok(typeof payload.category.name === "string", "category.name");
  assert.ok(Array.isArray(payload.breadcrumbs), "breadcrumbs");
  assert.ok(Array.isArray(payload.facets), "facets");
  assert.ok(Array.isArray(payload.items), "items");
  assert.ok(payload.pagination && typeof payload.pagination.total === "number", "pagination.total");
  for (let i = 0; i < payload.items.length; i++) {
    validateProductCard(payload.items[i], i);
  }
  record(
    "GET /catalog/products?category=",
    true,
    `slug=${slug}, items=${payload.items.length}, total=${payload.pagination.total}`,
  );
}

async function testPlpHtml(slug) {
  const res = await fetch(`${WEB_BASE}/products/${encodeURIComponent(slug)}`);
  const html = await res.text();
  assert.ok(res.ok, `PLP HTTP ${res.status}`);
  assert.ok(html.includes("<h1") || html.includes("heading"), "category heading in HTML");
  record("GET /products/:categorySlug HTML", true, `HTTP ${res.status}, length=${html.length}`);
}

async function testProductSlugNotCategory() {
  const { ok, json } = await apiGet("/catalog/products?pageSize=1");
  assert.ok(ok);
  const slug = data(json).items?.[0]?.slug;
  assert.ok(slug, "product slug");
  const catRes = await apiGet(`/catalog/categories/${encodeURIComponent(slug)}`);
  assert.equal(catRes.status, 404, "product slug must not resolve as category");
  record("GET /catalog/categories/:productSlug", catRes.status === 404, "returns 404");
}

async function main() {
  console.log(`\nPLP API contract tests`);
  console.log(`  API: ${API_BASE}`);
  console.log(`  Web: ${WEB_BASE}\n`);

  try {
    const slug = await resolveCategorySlug();
    await testCategoryDetail(slug);
    await testCategoryProducts(slug);
    await testPlpHtml(slug);
    await testProductSlugNotCategory();
  } catch (err) {
    record("PLP contract", false, err instanceof Error ? err.message : String(err));
  }

  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n--- ${results.length - failed}/${results.length} passed ---\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
