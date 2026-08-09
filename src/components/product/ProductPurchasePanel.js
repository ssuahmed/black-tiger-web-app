"use client";

import Link from "next/link";
import { Money, Spinner } from "@/components/ui";

import { cn } from "@/lib/cn";
import { formatSarAmount, stripSarCurrencyLabel } from "@/lib/format/money";

/** Plain table amount: no currency symbol, always two decimal places. */
function formatTablePrice(value) {
  if (value == null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatSarAmount(value);
  }
  const stripped = stripSarCurrencyLabel(String(value)).replace(/,/g, "");
  const n = Number(stripped);
  return Number.isFinite(n) ? formatSarAmount(n) : stripSarCurrencyLabel(String(value));
}

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
    (pricing.unitPrice != null ? formatSarAmount(Number(pricing.unitPrice)) : "");
  const lineRows = Array.isArray(pricing.lineSummaryRows) ? pricing.lineSummaryRows : [];
  const totalPrice = pricing.totalPrice ? String(pricing.totalPrice) : "";

  const selectedOption = packagingOptions.find(
    (o) => o && typeof o === "object" && String(o.id) === packagingOptionId,
  );
  const selectedLabel = selectedOption ? String(selectedOption.label ?? "") : "";

  const priceText = String(formattedPrice);

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
          <Money value={priceText} symbolClassName="pdp-buy__price-symbol" />
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
          <table className="pdp-table pdp-table--summary">
            <thead>
              <tr>
                <th scope="col">Packaging</th>
                <th scope="col">Full/Partial Pallet</th>
                <th scope="col">Qty</th>
                <th scope="col" className="pdp-table__unit-head">
                  <span>Unit</span>
                  <span>Price</span>
                </th>
                <th scope="col" className="pdp-table__ext-head">
                  EXT Price
                </th>
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
                    <td>{r.unitPrice ? formatTablePrice(r.unitPrice) : ""}</td>
                    <td className="pdp-table__ext">
                      {r.extPrice ? formatTablePrice(r.extPrice) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPrice ? (
            <div className="pdp-table__total-row" aria-label="Total price">
              <div className="pdp-table__total-spacer" aria-hidden="true" />
              <div className="pdp-table__total-inner">
                <span className="pdp-table__total-label">TOTAL PRICE</span>
                <span className="pdp-table__total-value">{formatTablePrice(totalPrice)}</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
