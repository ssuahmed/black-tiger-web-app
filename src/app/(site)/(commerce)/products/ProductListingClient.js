"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CatalogPageTemplate from "@/components/catalog/CatalogPageTemplate";
import FacetFilterPanel from "@/components/catalog/FacetFilterPanel";
import ProductCard from "@/components/catalog/ProductCard";
import { Alert, Button, EmptyState, LoadingCenter, Spinner } from "@/components/ui";
import { PLP_PAGE_SIZE } from "@/data/shopPageContent";
import { formatApiError } from "@/lib/formatApiError";
import { routes } from "@/lib/routes";
import * as catalogApi from "@/lib/api/catalog";
import { normalizeBreadcrumbs, normalizeProductList } from "@/lib/catalog/shopData.mjs";

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
 *   categorySlug: string;
 *   initialProducts?: ReturnType<typeof normalizeProductList>;
 *   dataSource?: 'odoo' | 'mock' | null;
 * }} props
 */
function ProductListingInner({ categorySlug, initialProducts = null, dataSource = null }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || "";

  const [pageData, setPageData] = useState(initialProducts);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(!initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [liveSource, setLiveSource] = useState(dataSource);
  const skipInitialFetchRef = useRef(Boolean(initialProducts));

  const items = useMemo(() => {
    const raw = pageData?.items;
    return Array.isArray(raw) ? raw : [];
  }, [pageData]);

  const facets = useMemo(() => {
    const raw = pageData?.facets;
    return Array.isArray(raw) ? raw : [];
  }, [pageData]);

  const pagination =
    pageData?.pagination && typeof pageData.pagination === "object" ? pageData.pagination : null;
  const hasMore = Boolean(pagination?.hasMore);
  const totalResults = typeof pagination?.total === "number" ? pagination.total : items.length;
  const loadedCount = typeof pagination?.loaded === "number" ? pagination.loaded : items.length;

  const selection = useMemo(() => filtersToSelection(filters), [filters]);
  const activeFilters = useMemo(() => filtersToActiveChips(filters, facets), [filters, facets]);

  const category =
    pageData?.category && typeof pageData.category === "object"
      ? /** @type {{ name?: string }} */ (pageData.category)
      : {};
  const heading = category?.name ?? "Products";

  const breadcrumbs = useMemo(() => {
    const fromApi = normalizeBreadcrumbs(
      Array.isArray(pageData?.breadcrumbs) ? /** @type {Array<{ label?: string; href?: string }>} */ (pageData.breadcrumbs) : [],
    );
    if (fromApi.length) return fromApi;
    return [
      { label: "HOME", href: "/" },
      { label: "PRODUCTS", href: routes.productsIndex },
      { label: heading },
    ];
  }, [pageData?.breadcrumbs, heading]);

  const buildParams = useCallback(
    (cursorVal) => {
      /** @type {Record<string, unknown>} */
      const params = {
        category: categorySlug,
        pageSize: PLP_PAGE_SIZE,
        view: "list",
        sort: "relevance",
      };
      if (searchQuery) params.q = searchQuery;
      if (cursorVal) params.cursor = cursorVal;
      for (const [key, vals] of Object.entries(filters)) {
        if (vals.length) params[key] = vals;
      }
      return params;
    },
    [categorySlug, filters, searchQuery],
  );

  const isDefaultQuery = Object.keys(filters).length === 0 && !searchQuery;

  useEffect(() => {
    const shouldUseServerSnapshot = skipInitialFetchRef.current && isDefaultQuery;
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
        if (data && typeof data === "object" && "dataSource" in data) {
          const src = /** @type {{ dataSource?: string }} */ (data).dataSource;
          if (src === "odoo" || src === "mock") setLiveSource(src);
        }
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
  }, [buildParams, isDefaultQuery]);

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
      variant="listing"
      breadcrumbs={breadcrumbs}
      title={heading}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearAllFilters}
      sidebar={<FacetFilterPanel facets={facets} selection={selection} onToggle={toggleFacet} collapsible />}
      footer={
        !loading && items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <p className="m-0 text-sm text-neutral-600">
              {loadedCount} of {totalResults} results
              {liveSource === "odoo" ? <span className="sr-only"> (live catalog)</span> : null}
            </p>
            <Button
              type="button"
              variant="outline"
              className="btn-outline justify-self-center"
              disabled={!hasMore || loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore ? <Spinner size="sm" /> : "Load more"}
            </Button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 justify-self-center border-none bg-transparent p-0 text-xs text-neutral-600 hover:text-primary sm:justify-self-end"
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
      {searchQuery ? (
        <p className="mb-4 text-sm text-neutral-600">
          Results for “{searchQuery}” ·{" "}
          <Link href={routes.category(categorySlug)} className="text-primary hover:underline">
            Clear search
          </Link>
        </p>
      ) : null}
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <LoadingCenter className="py-20" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            Object.keys(filters).length > 0
              ? "Adjust filters or choose another category."
              : liveSource === "odoo"
                ? "No products in this category yet."
                : "Unable to load products. Ensure the Commerce API is running with ODOO_MODE=live."
          }
          action={
            Object.keys(filters).length > 0 ? (
              <Button type="button" variant="primary" className="btn-primary" onClick={clearAllFilters}>
                Clear filters
              </Button>
            ) : (
              <Link href={routes.shop} className="btn btn-primary">
                Browse shop
              </Link>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((p) => {
            const row = p && typeof p === "object" ? /** @type {{ id?: string; slug?: string }} */ (p) : {};
            const key = row.id ?? row.slug ?? JSON.stringify(row);
            return <ProductCard key={key} product={/** @type {Record<string, unknown>} */ (row)} variant="shop" />;
          })}
        </div>
      )}
    </CatalogPageTemplate>
  );
}

/** @param {Parameters<typeof ProductListingInner>[0]} props */
export default function ProductListingClient(props) {
  return (
    <Suspense fallback={<LoadingCenter className="py-20" />}>
      <ProductListingInner {...props} />
    </Suspense>
  );
}
