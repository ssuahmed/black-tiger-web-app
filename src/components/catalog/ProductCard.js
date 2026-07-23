"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui";
import { useProductPriceQuote } from "@/hooks/useProductPriceQuote";
import { defaultPackagingId } from "@/lib/catalog/pdpPricing.mjs";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

/** @param {Record<string, unknown>} product */
function normalizeProduct(product) {
  const slug = String(product.slug ?? "");
  const href = slug ? routes.product(slug) : routes.productsDefault;
  const nameLine1 = product.nameLine1 ? String(product.nameLine1) : null;
  const nameLine2 = product.nameLine2 ? String(product.nameLine2) : null;
  const name = String(product.name ?? (nameLine1 ? `${nameLine1} ${nameLine2 ?? ""}`.trim() : "Product"));
  const code = product.productCode ? String(product.productCode) : null;
  const cat = product.categoryLabel ? String(product.categoryLabel) : null;
  const shortDescription = product.shortDescription ? String(product.shortDescription) : null;
  const image = product.image && typeof product.image === "object" ? /** @type {{ url?: string; alt?: string }} */ (product.image) : undefined;
  const imgSrc = image?.url || "https://placehold.co/320x320/f5f5f5/525252/png";
  const imgAlt = image?.alt || name;
  const price = product.price && typeof product.price === "object" ? /** @type {{ formatted?: string }} */ (product.price) : undefined;
  const priceText = price?.formatted ?? null;
  const badges = Array.isArray(product.badges) ? /** @type {string[]} */ (product.badges) : [];
  const packagingOptions = Array.isArray(product.packagingOptions) ? product.packagingOptions : [];
  return { slug, href, name, nameLine1, nameLine2, code, cat, shortDescription, imgSrc, imgAlt, priceText, badges, packagingOptions };
}

function ProductBadges({ badges, compact }) {
  const hasSale = badges.includes("sale");
  if (compact && hasSale) {
    return (
      <span className="absolute top-2 left-2 z-10 bg-primary px-2 py-0.5 text-xs font-bold tracking-widest text-white uppercase">
        Sale
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {badges.includes("new") ? (
        <Badge variant="primary" className={compact ? "text-xs" : "text-[10px]"}>
          New
        </Badge>
      ) : null}
      {hasSale ? (
        <Badge variant="outline" className="text-[10px]">
          Sale
        </Badge>
      ) : null}
    </div>
  );
}

/** @param {{ product: Record<string, unknown> }} props */
function ShopProductCard({ product }) {
  const p = normalizeProduct(product);
  const options = useMemo(
    () =>
      p.packagingOptions
        .filter((raw) => raw && typeof raw === "object")
        .map((raw) => /** @type {{ id?: string; label?: string; default?: boolean; unitPrice?: number; formattedUnitPrice?: string; badges?: string[] }} */ (raw)),
    [p.packagingOptions],
  );
  const initialPackagingId = defaultPackagingId(options);
  const [packagingOptionId, setPackagingOptionId] = useState(initialPackagingId);

  const selectedOption = options.find((o) => o.id === packagingOptionId) ?? options[0];
  const fallbackPricing = useMemo(() => {
    if (selectedOption?.formattedUnitPrice || selectedOption?.unitPrice != null) {
      return {
        formattedUnitPrice:
          selectedOption.formattedUnitPrice ??
          `${Number(selectedOption.unitPrice).toLocaleString("en-SA")} SAR`,
        unitPrice: selectedOption.unitPrice,
      };
    }
    return { formattedUnitPrice: p.priceText };
  }, [selectedOption, p.priceText]);

  const { pricing, loading } = useProductPriceQuote({
    slug: p.slug,
    packagingOptionId: packagingOptionId || initialPackagingId,
    quantity: 1,
    fallbackPricing,
    packagingPricing: null,
    enabled: Boolean(p.slug && (packagingOptionId || initialPackagingId)),
  });

  const displayPrice =
    (typeof pricing?.formattedUnitPrice === "string" && pricing.formattedUnitPrice) ||
    p.priceText;

  return (
    <article className="relative box-border grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 gap-y-4 border border-neutral-200 border-t-[3px] border-t-primary bg-white p-4 pe-4 sm:grid-cols-[clamp(6rem,18vw,9.5rem)_minmax(0,1fr)] sm:pe-5">
      <div className="relative row-span-2 aspect-4/5 max-h-40 w-full self-center bg-neutral-100">
        <Image src={p.imgSrc} alt={p.imgAlt} fill sizes="160px" className="object-contain p-2" unoptimized />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 pe-0 sm:pe-[6.5rem]">
        <h2 className="font-magistral m-0 text-base leading-tight text-neutral-900">
          {p.nameLine1 ?? p.name}{" "}
          {p.nameLine2 ? <span className="font-bold">{p.nameLine2}</span> : null}
        </h2>
        {p.code ? <p className="m-0 text-xs tracking-wide text-neutral-500">{p.code}</p> : null}
        {p.shortDescription ? (
          <p className="mt-1 mb-0 text-sm leading-snug text-neutral-600">{p.shortDescription}</p>
        ) : null}
        {options.length > 1 ? (
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Packaging options">
            {options.map((opt) => {
              const id = String(opt.id ?? "");
              const active = id === packagingOptionId;
              return (
                <button
                  key={id || opt.label}
                  type="button"
                  className={cn(
                    "cursor-pointer border px-2 py-1 text-[10px] font-medium tracking-wide uppercase transition-colors",
                    active ? "border-primary bg-primary/5 text-primary" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
                  )}
                  onClick={() => setPackagingOptionId(id)}
                >
                  {String(opt.label ?? id)}
                </button>
              );
            })}
          </div>
        ) : null}
        {displayPrice ? (
          <p className={cn("m-0 mt-1 text-sm font-semibold text-primary", loading && "opacity-70")}>
            {displayPrice}
          </p>
        ) : null}
      </div>
      {p.cat ? (
        <span className="static mt-1 self-start bg-neutral-200 px-2 py-1 text-xs font-bold tracking-wide text-neutral-900 uppercase sm:absolute sm:top-4 sm:right-5 sm:mt-0">
          {p.cat}
        </span>
      ) : null}
      <Link
        href={p.href}
        className="static mt-2 justify-self-start text-sm font-semibold text-neutral-900 no-underline hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 sm:absolute sm:right-5 sm:bottom-4 sm:mt-0"
      >
        View
      </Link>
    </article>
  );
}

/** @param {{ product: Record<string, unknown>; variant?: 'listing' | 'shop' | 'compact' }} props */
export default function ProductCard({ product, variant = "listing" }) {
  const p = normalizeProduct(product);

  if (variant === "shop") {
    return <ShopProductCard product={product} />;
  }

  if (variant === "compact") {
    return (
      <Link
        href={p.href}
        className="relative flex flex-col border border-neutral-200 bg-white p-4 text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        <ProductBadges badges={p.badges} compact />
        <div className="relative mb-3 aspect-3/4 w-full">
          <Image src={p.imgSrc} alt={p.imgAlt} fill sizes="(max-width:768px) 45vw, 220px" className="object-contain p-2" unoptimized />
        </div>
        <h3 className="m-0 text-xs leading-snug font-semibold text-neutral-900">{p.name}</h3>
        {p.priceText ? <p className="mt-1.5 mb-0 text-sm font-semibold text-primary">{p.priceText}</p> : null}
      </Link>
    );
  }

  return (
    <Link
      href={p.href}
      className="card box-border flex flex-row items-stretch overflow-hidden rounded-md border border-neutral-800/15 border-t-[3px] border-t-primary bg-[var(--background)] text-inherit no-underline transition-[box-shadow,border-color] duration-150 hover:border-primary/45 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      <div className="relative aspect-square min-h-20 w-[clamp(6rem,22vw,10rem)] max-w-[42%] shrink-0 overflow-hidden bg-neutral-100">
        <Image src={p.imgSrc} alt={p.imgAlt} fill sizes="(max-width: 768px) 40vw, 160px" className="object-cover" unoptimized />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 pt-3.5 pb-4">
        <ProductBadges badges={p.badges} compact={false} />
        <h2 className="font-magistral m-0 text-base font-bold">{p.name}</h2>
        {(p.cat || p.code) && <p className="m-0 text-sm text-neutral-500">{[p.cat, p.code].filter(Boolean).join(" · ")}</p>}
        {p.priceText ? <p className="mt-auto font-bold text-primary">{p.priceText}</p> : null}
      </div>
    </Link>
  );
}
