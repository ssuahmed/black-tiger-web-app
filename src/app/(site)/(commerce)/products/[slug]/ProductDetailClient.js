"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import PageShell from "@/components/layout/PageShell";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout";
import ProductDetailSections from "@/components/product/ProductDetailSections";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPricingBlock from "@/components/product/ProductPricingBlock";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import RelatedProductsStrip from "@/components/product/RelatedProductsStrip";
import { Alert } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { useProductPriceQuote } from "@/hooks/useProductPriceQuote";
import { defaultPackagingId } from "@/lib/catalog/pdpPricing.mjs";
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

  const displayPricing = useMemo(() => {
    const scopedPartial = packagingPricing?.partialPallet ?? livePricing?.partialPallet;
    const scopedFull = packagingPricing?.fullPallet ?? livePricing?.fullPallet;
    return {
      ...(product?.pricing && typeof product.pricing === "object" ? product.pricing : {}),
      ...livePricing,
      partialPallet: scopedPartial ?? livePricing?.partialPallet,
      fullPallet: scopedFull ?? livePricing?.fullPallet,
    };
  }, [product?.pricing, livePricing, packagingPricing]);

  const breadcrumbs = useMemo(() => {
    const raw = product?.breadcrumbs;
    return Array.isArray(raw) ? raw : [];
  }, [product]);

  const media = useMemo(() => {
    const raw = product?.media;
    return Array.isArray(raw) ? raw : [];
  }, [product]);

  const relatedProducts = useMemo(() => {
    const raw = product?.relatedProducts;
    return Array.isArray(raw) ? raw : [];
  }, [product]);

  const crumbItems = useMemo(() => {
    return breadcrumbs.map((b) => {
      const x = b && typeof b === "object" ? /** @type {{ label?: string; href?: string }} */ (b) : {};
      return { label: String(x.label ?? ""), href: x.href ? String(x.href) : undefined };
    });
  }, [breadcrumbs]);

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
          <Link href="/shop" className="text-primary hover:underline">
            Back to shop
          </Link>
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="pdp">
      <div className="mb-6">
        <Breadcrumbs items={crumbItems} variant="shop" />
      </div>

      <TwoColumnLayout
        preset="pdp"
        sidebarSide="right"
        sidebar={
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
        }
      >
        <ProductGallery media={media} />
      </TwoColumnLayout>

      <div className="mt-2">
        <ProductPricingBlock product={{ ...product, pricing: displayPricing }} />
        <ProductDetailSections product={product} />
        <RelatedProductsStrip products={relatedProducts} />
      </div>
    </PageShell>
  );
}
