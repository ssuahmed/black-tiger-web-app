/**
 * Normalize Commerce API catalog payloads for the /shop page.
 */

/** @param {unknown} payload */
export function normalizeCategoryTree(payload) {
  if (!payload || typeof payload !== "object") return null;
  const row = /** @type {{ categories?: unknown; dataSource?: string }} */ (payload);
  if (!Array.isArray(row.categories)) return null;
  return { categories: row.categories };
}

/** @param {unknown} payload */
export function catalogDataSource(payload) {
  if (!payload || typeof payload !== "object") return null;
  const source = /** @type {{ dataSource?: string }} */ (payload).dataSource;
  return source === "odoo" || source === "mock" ? source : null;
}

/** @param {unknown} payload */
export function normalizeProductList(payload) {
  if (!payload || typeof payload !== "object") return null;
  const row = /** @type {{ items?: unknown; facets?: unknown; pagination?: unknown; category?: unknown; breadcrumbs?: unknown }} */ (
    payload
  );
  return {
    items: Array.isArray(row.items) ? row.items : [],
    facets: Array.isArray(row.facets) ? row.facets : [],
    pagination: row.pagination && typeof row.pagination === "object" ? row.pagination : null,
    category: row.category,
    breadcrumbs: row.breadcrumbs,
  };
}

/** @param {{ categories?: Array<{ slug?: string; children?: Array<{ slug?: string }> }> } | null} tree */
export function flattenCategorySlugs(tree) {
  if (!tree?.categories?.length) return [];
  /** @type {string[]} */
  const slugs = [];
  for (const root of tree.categories) {
    for (const child of root.children ?? []) {
      if (child?.slug) slugs.push(String(child.slug));
    }
    if (root.slug) slugs.push(String(root.slug));
  }
  return slugs;
}

/** @param {Array<{ label?: string; href?: string }> | undefined} breadcrumbs */
export function normalizeBreadcrumbs(breadcrumbs) {
  if (!Array.isArray(breadcrumbs) || !breadcrumbs.length) return [];
  return breadcrumbs.map((b) => ({
    label: String(b?.label ?? ""),
    href: b?.href ? String(b.href) : undefined,
  }));
}

/** @param {{ name?: string; banner?: Record<string, unknown> } | null | undefined} category */
export function plpHeroFromCategory(category) {
  if (!category || typeof category !== "object") return null;
  const banner =
    category.banner && typeof category.banner === "object"
      ? /** @type {Record<string, unknown>} */ (category.banner)
      : {};
  const title = category.name ? String(category.name) : "Products";
  return {
    eyebrow: banner.eyebrow ? String(banner.eyebrow) : "PRODUCTS",
    title,
    body: banner.body ? String(banner.body) : undefined,
    bodyHtml: banner.bodyHtml ? String(banner.bodyHtml) : undefined,
    ctaLabel: banner.ctaLabel ? String(banner.ctaLabel) : "SHOP ALL",
    ctaHref: banner.ctaHref ? String(banner.ctaHref) : "/shop",
    backgroundImage:
      (banner.backgroundImage ? String(banner.backgroundImage) : null) ??
      (banner.imageUrl ? String(banner.imageUrl) : undefined),
  };
}
