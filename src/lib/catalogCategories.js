import { HOME_APPLICATION_ACCORDIONS } from "@/data/homeApplicationCategories";
import { flattenCategorySlugs } from "@/lib/catalog/shopData.mjs";

/** Category slugs used for PLP routes at `/products/[slug]` (static fallback). */
export const CATALOG_CATEGORY_SLUGS = HOME_APPLICATION_ACCORDIONS.map((c) => c.slug);

const CATEGORY_SET = new Set(CATALOG_CATEGORY_SLUGS);

/** @param {string} slug */
export function isCatalogCategorySlug(slug) {
  return CATEGORY_SET.has(slug);
}

/** @param {string} slug @param {{ categories?: unknown[] } | null | undefined} tree */
export function isCategorySlugInTree(slug, tree) {
  if (!slug) return false;
  const fromApi = flattenCategorySlugs(tree);
  if (fromApi.length) return fromApi.includes(slug);
  return isCatalogCategorySlug(slug);
}
