import Image from "next/image";
import Link from "next/link";
import { formatSarSymbol } from "@/lib/format/money";

/**
 * @param {{
 *   line: Record<string, unknown>;
 *   onRemove?: (id: string) => void;
 *   onOpenPricing?: (line: Record<string, unknown>) => void;
 *   busy?: boolean;
 * }} props
 */
export default function CartLineItem({ line, onRemove, onOpenPricing, busy }) {
  return (
    <article className="co-cart-line">
      <button
        type="button"
        className="co-cart-line__image"
        onClick={() => onOpenPricing?.(line)}
        aria-label={`View pricing for ${String(line.name)}`}
        disabled={!onOpenPricing}
      >
        <Image
          src={String(line.image?.url || "")}
          alt={String(line.image?.alt || line.name || "")}
          fill
          sizes="72px"
          className="object-contain"
          unoptimized
        />
      </button>
      <div className="co-cart-line__details">
        <h2 className="m-0 text-xs leading-snug font-bold text-neutral-900">
          {line.productSlug ? (
            <Link href={`/products/${String(line.productSlug)}`} className="text-inherit no-underline hover:text-primary">
              {String(line.name)}
            </Link>
          ) : (
            String(line.name)
          )}
        </h2>
        <p className="mt-1 mb-0 text-xs text-neutral-600">{String(line.packagingLabel)}</p>
        <button
          type="button"
          className="mt-1 mb-0 cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-neutral-900 underline-offset-2 hover:underline"
          onClick={() => onOpenPricing?.(line)}
          disabled={!onOpenPricing}
        >
          {formatSarSymbol(Number(line.unitPrice || 0))}
        </button>
        {line.priceNote ? <p className="mt-0.5 mb-0 text-xs text-neutral-500">{String(line.priceNote)}</p> : null}
      </div>
      {onOpenPricing || onRemove ? (
        <div className="co-cart-line__actions">
          {onOpenPricing ? (
            <button
              type="button"
              className="co-cart-qty"
              disabled={busy}
              aria-label={`Change quantity for ${String(line.name)}`}
              onClick={() => onOpenPricing(line)}
            >
              {Number(line.quantity || 1)}
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-xs text-neutral-900 underline hover:text-primary"
              disabled={busy}
              onClick={() => onRemove(String(line.id))}
            >
              Remove
            </button>
          ) : null}
        </div>
      ) : null}
      <p className="co-cart-line__total">
        {formatSarSymbol(Number(line.lineTotal || 0))}
      </p>
    </article>
  );
}
