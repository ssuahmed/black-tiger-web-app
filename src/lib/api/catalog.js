import { buildQueryString, commerceFetch } from "./client.js";

export function listCategories() {
  return commerceFetch("catalog/categories", { method: "GET" });
}

export function getCategoryBySlug(slug) {
  return commerceFetch(`catalog/categories/${encodeURIComponent(slug)}`, { method: "GET" });
}

/** @param {Record<string, string | number | string[] | undefined>} [params] */
export function listProducts(params) {
  return commerceFetch(`catalog/products${buildQueryString(/** @type {Record<string, unknown>} */ (params || {}))}`, {
    method: "GET",
  });
}

const CATALOG_REVALIDATE = { next: { revalidate: 60 } };

export function getProductBySlug(slug) {
  return commerceFetch(`catalog/products/${encodeURIComponent(slug)}`, {
    method: "GET",
    ...CATALOG_REVALIDATE,
  });
}

export function getProductPriceQuote(slug, body) {
  return commerceFetch(`catalog/products/${encodeURIComponent(slug)}/price-quote`, {
    method: "POST",
    json: body,
  });
}

export function getFeatured() {
  return commerceFetch("catalog/featured", { method: "GET" });
}
