"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import CategoryHero from "@/components/catalog/CategoryHero";
import CatalogPageTemplate from "@/components/catalog/CatalogPageTemplate";
import FacetFilterPanel from "@/components/catalog/FacetFilterPanel";
import ProductCard from "@/components/catalog/ProductCard";
import ShopCategoryNav, { flattenShopCategories } from "@/components/catalog/ShopCategoryNav";
import { Alert, EmptyState, LoadingCenter, Spinner } from "@/components/ui";
import { SHOP_BREADCRUMBS, SHOP_HERO, SHOP_PAGE_SIZE } from "@/data/shopPageContent";
import * as catalogApi from "@/lib/api/catalog";
import { normalizeCategoryTree, normalizeProductList } from "@/lib/catalog/shopData.mjs";
import { formatApiError } from "@/lib/formatApiError";

/** @param {Record<string, string[]>} filters @param {Array<{ key: string; options?: Array<{ value: string; label?: string }> }>} facets */
function filtersToActiveChips(filters, facets) {
  /** @type {Array<{ key: string; value: string; label: string }>} */
  const out = [];
  for (const [key, vals] of Object.entries(filters)) {
    const facet = facets.find((f) => f.key === key);
    for (const value of vals) {
      const opt = facet?.options?.find((o) => o.value === value);
      out.push({ key, value, label: opt?.label ?? value.toUpperCase() });
    }
  }
  return out;
}

/** @param {string | null} selectedCategory @param {Array<{ slug: string; name: string }>} categories */
function shopBreadcrumbs(selectedCategory, categories) {
  if (!selectedCategory) {
    return SHOP_BREADCRUMBS;
  }
  const cat = categories.find((c) => c.slug === selectedCategory);
  return [
    { label: "HOME", href: "/" },
    { label: "SHOP", href: "/shop" },
    { label: cat?.name ?? selectedCategory.toUpperCase() },
  ];
}

function filtersToSelection(filters) {
  /** @type {Record<string, Set<string>>} */
  const out = {};
  for (const [k, arr] of Object.entries(filters)) {
    out[k] = new Set(Array.isArray(arr) ? arr : []);
  }
  return out;
}

/**
 * @param {{
 *   hero?: typeof SHOP_HERO & { bodyHtml?: string };
 *   initialCategories?: { categories: unknown[] } | null;
 *   initialProducts?: ReturnType<typeof normalizeProductList>;
 *   dataSource?: 'odoo' | 'mock' | null;
 * }} props
 */
function ShopPageInner({
  hero = SHOP_HERO,
  initialCategories = null,
  initialProducts = null,
  dataSource = null,
}) {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [categoryTree, setCategoryTree] = useState(initialCategories);
  const [pageData, setPageData] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl && typeof categoryFromUrl === "string" ? categoryFromUrl : null,
  );
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(!initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [liveSource, setLiveSource] = useState(dataSource);
  const skipInitialFetchRef = useRef(Boolean(initialProducts));

  const categories = useMemo(() => flattenShopCategories(categoryTree), [categoryTree]);

  const items = useMemo(() => {
    const raw = pageData?.items;
    return Array.isArray(raw) ? raw : [];
  }, [pageData]);

  const facets = useMemo(() => {
    const raw = pageData?.facets;
    return Array.isArray(raw) ? raw : [];
  }, [pageData]);

  const breadcrumbs = useMemo(
    () => shopBreadcrumbs(selectedCategory, categories),
    [selectedCategory, categories],
  );

  const pagination =
    pageData?.pagination && typeof pageData.pagination === "object" ? pageData.pagination : null;
  const hasMore = Boolean(pagination?.hasMore);
  const totalResults = typeof pagination?.total === "number" ? pagination.total : items.length;
  const loadedCount = typeof pagination?.loaded === "number" ? pagination.loaded : items.length;

  const selection = useMemo(() => filtersToSelection(filters), [filters]);
  const activeFilters = useMemo(() => filtersToActiveChips(filters, facets), [filters, facets]);

  const buildParams = useCallback(
    (cursorVal) => {
      /** @type {Record<string, unknown>} */
      const params = {
        pageSize: SHOP_PAGE_SIZE,
        view: "list",
        sort: "relevance",
      };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (cursorVal) params.cursor = cursorVal;
      for (const [key, vals] of Object.entries(filters)) {
        if (vals.length) params[key] = vals;
      }
      return params;
    },
    [selectedCategory, filters],
  );

  const isDefaultQuery = !selectedCategory && Object.keys(filters).length === 0;

  useEffect(() => {
    if (initialCategories) return;
    let alive = true;
    async function loadCategories() {
      try {
        const data = await catalogApi.listCategories();
        if (alive) setCategoryTree(normalizeCategoryTree(data));
      } catch {
        if (alive) setCategoryTree(null);
      }
    }
    void loadCategories();
    return () => {
      alive = false;
    };
  }, [initialCategories]);

  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl, selectedCategory]);

  useEffect(() => {
    const shouldUseServerSnapshot =
      skipInitialFetchRef.current && isDefaultQuery && !categoryFromUrl;
    if (shouldUseServerSnapshot) {
      skipInitialFetchRef.current = false;
      setLoading(false);
      return;
    }

    let alive = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const data = await catalogApi.listProducts(buildParams(null));
        if (!alive) return;
        setPageData(normalizeProductList(data));
      } catch (e) {
        if (!alive) return;
        setError(formatApiError(e, "Unable to load products."));
        setPageData(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, [buildParams, isDefaultQuery, categoryFromUrl]);

  const toggleFacet = useCallback((facetKey, value, checked) => {
    setFilters((prev) => {
      const next = { ...prev };
      const cur = [...(next[facetKey] ?? [])];
      if (checked) {
        if (!cur.includes(value)) cur.push(value);
      } else {
        const idx = cur.indexOf(value);
        if (idx >= 0) cur.splice(idx, 1);
      }
      next[facetKey] = cur;
      return next;
    });
  }, []);

  const removeFilter = useCallback((facetKey, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      const cur = [...(next[facetKey] ?? [])].filter((v) => v !== value);
      if (cur.length) next[facetKey] = cur;
      else delete next[facetKey];
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSelectedCategory(null);
  }, []);

  const selectCategory = useCallback((slug) => {
    setSelectedCategory(slug);
    setFilters({});
  }, []);

  const loadMore = useCallback(async () => {
    const nextCursor = pagination?.nextCursor ? String(pagination.nextCursor) : "";
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const data = await catalogApi.listProducts(buildParams(nextCursor));
      const moreItems = data?.items;
      if (!Array.isArray(moreItems)) return;
      setPageData((prev) => {
        if (!prev) return normalizeProductList(data);
        const prevItems = Array.isArray(prev.items) ? prev.items : [];
        return {
          ...prev,
          ...normalizeProductList(data),
          items: [...prevItems, ...moreItems],
        };
      });
    } catch (e) {
      setError(formatApiError(e, "Unable to load more products."));
    } finally {
      setLoadingMore(false);
    }
  }, [buildParams, loadingMore, pagination?.nextCursor]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <CatalogPageTemplate
      variant="shop"
      breadcrumbs={breadcrumbs}
      hero={<CategoryHero {...hero} />}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearAllFilters}
      sidebar={
        <div className="flex flex-col gap-4">
          <ShopCategoryNav
            categories={categories}
            selectedSlug={selectedCategory}
            onSelect={selectCategory}
          />
          {facets.length > 0 ? (
            <FacetFilterPanel facets={facets} selection={selection} onToggle={toggleFacet} collapsible />
          ) : null}
        </div>
      }
      footer={
        !loading && items.length > 0 ? (
          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <p className="m-0 text-sm text-neutral-600">
              {loadedCount} of {totalResults} Results
              {liveSource === "odoo" ? (
                <span className="sr-only"> (live catalog)</span>
              ) : null}
            </p>
            <button
              type="button"
              className="inline-flex min-w-40 cursor-pointer items-center justify-center border border-primary bg-white px-8 py-2.5 text-xs font-bold tracking-wide text-primary uppercase transition-colors duration-150 hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!hasMore || loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore ? <Spinner size="sm" /> : "LOAD MORE"}
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 justify-self-end border-none bg-transparent p-0 text-xs text-neutral-600 hover:text-primary"
              onClick={scrollToTop}
            >
              Back to top
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-xs"
                aria-hidden
              >
                ↑
              </span>
            </button>
          </div>
        ) : null
      }
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <LoadingCenter className="py-16" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            selectedCategory
              ? "No products in this category yet. Try All products or another category."
              : liveSource === "odoo"
                ? "The catalog is empty. Check that Odoo seed modules are installed."
                : "Unable to load products. Ensure the Commerce API is running with ODOO_MODE=live."
          }
          action={
            selectedCategory || Object.keys(filters).length > 0 ? (
              <button type="button" className="btn btn-primary" onClick={clearAllFilters}>
                Show all products
              </button>
            ) : null
          }
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((p) => {
            const row = p && typeof p === "object" ? /** @type {{ id?: string; slug?: string }} */ (p) : {};
            const key = row.id ?? row.slug ?? JSON.stringify(row);
            return (
              <li key={key}>
                <ProductCard product={/** @type {Record<string, unknown>} */ (row)} variant="shop" />
              </li>
            );
          })}
        </ul>
      )}
    </CatalogPageTemplate>
  );
}

/** @param {Parameters<typeof ShopPageInner>[0]} props */
export default function ShopPageClient(props) {
  return (
    <Suspense fallback={<LoadingCenter className="py-20" />}>
      <ShopPageInner {...props} />
    </Suspense>
  );
}
