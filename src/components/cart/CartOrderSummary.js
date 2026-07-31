import Image from "next/image";
import Link from "next/link";
import PromoCodeField from "@/components/cart/PromoCodeField";
import PalletSummaryPanel from "@/components/cart/PalletSummaryPanel";
import { LockIcon } from "@/components/checkout/icons/CheckoutIcons";
import { formatSarSymbol } from "@/lib/format/money";

/**
 * @param {{
 *   variant: "cart" | "shipping" | "compact" | "payment";
 *   lines: Array<Record<string, unknown>>;
 *   totals: Record<string, unknown>;
 *   logistics?: Record<string, unknown> | null;
 *   promo?: { code: string; formattedDiscount?: string } | null;
 *   cartId?: string | null;
 *   onPromoChanged?: () => void | Promise<void>;
 *   ctaHref?: string;
 *   ctaLabel?: string;
 *   onCtaClick?: () => void;
 *   ctaDisabled?: boolean;
 *   orderNote?: string;
 *   onOrderNoteChange?: (v: string) => void;
 *   deliveryAddress?: string | null;
 *   shippingMethods?: Array<{ id: string; label: string; priceFormatted?: string; etaDays?: number | null }>;
 *   selectedShippingId?: string;
 *   efficiencyScore?: number | null;
 *   recommendationMessage?: string | null;
 * }} props
 */
export default function CartOrderSummary({
  variant,
  lines,
  totals,
  logistics = null,
  promo = null,
  cartId = null,
  onPromoChanged,
  ctaHref,
  ctaLabel = "Check out",
  onCtaClick,
  ctaDisabled = false,
  orderNote,
  onOrderNoteChange,
  deliveryAddress,
  shippingMethods = [],
  selectedShippingId = "",
  efficiencyScore = null,
  recommendationMessage = null,
}) {
  const ctaContent = (
    <>
      {variant === "cart" ? <LockIcon className="size-4" /> : null}
      {ctaLabel}
    </>
  );

  const ctaEl =
    ctaHref && !onCtaClick ? (
      <Link href={ctaHref} className="co-cta">
        {ctaContent}
      </Link>
    ) : (
      <button type="button" className="co-cta" onClick={onCtaClick} disabled={ctaDisabled}>
        {ctaContent}
      </button>
    );

  const totalsBlock = (
    <div className="my-4 text-sm">
      {Number(totals.discount) > 0 ? (
        <div className="mb-1.5 flex justify-between">
          <span>Discount</span>
          <span>−{String(totals.formattedDiscount)}</span>
        </div>
      ) : null}
      <div className="mb-1.5 flex justify-between">
        <span>Shipping</span>
        <span>{String(totals.formattedShipping)}</span>
      </div>
      {Number(totals.vat) > 0 ? (
        <div className="mb-1.5 flex justify-between text-neutral-600">
          <span>VAT (15%)</span>
          <span>{String(totals.formattedVat)}</span>
        </div>
      ) : null}
      <p className="mt-2 mb-0 text-lg font-bold">
        Total Incl VAT {String(totals.formattedGrandTotal || totals.formattedTotalInclVat)}
      </p>
    </div>
  );

  if (variant === "compact" || variant === "payment") {
    return (
      <aside className={variant === "compact" ? "co-panel co-panel--compact w-full bg-transparent p-0 border-0" : "co-panel"}>
        <ul className="co-compact-lines m-0 list-none p-0">
          {lines.map((line) => (
            <li
              key={String(line.id)}
              className="co-compact-line grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3.5 border-b border-neutral-200 py-3.5 first:pt-0"
            >
              <div className="co-compact-line__thumb relative h-[4.25rem] w-14 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                <span className="co-compact-line__qty absolute -top-1.5 -right-1.5 z-[1] inline-flex h-[1.15rem] min-w-[1.35rem] items-center justify-center rounded px-1.5 text-[0.6875rem] font-bold leading-none text-white bg-neutral-900">
                  {String(line.quantity)}
                </span>
                <Image
                  src={String(line.image?.url || "/logo.png")}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <div className="co-compact-line__copy min-w-0">
                <p className="co-compact-line__name m-0 text-[0.8125rem] font-bold leading-snug text-neutral-900">
                  {String(line.name)}
                </p>
                <p className="co-compact-line__pack mt-0.5 mb-0 text-xs text-neutral-400">
                  {String(line.packagingLabel)}
                </p>
              </div>
              <span className="co-compact-line__price whitespace-nowrap text-[0.8125rem] font-semibold text-neutral-900">
                {formatSarSymbol(Number(line.lineTotal || 0))}
              </span>
            </li>
          ))}
        </ul>
        {variant === "compact" ? (
          <PromoCodeField cartId={cartId} promo={promo} onChanged={onPromoChanged} />
        ) : null}
        {variant === "compact" ? (
          <div className="co-compact-subtotal mt-1 flex items-baseline justify-between gap-4 text-[0.9375rem] font-bold text-neutral-900">
            <span>Subtotal.{String(totals.itemCount)} items</span>
            <strong className="whitespace-nowrap text-[1.0625rem] font-bold">
              {String(totals.formattedSubtotal)}
            </strong>
          </div>
        ) : (
          totalsBlock
        )}
      </aside>
    );
  }

  return (
    <aside className={variant === "cart" ? "co-panel co-panel--cart" : "co-panel"}>
      <p className="m-0 mb-1 text-xl leading-tight font-bold">
        <span className={variant === "cart" ? "text-sm" : ""}>Subtotal</span>{" "}
        {String(totals.formattedSubtotal)}
      </p>
      <p className="m-0 mb-5 text-xs text-neutral-500">Taxes and shipping calculated at checkout</p>

      {variant === "cart" && logistics ? <PalletSummaryPanel logistics={logistics} /> : null}

      {variant === "shipping" && deliveryAddress ? (
        <div className="mb-4 border border-neutral-300 bg-white px-4 py-3 text-xs leading-normal text-neutral-600">
          {deliveryAddress}
        </div>
      ) : null}

      {variant === "shipping" && logistics ? <PalletSummaryPanel logistics={logistics} /> : null}

      {variant === "shipping" && shippingMethods.length ? (
        <div className="mb-4 overflow-x-auto">
          <p className="m-0 mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">Shipping method</p>
          <table className="co-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>ETA</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {shippingMethods.map((method) => (
                <tr key={method.id} className={method.id === selectedShippingId ? "font-semibold" : ""}>
                  <td>{method.label}</td>
                  <td>{method.etaDays != null ? `${method.etaDays} days` : "—"}</td>
                  <td>{method.priceFormatted || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {variant === "shipping" && efficiencyScore != null ? (
        <div className="mb-4">
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-semibold">Shipping efficiency</span>
            <span className="font-mono font-bold">{efficiencyScore}%</span>
          </div>
          <div className="co-efficiency" role="progressbar" aria-valuenow={efficiencyScore} aria-valuemin={0} aria-valuemax={100}>
            <div className="co-efficiency__bar" style={{ width: `${Math.max(0, Math.min(100, efficiencyScore))}%` }} />
          </div>
          {recommendationMessage ? (
            <p className="mt-3 mb-0 bg-neutral-800 px-3 py-3 text-xs leading-relaxed text-white">
              <strong>AI Shipping Recommendation: </strong>
              {recommendationMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {variant === "shipping" ? totalsBlock : null}

      {variant === "shipping" ? (
        <>
          <label className="mb-1.5 block text-xs font-semibold" htmlFor="order-note">
            Add a note to your order
          </label>
          <textarea
            id="order-note"
            className="co-field min-h-16 resize-y"
            value={orderNote ?? ""}
            onChange={(e) => onOrderNoteChange?.(e.target.value)}
          />
        </>
      ) : null}

      {ctaEl}
    </aside>
  );
}
