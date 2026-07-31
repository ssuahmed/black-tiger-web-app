"use client";

import Link from "next/link";
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

  const selectedOption = packagingOptions.find(
    (o) => o && typeof o === "object" && String(o.id) === packagingOptionId,
  );
  const selectedLabel = selectedOption ? String(selectedOption.label ?? "") : "";

  const priceText = String(formattedPrice);
  const showRiyalSymbol = /\bSAR\b/i.test(priceText);

  return (
    <div className="pdp-buy">
      <h1 className="pdp-buy__title">{name}</h1>
      {subtitle ? <p className="pdp-buy__subtitle">{subtitle}</p> : null}

      {packagingOptions.length > 0 ? (
        <>
          <p className="pdp-buy__label">
            {sizeLabel ? `Pack size (${selectedLabel || sizeLabel})` : "Pack size"}
          </p>
          <div className="pdp-buy__options" role="group" aria-label="Pack size">
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
                    "pdp-option",
                    active && "pdp-option--active",
                    hasSale && "pdp-option--badged",
                  )}
                  aria-pressed={active}
                  onClick={() => onPackagingChange(id)}
                >
                  {String(o.label ?? id)}
                  {hasSale ? <span className="pdp-option__badge">Sale</span> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {priceText ? (
        <p className={cn("pdp-buy__price", pricingLoading && "pdp-buy__price--loading")}>
          {showRiyalSymbol ? <RiyalSymbol /> : null}
          {priceText}
        </p>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAddToCart(e);
        }}
      >
        <div className="pdp-buy__cart-row">
          <input
            id="pdp-qty"
            type="number"
            min={1}
            className="pdp-buy__qty"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            disabled={adding}
            aria-label="Quantity"
          />
          <button type="submit" className="pdp-buy__submit" disabled={adding}>
            {adding ? <Spinner size="sm" /> : "Add to Cart"}
          </button>
        </div>
      </form>

      {addMsg ? (
        <p className={cn("pdp-buy__msg", addMsg.includes("Added") ? "text-green-700" : "text-primary")}>
          {addMsg}{" "}
          {addMsg.includes("Added") ? (
            <Link href="/cart" className="font-semibold text-primary underline">
              View cart
            </Link>
          ) : null}
        </p>
      ) : null}

      {lineRows.length > 0 ? (
        <div className="pdp-table-wrap">
          <table className="pdp-table">
            <thead>
              <tr>
                <th scope="col">Packaging</th>
                <th scope="col">Full/Partial Pallet</th>
                <th scope="col">QTY</th>
                <th scope="col">Unit Price</th>
                <th scope="col">EXT Price</th>
              </tr>
            </thead>
            <tbody>
              {lineRows.map((row, i) => {
                const r = row && typeof row === "object" ? row : {};
                return (
                  <tr key={i}>
                    <td>{String(r.packaging ?? "")}</td>
                    <td>{String(r.pallet ?? "")}</td>
                    <td>{String(r.qty ?? "")}</td>
                    <td>{String(r.unitPrice ?? "")}</td>
                    <td>{String(r.extPrice ?? "")}</td>
                  </tr>
                );
              })}
              {totalPrice ? (
                <tr className="pdp-table__total">
                  <td colSpan={4}>TOTAL PRICE</td>
                  <td>{totalPrice}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function RiyalSymbol() {
  return (
    <svg
      className="pdp-buy__price-symbol"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M15.6 2.4v8.4c0 2.5-2 4.5-4.5 4.5" />
        <path d="M9.2 2.4v9.2" />
        <path d="M2.8 17.3h18.4" />
        <path d="M2.8 21h18.4" />
      </g>
    </svg>
  );
}
