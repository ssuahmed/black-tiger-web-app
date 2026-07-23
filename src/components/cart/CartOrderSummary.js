import Image from "next/image";
import Link from "next/link";
import { formatSarSymbol } from "@/lib/format/money";

const panelClass =
  "py-5 px-6 bg-neutral-100 border border-neutral-200 rounded text-neutral-900";

const primaryBtnClass =
  "flex items-center justify-center gap-2 w-full min-h-12 mt-4 py-3 px-6 text-sm font-semibold text-white no-underline bg-neutral-900 border-0 cursor-pointer transition-colors hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed";

/** @param {{ lines: import("@/data/cartMockData").MockCartLine[]; totals: ReturnType<import("@/data/cartMockData").computeCartTotals> }} props */
function CompactLineList({ lines, totals }) {
  return (
    <>
      <ul className="m-0 mb-4 p-0 list-none">
        {lines.map((line) => (
          <li
            key={line.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 py-3 border-b border-neutral-300 items-start"
          >
            <div className="relative w-14 h-[4.5rem] border border-neutral-200 bg-white">
              <span className="absolute -top-1.5 -right-1.5 z-[1] inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-neutral-900 rounded-full">
                {line.quantity}
              </span>
              <Image src={line.image.url} alt="" fill sizes="56px" className="object-contain p-0.5" unoptimized />
            </div>
            <div>
              <p className="m-0 text-xs font-semibold leading-snug">{line.name}</p>
              <p className="mt-0.5 mb-0 text-xs text-neutral-500">{line.packagingLabel}</p>
            </div>
            <span className="text-xs font-semibold whitespace-nowrap">{formatSarSymbol(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-sm [&_strong]:block [&_strong]:mt-1 [&_strong]:text-base">
        Subtotal · {totals.itemCount} items
        <strong>{formatSarSymbol(totals.subtotal)}</strong>
      </p>
    </>
  );
}

/**
 * @param {{
 *   variant: "cart" | "shipping" | "compact" | "payment";
 *   lines: import("@/data/cartMockData").MockCartLine[];
 *   totals: ReturnType<import("@/data/cartMockData").computeCartTotals>;
 *   ctaHref?: string;
 *   ctaLabel?: string;
 *   onCtaClick?: () => void;
 *   ctaDisabled?: boolean;
 *   orderNote?: string;
 *   onOrderNoteChange?: (v: string) => void;
 *   deliveryAddress?: string | null;
 *   shippingMethods?: Array<{ id: string; label: string; priceFormatted?: string; etaDays?: number | null }>;
 *   selectedShippingId?: string;
 * }} props
 */
export default function CartOrderSummary({
  variant,
  lines,
  totals,
  ctaHref,
  ctaLabel = "Check out",
  onCtaClick,
  ctaDisabled = false,
  orderNote,
  onOrderNoteChange,
  deliveryAddress,
  shippingMethods = [],
  selectedShippingId = "",
}) {
  const ctaContent = (
    <>
      {variant === "cart" ? (
        <span className="text-sm" aria-hidden>
          🔒
        </span>
      ) : null}
      {ctaLabel}
    </>
  );

  const ctaEl =
    ctaHref && !onCtaClick ? (
      <Link href={ctaHref} className={primaryBtnClass}>
        {ctaContent}
      </Link>
    ) : (
      <button type="button" className={primaryBtnClass} onClick={onCtaClick} disabled={ctaDisabled}>
        {ctaContent}
      </button>
    );

  const totalsBlock = (
    <div className="my-4 text-sm">
      <div className="flex justify-between mb-1.5">
        <span>Shipping</span>
        <span>{formatSarSymbol(totals.shipping)}</span>
      </div>
      <p className="mt-2 mb-0 text-lg font-bold">Total Incl VAT {formatSarSymbol(totals.totalInclVat)}</p>
    </div>
  );

  if (variant === "compact" || variant === "payment") {
    return (
      <aside className={panelClass}>
        <CompactLineList lines={lines} totals={totals} />
        {variant === "payment" ? totalsBlock : null}
      </aside>
    );
  }

  return (
    <aside className={panelClass}>
      <p className="m-0 mb-1 text-xl font-bold leading-tight">Subtotal {totals.formattedSubtotal}</p>
      <p className="m-0 mb-5 text-xs text-neutral-500">Taxes and shipping calculated at checkout</p>

      {variant === "shipping" && deliveryAddress ? (
        <div className="mb-4 py-3 px-4 text-xs leading-normal text-neutral-600 bg-white border border-neutral-300">
          {deliveryAddress}
        </div>
      ) : null}

      {variant === "shipping" && shippingMethods.length ? (
        <div className="mb-4">
          <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Shipping method</p>
          <ul className="m-0 p-0 list-none border border-neutral-300 bg-white">
            {shippingMethods.map((method) => {
              const selected = method.id === selectedShippingId;
              return (
                <li
                  key={method.id}
                  className={`flex items-center justify-between gap-3 border-b border-neutral-200 px-3 py-2.5 text-xs last:border-b-0 ${
                    selected ? "bg-neutral-50 font-semibold" : "text-neutral-600"
                  }`}
                >
                  <span>
                    {method.label}
                    {method.etaDays != null ? ` · ${method.etaDays} days` : ""}
                  </span>
                  <span className="whitespace-nowrap">{method.priceFormatted || ""}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {variant === "shipping" ? totalsBlock : null}

      {variant === "shipping" ? (
        <>
          <label className="block mb-1.5 text-xs font-semibold" htmlFor="order-note">
            Add a note to your order
          </label>
          <textarea
            id="order-note"
            className="box-border w-full min-h-16 py-2 px-3 text-sm text-neutral-900 bg-white border border-neutral-300 resize-y"
            value={orderNote ?? ""}
            onChange={(e) => onOrderNoteChange?.(e.target.value)}
          />
        </>
      ) : null}

      {ctaEl}
    </aside>
  );
}
