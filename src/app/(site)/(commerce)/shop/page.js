import ShopPageClient from "./ShopPageClient";
import { listCategories, listProducts } from "@/lib/api/catalog";
import { fetchPageContent } from "@/lib/api/content";
import { catalogDataSource, normalizeCategoryTree, normalizeProductList } from "@/lib/catalog/shopData.mjs";
import { heroFromBlocks } from "@/lib/content/blocks";
import { SHOP_HERO, SHOP_PAGE_SIZE } from "@/data/shopPageContent";

export async function generateMetadata() {
  const cms = await fetchPageContent("shop");
  const title = cms?.name ?? "Shop";
  return {
    title: `${title} | Black Tiger`,
    description: "Browse Black Tiger lubricants across all categories — engine oils and specifications.",
  };
}

export default async function ShopPage() {
  const [cms, categoryPayload, productPayload] = await Promise.all([
    fetchPageContent("shop"),
    listCategories().catch(() => null),
    listProducts({
      pageSize: SHOP_PAGE_SIZE,
      view: "list",
      sort: "relevance",
    }).catch(() => null),
  ]);

  const hero = heroFromBlocks(cms?.blocks, SHOP_HERO);
  const initialCategories = normalizeCategoryTree(categoryPayload);
  const initialProducts = normalizeProductList(productPayload);
  const dataSource = catalogDataSource(categoryPayload) ?? catalogDataSource(productPayload);

  return (
    <ShopPageClient
      hero={hero}
      initialCategories={initialCategories}
      initialProducts={initialProducts}
      dataSource={dataSource}
    />
  );
}
