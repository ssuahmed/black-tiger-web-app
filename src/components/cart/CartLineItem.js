import Image from "next/image";
import Link from "next/link";
import { formatSarSymbol } from "@/lib/format/money";

/** @param {{ line: import("@/data/cartMockData").MockCartLine; onQtyChange?: (id: string, qty: number) => void; onRemove?: (id: string) => void; busy?: boolean }} props */
export default function CartLineItem({ line, onQtyChange, onRemove, busy }) {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-5 gap-y-4 py-5 border-b border-neutral-200 items-start md:grid-cols-[auto_minmax(0,1fr)_minmax(0,6rem)]">
      <div className="relative w-20 h-[6.5rem] shrink-0 bg-white border border-neutral-200">
        <Image src={line.image.url} alt={line.image.alt} fill sizes="80px" className="object-contain p-1" unoptimized />
      </div>
      <div className="min-w-0">
        <h2 className="m-0 text-sm font-bold leading-snug text-neutral-900">
          {line.productSlug ? (
            <Link href={`/products/${line.productSlug}`} className="text-inherit no-underline hover:text-primary">
              {line.name}
            </Link>
          ) : (
            line.name
          )}
        </h2>
        <p className="mt-1 mb-0 text-sm text-neutral-600">{line.packagingLabel}</p>
        <p className="mt-2 mb-0 text-sm font-semibold text-neutral-900">{formatSarSymbol(line.unitPrice)}</p>
        {line.priceNote ? <p className="mt-0.5 mb-0 text-xs text-neutral-500">{line.priceNote}</p> : null}
        {onQtyChange || onRemove ? (
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {onQtyChange ? (
              <input
                type="number"
                min={1}
                className="box-border w-[4.5rem] min-h-9 py-1.5 px-2 text-sm text-center text-neutral-900 bg-white border border-neutral-300 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-0"
                value={line.quantity}
                disabled={busy}
                aria-label={`Quantity for ${line.name}`}
                onChange={(e) => onQtyChange(line.id, Number(e.target.value))}
              />
            ) : null}
            {onRemove ? (
              <button
                type="button"
                className="p-0 text-sm text-neutral-900 underline bg-transparent border-0 cursor-pointer hover:text-primary"
                disabled={busy}
                onClick={() => onRemove(line.id)}
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="text-base font-bold text-neutral-900 whitespace-nowrap md:text-right md:pt-1">
        {formatSarSymbol(line.lineTotal)}
      </p>
    </article>
  );
}
