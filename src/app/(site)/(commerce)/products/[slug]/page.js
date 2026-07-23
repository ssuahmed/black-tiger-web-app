import ProductListingClient from "../ProductListingClient";
import ProductDetailClient from "./ProductDetailClient";
import { getCategoryBySlug, getProductBySlug, listCategories, listProducts } from "@/lib/api/catalog";
import { catalogDataSource, normalizeProductList } from "@/lib/catalog/shopData.mjs";
import { PLP_PAGE_SIZE } from "@/data/shopPageContent";
import { CommerceApiError } from "@/lib/api/client";
import { notFound } from "next/navigation";

/** @param {string} slug */
async function tryCategory(slug) {
  try {
    return await getCategoryBySlug(slug);
  } catch (e) {
    if (e instanceof CommerceApiError && e.status === 404) return null;
    throw e;
  }
}

/** @param {string} slug */
async function tryProduct(slug) {
  try {
    return await getProductBySlug(slug);
  } catch (e) {
    if (e instanceof CommerceApiError && e.status === 404) return null;
    throw e;
  }
}

/** @param {{ params: Promise<{ slug: string }> }} props */
export async function generateMetadata(props) {
  const { slug } = await props.params;
  const category = await tryCategory(slug);
  if (category?.name) {
    return {
      title: `${category.name} | Black Tiger`,
      description: `Browse ${category.name} lubricants from Black Tiger.`,
    };
  }
  const product = await tryProduct(slug);
  if (product?.name) {
    return {
      title: `${product.name} | Black Tiger`,
      description: product?.subtitle || product?.descriptionHtml?.replace(/<[^>]+>/g, " ").trim(),
    };
  }
  return { title: "Product | Black Tiger" };
}

/** @param {{ params: Promise<{ slug: string }> }} props */
export default async function ProductSlugPage(props) {
  const { slug } = await props.params;

  const category = await tryCategory(slug);
  if (category) {
    const [productPayload, categoriesPayload] = await Promise.all([
      listProducts({
        category: slug,
        pageSize: PLP_PAGE_SIZE,
        view: "list",
        sort: "relevance",
      }).catch(() => null),
      listCategories().catch(() => null),
    ]);

    const initialProducts = normalizeProductList(productPayload);
    const dataSource = catalogDataSource(categoriesPayload) ?? catalogDataSource(productPayload);

    return (
      <ProductListingClient
        categorySlug={slug}
        initialProducts={initialProducts}
        dataSource={dataSource}
      />
    );
  }

  const product = await tryProduct(slug);
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
