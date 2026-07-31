import ProductListingClient from "./ProductListingClient";
import { listCategories, listProducts } from "@/lib/api/catalog";
import { catalogDataSource, normalizeProductList } from "@/lib/catalog/shopData.mjs";
import { PLP_PAGE_SIZE } from "@/data/shopPageContent";

/**
 * @param {URLSearchParams | Record<string, string | string[] | undefined>} sp
 * @returns {Record<string, string | string[]>}
 */
function taxonomyQueryFromSearchParams(sp) {
  /** @type {Record<string, string | string[]>} */
  const out = {};
  const getAll = (key) => {
    if (sp instanceof URLSearchParams) return sp.getAll(key);
    const v = /** @type {Record<string, string | string[] | undefined>} */ (sp)[key];
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v) return [v];
    return [];
  };
  for (const key of ["segmentApplication", "application", "viscosity", "productLine", "segment"]) {
    const vals = getAll(key).map((v) => String(v).trim()).filter(Boolean);
    if (vals.length === 1) out[key] = vals[0];
    else if (vals.length > 1) out[key] = vals;
  }
  return out;
}

/** @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props */
export async function generateMetadata() {
  return {
    title: "All products | Black Tiger",
    description: "Browse Black Tiger lubricants by segment, application, product line, and viscosity.",
  };
}

/** @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props */
export default async function ProductsIndexPage(props) {
  const searchParams = await props.searchParams;
  const taxonomy = taxonomyQueryFromSearchParams(searchParams);
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  const [productPayload, categoriesPayload] = await Promise.all([
    listProducts({
      pageSize: PLP_PAGE_SIZE,
      view: "list",
      sort: "relevance",
      ...(q ? { q } : {}),
      ...taxonomy,
    }).catch(() => null),
    listCategories().catch(() => null),
  ]);

  const initialProducts = normalizeProductList(productPayload);
  const dataSource = catalogDataSource(categoriesPayload) ?? catalogDataSource(productPayload);

  /** @type {Record<string, string[]>} */
  const initialFilters = {};
  for (const [key, val] of Object.entries(taxonomy)) {
    initialFilters[key] = Array.isArray(val) ? val : [val];
  }

  return (
    <ProductListingClient
      categorySlug={null}
      initialProducts={initialProducts}
      initialFilters={initialFilters}
      dataSource={dataSource}
    />
  );
}
