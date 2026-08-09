"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge, Money } from "@/components/ui";
import { useProductPriceQuote } from "@/hooks/useProductPriceQuote";
import { defaultPackagingId } from "@/lib/catalog/pdpPricing.mjs";
import { cn } from "@/lib/cn";
import { formatSarAmount } from "@/lib/format/money";
import { routes } from "@/lib/routes";

/** Strip product line label from the start of a product name (case-insensitive). */
function nameWithoutProductLine(name, productLineLabel) {
  if (!productLineLabel) return null;
  const escaped = productLineLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripped = name.replace(new RegExp(`^\\s*${escaped}\\s*`, "i"), "").trim();
  return stripped && stripped.toLowerCase() !== name.toLowerCase() ? stripped : null;
}

/** @param {Record<string, unknown>} product */
function normalizeProduct(product) {
  const slug = String(product.slug ?? "");
  const href = slug ? routes.product(slug) : routes.productsDefault;
  const productLineLabel = product.productLineLabel
    ? String(product.productLineLabel)
    : product.productLine
      ? String(product.productLine)
      : null;
  const name = String(product.name ?? "Product");
  const nameLine2 =
    (product.nameLine2 ? String(product.nameLine2) : null) ||
    nameWithoutProductLine(name, productLineLabel);
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
  return { slug, href, name, productLineLabel, nameLine2, code, cat, shortDescription, imgSrc, imgAlt, priceText, badges, packagingOptions };
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
  const router = useRouter();
  const p = normalizeProduct(product);
  const options = useMemo(
    () =>
      p.packagingOptions
        .filter((raw) => raw && typeof raw === "object")
        .map(
          (raw) =>
            /** @type {{ id?: string; label?: string; default?: boolean; unitPrice?: number; formattedUnitPrice?: string; badges?: string[]; image?: { url?: string; alt?: string } }} */ (
              raw
            ),
        ),
    [p.packagingOptions],
  );
  const initialPackagingId = defaultPackagingId(options);
  const [packagingOptionId, setPackagingOptionId] = useState(initialPackagingId);

  const selectedOption = options.find((o) => o.id === packagingOptionId) ?? options[0];
  const imgSrc = selectedOption?.image?.url || p.imgSrc;
  const imgAlt = selectedOption?.image?.alt || p.imgAlt;
  const fallbackPricing = useMemo(() => {
    if (selectedOption?.formattedUnitPrice || selectedOption?.unitPrice != null) {
      return {
        formattedUnitPrice:
          selectedOption.formattedUnitPrice ?? formatSarAmount(Number(selectedOption.unitPrice)),
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
    <article
      role="link"
      tabIndex={0}
      aria-label={`View ${p.name}`}
      className="relative box-border grid cursor-pointer grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-3 border border-neutral-200 border-t-[3px] border-t-primary bg-white p-4 pe-4 transition-[border-color,box-shadow] hover:border-primary/45 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 sm:grid-cols-[clamp(6rem,16vw,9.5rem)_minmax(10rem,0.9fr)_minmax(0,1.2fr)] sm:gap-x-6 sm:pe-5"
      onClick={() => router.push(p.href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(p.href);
        }
      }}
    >
      <div className="relative aspect-4/5 max-h-40 w-full self-center">
        <Image src={imgSrc} alt={imgAlt} fill sizes="160px" className="object-contain p-2" unoptimized />
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1.5 pe-0 sm:pe-2">
        <h2 className="font-magistral m-0 flex flex-col gap-0.5 text-[clamp(0.9375rem,calc(100vw*24/1440),1.5rem)] leading-tight text-neutral-900 uppercase">
          {p.productLineLabel || p.nameLine2 ? (
            <>
              {p.productLineLabel ? (
                <span className="font-normal tracking-wide">{p.productLineLabel}</span>
              ) : null}
              {p.nameLine2 ? <span className="font-bold tracking-wide">{p.nameLine2}</span> : null}
            </>
          ) : (
            <span className="font-bold tracking-wide">{p.name}</span>
          )}
        </h2>
        {p.code ? <p className="m-0 text-xs tracking-wide text-neutral-500 uppercase">{p.code}</p> : null}
      </div>

      <div className="col-span-2 flex min-w-0 flex-col justify-center gap-2 pe-0 sm:col-span-1 sm:pe-[6.5rem]">
        {p.shortDescription ? (
          <p className="m-0 text-sm leading-snug text-neutral-800">{p.shortDescription}</p>
        ) : null}
        {options.length > 1 ? (
          <div className="my-2 flex flex-wrap gap-1.5" role="group" aria-label="Packaging options">
            {options.map((opt) => {
              const id = String(opt.id ?? "");
              const active = id === packagingOptionId;
              return (
                <button
                  key={id || opt.label}
                  type="button"
                  className={cn(
                    "cursor-pointer rounded-sm border px-2 py-1 text-[clamp(0.625rem,calc(100vw*12/1440),0.75rem)] font-medium tracking-wide uppercase transition-colors",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPackagingOptionId(id);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {String(opt.label ?? id)}
                </button>
              );
            })}
          </div>
        ) : null}
        {displayPrice ? (
          <p
            className={cn(
              "m-0 text-[clamp(0.9375rem,calc(100vw*22/1440),1.375rem)] font-semibold text-primary",
              loading && "opacity-70",
            )}
          >
            <Money value={displayPrice} />
          </p>
        ) : null}
        <Link
          href={p.href}
          className="w-fit text-sm font-bold text-neutral-900 underline hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          View
        </Link>
      </div>

      {p.cat ? (
        <span className="absolute top-4 right-4 rounded-full bg-neutral-600 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
          {p.cat}
        </span>
      ) : null}
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
    const badgeLabel = p.badges.length ? p.badges[0] : null;
    return (
      <Link href={p.href} className="pdp-card">
        {badgeLabel ? <span className="pdp-card__badge">{badgeLabel}</span> : null}
        <div className="pdp-card__media">
          <Image
            src={p.imgSrc}
            alt={p.imgAlt}
            fill
            sizes="(max-width:768px) 45vw, 300px"
            className="object-contain"
            unoptimized
          />
        </div>
        <h3 className="pdp-card__name">{p.name}</h3>
        {p.priceText ? (
          <p className="pdp-card__price">
            <Money value={p.priceText} />
          </p>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={p.href}
      className="card box-border flex flex-row items-stretch overflow-hidden rounded-md border border-neutral-800/15 border-t-[3px] border-t-primary bg-[var(--background)] text-inherit no-underline transition-[box-shadow,border-color] duration-150 hover:border-primary/45 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      <div className="relative aspect-square min-h-20 w-[clamp(6rem,22vw,10rem)] max-w-[42%] shrink-0 overflow-hidden">
        <Image src={p.imgSrc} alt={p.imgAlt} fill sizes="(max-width: 768px) 40vw, 160px" className="object-cover" unoptimized />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 pt-3.5 pb-4">
        <ProductBadges badges={p.badges} compact={false} />
        <h2 className="font-magistral m-0 text-base font-bold">{p.name}</h2>
        {(p.cat || p.code) && <p className="m-0 text-sm text-neutral-500">{[p.cat, p.code].filter(Boolean).join(" · ")}</p>}
        {p.priceText ? (
          <p className="mt-auto font-bold text-primary">
            <Money value={p.priceText} />
          </p>
        ) : null}
      </div>
    </Link>
  );
}
