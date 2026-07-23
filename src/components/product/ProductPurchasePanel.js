"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Spinner } from "@/components/ui";

import { cn } from "@/lib/cn";

/** @param {Record<string, unknown>} props */
export default function ProductPurchasePanel({
  product,
  pricing: pricingOverride,
  pricingLoading = false,
  packagingOptionId,
  onPackagingChange,
  quantity,
  onQuantityChange,
  onAddToCart,
  adding,
  addMsg,
}) {
  const name = String(product?.name ?? "");
  const subtitle = product?.subtitle ? String(product.subtitle) : "";
  const sizeLabel = product?.sizeLabel ? String(product.sizeLabel) : "";
  const packagingOptions = Array.isArray(product?.packagingOptions) ? product.packagingOptions : [];

  const productPricing = product?.pricing && typeof product.pricing === "object" ? product.pricing : {};
  const pricing =
    pricingOverride && typeof pricingOverride === "object" ? pricingOverride : productPricing;
  const formattedPrice =
    pricing.formattedUnitPrice ??
    (pricing.unitPrice != null ? `${Number(pricing.unitPrice).toLocaleString("en-SA")} SAR` : "");
  const lineRows = Array.isArray(pricing.lineSummaryRows) ? pricing.lineSummaryRows : [];
  const totalPrice = pricing.totalPrice ? String(pricing.totalPrice) : "";

  const selectedLabel = useMemo(() => {
    const opt = packagingOptions.find((o) => o && typeof o === "object" && String(o.id) === packagingOptionId);
    return opt && typeof opt === "object" ? String(opt.label ?? "") : "";
  }, [packagingOptions, packagingOptionId]);

  return (
    <div className="text-neutral-900">
      <h1 className="font-magistral m-0 text-2xl leading-tight font-bold tracking-wide">
        {name}
      </h1>
      {subtitle ? <p className="mt-2 mb-0 text-sm text-neutral-500">{subtitle}</p> : null}

      {sizeLabel ? (
        <p className="mt-6 mb-2 text-sm text-neutral-900">
          Size: <span className="font-semibold">{selectedLabel || sizeLabel}</span>
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-2">
        {packagingOptions.map((raw) => {
          const o = raw && typeof raw === "object" ? raw : {};
          const id = String(o.id ?? "");
          const active = id === packagingOptionId;
          const hasSale = Array.isArray(o.badges) && o.badges.includes("sale");
          return (
            <button
              key={id || o.label}
              type="button"
              className={cn(
              "relative box-border min-h-9 cursor-pointer border bg-white px-2.5 py-2 text-center text-xs leading-tight font-medium text-neutral-900 transition-[border-color,box-shadow] duration-150 hover:border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                active ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-neutral-300",
              )}
              onClick={() => onPackagingChange(id)}
            >
              {hasSale ? (
                <span className="absolute -top-1.5 -right-1 bg-primary px-1.5 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
                  Sale
                </span>
              ) : null}
              {String(o.label ?? id)}
            </button>
          );
        })}
      </div>

      {formattedPrice ? (
        <p className={cn("mt-6 mb-0 text-3xl leading-none font-bold text-neutral-900", pricingLoading && "opacity-70")}>
          {formattedPrice}
        </p>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAddToCart(e);
        }}
      >
        <div className="mt-5 grid grid-cols-[minmax(0,6rem)_minmax(0,1fr)] items-stretch gap-3">
          <input
            id="pdp-qty"
            type="number"
            min={1}
            className="box-border min-h-12 w-full border border-neutral-300 bg-white px-3 py-2 text-center text-base text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            disabled={adding}
            aria-label="Quantity"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 cursor-pointer items-center justify-center border-none bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={adding}
          >
            {adding ? <Spinner size="sm" /> : "Add to Cart"}
          </button>
        </div>
      </form>

      {addMsg ? (
        <p
          className={cn(
          "mt-3 text-sm",
            addMsg.includes("Added") ? "text-green-700" : "text-primary",
          )}
        >
          {addMsg}{" "}
          {addMsg.includes("Added") ? (
            <Link href="/cart" className="font-semibold text-primary underline">
              View cart
            </Link>
          ) : null}
        </p>
      ) : null}

      {lineRows.length > 0 ? (
        <table className="mt-6 w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-neutral-200 bg-neutral-100 px-2.5 py-2 text-left font-semibold text-neutral-600">
                Packaging
              </th>
              <th className="border border-neutral-200 bg-neutral-100 px-2.5 py-2 text-left font-semibold text-neutral-600">
                Full/Partial Pallet
              </th>
              <th className="border border-neutral-200 bg-neutral-100 px-2.5 py-2 text-left font-semibold text-neutral-600">
                Qty
              </th>
              <th className="border border-neutral-200 bg-neutral-100 px-2.5 py-2 text-left font-semibold text-neutral-600">
                Unit Price
              </th>
              <th className="border border-neutral-200 bg-neutral-100 px-2.5 py-2 text-left font-semibold text-neutral-600">
                EXT Price
              </th>
            </tr>
          </thead>
          <tbody>
            {lineRows.map((row, i) => {
              const r = row && typeof row === "object" ? row : {};
              return (
                <tr key={i}>
                  <td className="border border-neutral-200 px-2.5 py-2 text-neutral-900">{String(r.packaging ?? "")}</td>
                  <td className="border border-neutral-200 px-2.5 py-2 text-neutral-900">{String(r.pallet ?? "")}</td>
                  <td className="border border-neutral-200 px-2.5 py-2 text-neutral-900">{String(r.qty ?? "")}</td>
                  <td className="border border-neutral-200 px-2.5 py-2 text-neutral-900">{String(r.unitPrice ?? "")}</td>
                  <td className="border border-neutral-200 px-2.5 py-2 text-neutral-900">{String(r.extPrice ?? "")}</td>
                </tr>
              );
            })}
            {totalPrice ? (
              <tr className="font-bold [&_td]:bg-neutral-200">
                <td colSpan={4} className="border border-neutral-200 px-2.5 py-2 text-neutral-900">
                  <strong>TOTAL PRICE</strong>
                </td>
                <td className="border border-neutral-200 px-2.5 py-2 text-neutral-900">
                  <strong>{totalPrice}</strong>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
