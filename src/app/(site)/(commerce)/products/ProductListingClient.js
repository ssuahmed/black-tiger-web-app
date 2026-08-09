"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CatalogPageTemplate from "@/components/catalog/CatalogPageTemplate";
import FacetFilterPanel from "@/components/catalog/FacetFilterPanel";
import ProductCard from "@/components/catalog/ProductCard";
import { Alert, Button, EmptyState, LoadingCenter, Spinner } from "@/components/ui";
import { PLP_PAGE_SIZE } from "@/data/shopPageContent";
import { formatApiError } from "@/lib/formatApiError";
import { routes } from "@/lib/routes";
import * as catalogApi from "@/lib/api/catalog";
import { buildQueryString } from "@/lib/api/client";
import { normalizeBreadcrumbs, normalizeProductList } from "@/lib/catalog/shopData.mjs";

export const TAXONOMY_KEYS = [
  "segmentApplication",
  "application",
  "viscosity",
  "productLine",
  "segment",
];

/** Composite facet value pairing one segment with one application. */
export function segmentApplicationValue(segment, application) {
  return `${segment}:${application}`;
}

/** @param {string} raw */
export function parseSegmentApplication(raw) {
  const idx = String(raw).indexOf(":");
  if (idx <= 0) return null;
  const segment = raw.slice(0, idx).trim();
  const application = raw.slice(idx + 1).trim();
  if (!segment || !application) return null;
  return { segment, application };
}

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
 * @param {import("next/navigation").ReadonlyURLSearchParams | URLSearchParams} searchParams
 * @returns {Record<string, string[]>}
 */
function taxonomyFiltersFromSearchParams(searchParams) {
  /** @type {Record<string, string[]>} */
  const out = {};
  for (const key of TAXONOMY_KEYS) {
    const all = searchParams.getAll(key).map((v) => v.trim()).filter(Boolean);
    if (all.length) out[key] = [...new Set(all)];
  }
  return out;
}

/**
 * Homepage accordion links use `?application=` with a category path — promote
 * those to segment-scoped pairs so checkbox state and filtering agree.
 * @param {Record<string, string[]>} filters
 * @param {string | null | undefined} categorySlug
 */
function promoteLegacyApplications(filters, categorySlug) {
  if (!filters.application?.length) return filters;
  if (!categorySlug) return filters;
  const pairs = new Set(filters.segmentApplication ?? []);
  for (const app of filters.application) {
    pairs.add(segmentApplicationValue(categorySlug, app));
  }
  const next = { ...filters, segmentApplication: [...pairs] };
  delete next.application;
  return next;
}

/** @param {string[]} pairs */
function segmentsFromPairs(pairs) {
  const segs = new Set();
  for (const raw of pairs ?? []) {
    const pair = parseSegmentApplication(raw);
    if (pair) segs.add(pair.segment);
  }
  return segs;
}

/**
 * @param {string[]} pairs
 * @param {string} segment
 */
function pairsWithoutSegment(pairs, segment) {
  return (pairs ?? []).filter((raw) => {
    const pair = parseSegmentApplication(raw);
    return pair ? pair.segment !== segment : false;
  });
}

/**
 * Collect segment-scoped application options nested under segment facets.
 * @param {unknown[]} facets
 */
function segmentApplicationOptions(facets) {
  /** @type {Array<{ value: string; label: string }>} */
  const out = [];
  const segmentGroup = Array.isArray(facets)
    ? facets.find((f) => f && typeof f === "object" && /** @type {{ key?: string }} */ (f).key === "segment")
    : null;
  const opts =
    segmentGroup && typeof segmentGroup === "object" && Array.isArray(/** @type {{ options?: unknown }} */ (segmentGroup).options)
      ? /** @type {Array<Record<string, unknown>>} */ (/** @type {{ options: unknown[] }} */ (segmentGroup).options)
      : [];
  for (const opt of opts) {
    const segLabel = String(opt.label ?? opt.value ?? "");
    const children = Array.isArray(opt.children) ? opt.children : [];
    for (const child of children) {
      const c = child && typeof child === "object" ? /** @type {Record<string, unknown>} */ (child) : {};
      const value = String(c.value ?? "");
      if (!value) continue;
      out.push({ value, label: `${segLabel} · ${String(c.label ?? value)}` });
    }
  }
  return out;
}

/**
 * Drop pairs that no longer exist in the catalog facets.
 * @param {Record<string, string[]>} filters
 * @param {unknown[]} facets
 */
function prunePairsToFacetOptions(filters, facets) {
  if (!filters.segmentApplication?.length) return filters;
  const allowed = new Set(segmentApplicationOptions(facets).map((o) => o.value));
  if (!allowed.size) return filters;
  const kept = filters.segmentApplication.filter((v) => allowed.has(v));
  if (kept.length === filters.segmentApplication.length) return filters;
  const next = { ...filters };
  if (kept.length) next.segmentApplication = kept;
  else delete next.segmentApplication;
  return next;
}

/** @param {Record<string, string[]>} filters */
function filtersToQueryParams(filters) {
  /** @type {Record<string, string | string[]>} */
  const params = {};
  for (const [key, vals] of Object.entries(filters)) {
    if (!vals?.length) continue;
    params[key] = vals.length === 1 ? vals[0] : vals;
  }
  return params;
}

/** @param {Record<string, string[]>} filters */
function hasAnyFilter(filters) {
  return Object.values(filters).some((vals) => (vals ?? []).length > 0);
}

/**
 * @param {{
 *   categorySlug?: string | null;
 *   initialProducts?: ReturnType<typeof normalizeProductList>;
 *   initialFilters?: Record<string, string[]>;
 *   dataSource?: 'odoo' | 'mock' | null;
 * }} props
 */
function ProductListingInner({
  categorySlug = null,
  initialProducts = null,
  initialFilters = {},
  dataSource = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || "";
  const urlTaxonomy = useMemo(() => taxonomyFiltersFromSearchParams(searchParams), [searchParams]);

  const [pageData, setPageData] = useState(initialProducts);
  /** Explicit user selections only — the category path is layered on for display. */
  const [filters, setFilters] = useState(() =>
    promoteLegacyApplications({ ...initialFilters, ...urlTaxonomy }, categorySlug),
  );
  const [loading, setLoading] = useState(!initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [liveSource, setLiveSource] = useState(dataSource);
  const skipInitialFetchRef = useRef(Boolean(initialProducts));

  useEffect(() => {
    setFilters((prev) => {
      const merged = { ...prev };
      for (const key of TAXONOMY_KEYS) {
        const fromUrl = urlTaxonomy[key];
        if (fromUrl?.length) merged[key] = fromUrl;
        else delete merged[key];
      }
      const next = promoteLegacyApplications(merged, categorySlug);
      const same = TAXONOMY_KEYS.every(
        (key) => (next[key] ?? []).join("|") === (prev[key] ?? []).join("|"),
      );
      return same ? prev : next;
    });
  }, [urlTaxonomy, categorySlug]);

  const items = useMemo(() => {
    const raw = pageData?.items;
    return Array.isArray(raw) ? raw : [];
  }, [pageData]);

  const facets = useMemo(() => {
    const raw = pageData?.facets;
    return Array.isArray(raw) ? raw : [];
  }, [pageData]);

  useEffect(() => {
    if (!facets.length) return;
    setFilters((prev) => prunePairsToFacetOptions(prev, facets));
  }, [facets]);

  const pagination =
    pageData?.pagination && typeof pageData.pagination === "object" ? pageData.pagination : null;
  const hasMore = Boolean(pagination?.hasMore);
  const totalResults = typeof pagination?.total === "number" ? pagination.total : items.length;
  const loadedCount = typeof pagination?.loaded === "number" ? pagination.loaded : items.length;

  /**
   * Segment checkboxes reflect the category path plus any segment implied by a
   * selected application pair.
   */
  const displayFilters = useMemo(() => {
    const segs = new Set(filters.segment ?? []);
    if (categorySlug) segs.add(categorySlug);
    for (const seg of segmentsFromPairs(filters.segmentApplication ?? [])) {
      segs.add(seg);
    }
    const next = { ...filters };
    if (segs.size) next.segment = [...segs];
    return next;
  }, [filters, categorySlug]);

  const selection = useMemo(() => filtersToSelection(displayFilters), [displayFilters]);

  const activeFilters = useMemo(() => {
    const chipFacets = [
      ...facets,
      {
        key: "segmentApplication",
        label: "Application",
        options: segmentApplicationOptions(facets),
      },
    ];
    return filtersToActiveChips(displayFilters, chipFacets);
  }, [displayFilters, facets]);

  const category =
    pageData?.category && typeof pageData.category === "object"
      ? /** @type {{ name?: string }} */ (pageData.category)
      : {};
  const heading = category?.name ?? "All products";

  const breadcrumbs = useMemo(() => {
    const fromApi = normalizeBreadcrumbs(
      Array.isArray(pageData?.breadcrumbs)
        ? /** @type {Array<{ label?: string; href?: string }>} */ (pageData.breadcrumbs)
        : [],
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
        pageSize: PLP_PAGE_SIZE,
        view: "list",
        sort: "relevance",
      };
      if (categorySlug) params.category = categorySlug;
      if (searchQuery) params.q = searchQuery;
      if (cursorVal) params.cursor = cursorVal;
      for (const [key, vals] of Object.entries(filters)) {
        if (!vals.length) continue;
        if (key === "segment") {
          const extra = vals.filter((v) => v !== categorySlug);
          if (extra.length) params.segment = extra;
          continue;
        }
        params[key] = vals;
      }
      return params;
    },
    [categorySlug, filters, searchQuery],
  );

  const isDefaultQuery = !hasAnyFilter(filters) && !searchQuery;

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

  /**
   * Navigate so the URL segment (category path) always matches the selected
   * taxonomy: a single segment becomes the category page, mixed segments fall
   * back to the all-products page.
   * @param {Record<string, string[]>} nextFilters
   * @param {string | null} targetSegment
   */
  const navigateTo = useCallback(
    (nextFilters, targetSegment) => {
      const clean = { ...nextFilters };
      if (targetSegment) {
        const rest = (clean.segment ?? []).filter((v) => v !== targetSegment);
        if (rest.length) clean.segment = rest;
        else delete clean.segment;
      }
      const qs = buildQueryString(
        /** @type {Record<string, unknown>} */ (filtersToQueryParams(clean)),
      );
      const base = targetSegment ? routes.category(targetSegment) : routes.productsIndex;
      setFilters(clean);
      router.push(`${base}${qs}`);
    },
    [router],
  );

  /**
   * Segment scope after a change: one segment → that category page,
   * none → all products, several → all products with explicit segment params.
   * @param {Record<string, string[]>} nextFilters
   */
  const resolveTargetSegment = useCallback((nextFilters) => {
    const segs = new Set(nextFilters.segment ?? []);
    for (const seg of segmentsFromPairs(nextFilters.segmentApplication ?? [])) {
      segs.add(seg);
    }
    if (segs.size === 1) return [...segs][0];
    return null;
  }, []);

  const toggleFacet = useCallback(
    (facetKey, value, checked) => {
      if (facetKey === "segmentApplication") {
        const pairs = new Set(filters.segmentApplication ?? []);
        if (checked) pairs.add(value);
        else pairs.delete(value);
        const next = { ...filters };
        if (pairs.size) next.segmentApplication = [...pairs];
        else delete next.segmentApplication;
        // A pair implies its own segment; drop segment-only selections that the
        // pairs already cover so scope stays unambiguous.
        const pairSegs = segmentsFromPairs(next.segmentApplication ?? []);
        if (pairSegs.size) {
          const explicit = (next.segment ?? []).filter((v) => !pairSegs.has(v));
          if (explicit.length) next.segment = explicit;
          else delete next.segment;
        }
        const target = pairs.size ? resolveTargetSegment(next) : categorySlug;
        navigateTo(next, target);
        return;
      }

      if (facetKey === "segment") {
        const next = { ...filters };
        const segs = new Set(next.segment ?? []);
        if (categorySlug) segs.add(categorySlug);
        for (const seg of segmentsFromPairs(next.segmentApplication ?? [])) {
          segs.add(seg);
        }

        if (checked) segs.add(value);
        else {
          segs.delete(value);
          // Applications belong to their segment — remove them with it.
          const kept = pairsWithoutSegment(next.segmentApplication ?? [], value);
          if (kept.length) next.segmentApplication = kept;
          else delete next.segmentApplication;
        }

        if (segs.size) next.segment = [...segs];
        else delete next.segment;

        navigateTo(next, resolveTargetSegment(next));
        return;
      }

      setFilters((prev) => {
        const next = { ...prev };
        const cur = [...(next[facetKey] ?? [])];
        if (checked) {
          if (!cur.includes(value)) cur.push(value);
        } else {
          const idx = cur.indexOf(value);
          if (idx >= 0) cur.splice(idx, 1);
        }
        if (cur.length) next[facetKey] = cur;
        else delete next[facetKey];
        return next;
      });
    },
    [categorySlug, filters, navigateTo, resolveTargetSegment],
  );

  const removeFilter = useCallback(
    (facetKey, value) => {
      if (facetKey === "segment" || facetKey === "segmentApplication") {
        toggleFacet(facetKey, value, false);
        return;
      }
      setFilters((prev) => {
        const next = { ...prev };
        const cur = [...(next[facetKey] ?? [])].filter((v) => v !== value);
        if (cur.length) next[facetKey] = cur;
        else delete next[facetKey];
        return next;
      });
    },
    [toggleFacet],
  );

  const clearAllFilters = useCallback(() => {
    setFilters({});
    router.push(routes.productsIndex);
  }, [router]);

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

  const anyFilterActive = hasAnyFilter(displayFilters);

  return (
    <CatalogPageTemplate
      variant="listing"
      breadcrumbs={breadcrumbs}
      title={""}
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
          <Link
            href={categorySlug ? routes.category(categorySlug) : routes.productsIndex}
            className="text-primary hover:underline"
          >
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
            searchQuery
              ? `No products match “${searchQuery}”. Try another term or clear search.`
              : anyFilterActive
                ? "Adjust filters or choose another category."
                : liveSource === "odoo"
                  ? categorySlug
                    ? "No products in this category yet."
                    : "No products match these filters yet."
                  : "Unable to load products. Ensure the Commerce API is running with ODOO_MODE=live."
          }
          action={
            anyFilterActive ? (
              <Button type="button" variant="primary" className="btn-primary" onClick={clearAllFilters}>
                Clear filters
              </Button>
            ) : (
              <Link href={routes.productsIndex} className="btn btn-primary">
                Browse products
              </Link>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((p) => {
            const row = p && typeof p === "object" ? /** @type {{ id?: string; slug?: string }} */ (p) : {};
            const key = row.id ?? row.slug ?? JSON.stringify(row);
            return (
              <ProductCard key={key} product={/** @type {Record<string, unknown>} */ (row)} variant="shop" />
            );
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
