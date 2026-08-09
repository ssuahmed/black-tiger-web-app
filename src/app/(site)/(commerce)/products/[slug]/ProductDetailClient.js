"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import PageShell from "@/components/layout/PageShell";
import SiteContainer from "@/components/layout/SiteContainer";
import ProductDetailSections from "@/components/product/ProductDetailSections";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPricingBlock from "@/components/product/ProductPricingBlock";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import RelatedProductsStrip from "@/components/product/RelatedProductsStrip";
import { Alert } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useProductPriceQuote } from "@/hooks/useProductPriceQuote";
import { defaultPackagingId, scopePalletTables } from "@/lib/catalog/pdpPricing.mjs";
import { normalizeBreadcrumbs } from "@/lib/catalog/shopData.mjs";
import { CommerceApiError } from "@/lib/api/client";

/** @param {{ product: Record<string, unknown> }} props */
export default function ProductDetailClient({ product }) {
  const { addLine } = useCart();
  const packagingOptions = useMemo(() => {
    const raw = product?.packagingOptions;
    return Array.isArray(raw) ? raw : [];
  }, [product]);

  const defaultPackagingIdValue = useMemo(
    () => defaultPackagingId(packagingOptions),
    [packagingOptions],
  );

  const [packagingOptionId, setPackagingOptionId] = useState(defaultPackagingIdValue);
  const [quantity, setQuantity] = useState(
    typeof product?.minQuantity === "number" ? product.minQuantity : 1,
  );
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const selectedPackaging = useMemo(
    () =>
      packagingOptions.find(
        (o) => o && typeof o === "object" && String(o.id) === packagingOptionId,
      ),
    [packagingOptions, packagingOptionId],
  );

  const packagingPricing =
    selectedPackaging &&
    typeof selectedPackaging === "object" &&
    selectedPackaging.pricing &&
    typeof selectedPackaging.pricing === "object"
      ? /** @type {Record<string, unknown>} */ (selectedPackaging.pricing)
      : null;

  const fallbackPricing =
    product?.pricing && typeof product.pricing === "object"
      ? /** @type {Record<string, unknown>} */ (product.pricing)
      : null;

  const { pricing: livePricing, loading: pricingLoading, palletType } = useProductPriceQuote({
    slug: String(product?.slug ?? ""),
    packagingOptionId: packagingOptionId || defaultPackagingIdValue,
    quantity: Math.max(1, quantity),
    fallbackPricing,
    packagingPricing,
    enabled: Boolean(product?.slug && (packagingOptionId || defaultPackagingIdValue)),
  });

  const displayPricing = useMemo(
    () => ({
      ...(product?.pricing && typeof product.pricing === "object" ? product.pricing : {}),
      ...livePricing,
      ...scopePalletTables(packagingPricing, livePricing),
    }),
    [product, livePricing, packagingPricing],
  );

  const media = useMemo(() => {
    const pkg = selectedPackaging && typeof selectedPackaging === "object" ? selectedPackaging : null;
    const pkgMedia = pkg && Array.isArray(pkg.media) ? pkg.media : null;
    if (pkgMedia?.length) {
      return pkgMedia
        .filter((m) => m && typeof m === "object" && m.url)
        .map((m) => ({
          url: String(/** @type {{ url?: string }} */ (m).url),
          alt: String(/** @type {{ alt?: string }} */ (m).alt ?? product?.name ?? "Product"),
        }));
    }
    const pkgImage =
      pkg?.image && typeof pkg.image === "object"
        ? /** @type {{ url?: string; alt?: string }} */ (pkg.image)
        : null;
    if (pkgImage?.url) {
      return [
        {
          url: String(pkgImage.url),
          alt: String(pkgImage.alt ?? product?.name ?? "Product"),
        },
      ];
    }
    const raw = product?.media;
    return Array.isArray(raw) ? raw : [];
  }, [product, selectedPackaging]);

  const relatedProducts = useMemo(() => {
    const raw = product?.relatedProducts;
    return Array.isArray(raw) ? raw : [];
  }, [product]);

  const crumbItems = useMemo(
    () =>
      normalizeBreadcrumbs(
        Array.isArray(product?.breadcrumbs)
          ? /** @type {Array<{ label?: string; href?: string }>} */ (product.breadcrumbs)
          : [],
      ),
    [product?.breadcrumbs],
  );

  async function onAddToCart(e) {
    e.preventDefault();
    setAddMsg("");
    if (!packagingOptionId) {
      setAddMsg("Select packaging.");
      return;
    }
    const slug = String(product?.slug ?? "");
    if (!slug) {
      setAddMsg("Product unavailable.");
      return;
    }
    setAdding(true);
    try {
      await addLine({
        productSlug: slug,
        packagingOptionId,
        quantity: Math.max(1, quantity),
        palletType,
      });
      setAddMsg("Added to cart.");
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Could not add to cart.";
      setAddMsg(msg);
    } finally {
      setAdding(false);
    }
  }

  if (!product) {
    return (
      <PageShell variant="pdp">
        <Alert variant="error">Product not found.</Alert>
        <p className="mt-4">
          <Link href="/products" className="text-primary hover:underline">
            Back to products
          </Link>
        </p>
      </PageShell>
    );
  }

  return (
    <>
      {/* Same breadcrumb chrome as products listing (CatalogPageTemplate listing). */}
      <div className="font-geogrotesque pt-8 md:pt-12 pb-4">
        <SiteContainer>
          <Breadcrumbs items={crumbItems} variant="shop" />
        </SiteContainer>
      </div>

      <PageShell variant="pdp" className="pdp">
        {/* Gallery holds the left column; everything else stacks in the right column. */}
        <div className="pdp__main">
          <div className="pdp__gallery-col pt-6">
            <ProductGallery key={packagingOptionId || "default"} media={media} />
          </div>

          <div className="min-w-0">
            <ProductPurchasePanel
              product={product}
              pricing={livePricing}
              pricingLoading={pricingLoading}
              packagingOptionId={packagingOptionId || defaultPackagingIdValue}
              onPackagingChange={setPackagingOptionId}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={onAddToCart}
              adding={adding}
              addMsg={addMsg}
            />
            <ProductPricingBlock product={{ ...product, pricing: displayPricing }} />
            <ProductDetailSections product={product} />
          </div>
        </div>

        <RelatedProductsStrip products={relatedProducts} />
      </PageShell>
    </>
  );
}
