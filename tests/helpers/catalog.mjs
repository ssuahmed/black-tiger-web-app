export const DEMO_PRODUCT_SLUG =
  process.env.PDP_PRODUCT_SLUG || "tiger-10w30-sl-fully-synthetic";

/**
 * Resolve default packaging option id from Commerce API (fixture or live Odoo).
 * @param {string} apiBase
 * @param {string} [slug]
 */
export async function fetchDefaultPackagingId(apiBase, slug = DEMO_PRODUCT_SLUG) {
  const res = await fetch(`${apiBase}/catalog/products/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error(`catalog product HTTP ${res.status} for ${slug}`);
  }
  const body = await res.json();
  const product = body?.data ?? body;
  const options = product?.packagingOptions;
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error(`No packaging options for ${slug}`);
  }
  const chosen = options.find((o) => o && o.default) ?? options[0];
  if (!chosen?.id) {
    throw new Error(`Packaging option missing id for ${slug}`);
  }
  return String(chosen.id);
}
