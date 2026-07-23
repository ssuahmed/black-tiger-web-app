"use client";

import { cn } from "@/lib/cn";

/**
 * Storefront category picker for /shop — all products or one category.
 *
 * @param {{
 *   categories: Array<{ slug: string; name: string; href?: string }>;
 *   selectedSlug: string | null;
 *   onSelect: (slug: string | null) => void;
 * }} props
 */
export default function ShopCategoryNav({ categories, selectedSlug, onSelect }) {
  return (
    <nav
      className="card card--padded text-sm text-neutral-900"
      aria-label="Product categories"
    >
      <h2 className="m-0 mb-3 text-xs font-bold tracking-[0.12em] text-neutral-900 uppercase">
        Categories
      </h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        <li>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "w-full cursor-pointer border-none bg-transparent px-0 py-1.5 text-left text-sm transition-colors",
              selectedSlug === null
                ? "font-bold text-primary"
                : "text-neutral-700 hover:text-primary",
            )}
          >
            All products
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.slug}>
            <button
              type="button"
              onClick={() => onSelect(cat.slug)}
              className={cn(
                "w-full cursor-pointer border-none bg-transparent px-0 py-1.5 text-left text-sm transition-colors",
                selectedSlug === cat.slug
                  ? "font-bold text-primary"
                  : "text-neutral-700 hover:text-primary",
              )}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** @param {{ categories?: Array<{ slug: string; name: string; children?: Array<{ slug: string; name: string; href?: string }> }> } | null | undefined} tree */
export function flattenShopCategories(tree) {
  /** @type {Array<{ slug: string; name: string; href?: string }>} */
  const out = [];
  const roots = tree?.categories;
  if (!Array.isArray(roots)) return out;

  for (const root of roots) {
    for (const child of root.children ?? []) {
      out.push({
        slug: child.slug,
        name: child.name,
        href: child.href,
      });
      for (const sub of child.children ?? []) {
        out.push({
          slug: sub.slug,
          name: sub.name,
          href: sub.href,
        });
      }
    }
  }
  return out;
}
