import Image from "next/image";
import Link from "next/link";
import { Money } from "@/components/ui";

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
          sizes="88px"
          className="object-contain"
          unoptimized
        />
      </button>

      <div className="co-cart-line__details">
        <h2 className="co-cart-line__name">
          {line.productSlug ? (
            <Link
              href={`/products/${String(line.productSlug)}`}
              className="text-inherit no-underline hover:text-primary"
            >
              {String(line.name)}
            </Link>
          ) : (
            String(line.name)
          )}
        </h2>
        <p className="co-cart-line__pack">{String(line.packagingLabel)}</p>
        <button
          type="button"
          className="co-cart-line__unit"
          onClick={() => onOpenPricing?.(line)}
          disabled={!onOpenPricing}
        >
          <Money amount={Number(line.unitPrice || 0)} />
        </button>
        {line.priceNote ? <p className="co-cart-line__note">{String(line.priceNote)}</p> : null}
      </div>

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
            className="co-cart-line__remove"
            disabled={busy}
            onClick={() => onRemove(String(line.id))}
          >
            Remove
          </button>
        ) : null}
      </div>

      <p className="co-cart-line__total">
        <Money amount={Number(line.lineTotal || 0)} />
      </p>
    </article>
  );
}
