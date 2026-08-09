import Image from "next/image";
import Link from "next/link";
import PromoCodeField from "@/components/cart/PromoCodeField";
import PalletSummaryPanel from "@/components/cart/PalletSummaryPanel";
import { LockIcon } from "@/components/checkout/icons/CheckoutIcons";
import { Money } from "@/components/ui";

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
 *   shippingMethods?: Array<{
 *     id: string;
 *     label: string;
 *     priceFormatted?: string;
 *     priceAmount?: number;
 *     etaDays?: number | null;
 *     qty?: number;
 *     palletsLoaded?: number;
 *     lineTotal?: number;
 *   }>;
 *   selectedShippingId?: string;
 *   onShippingMethodChange?: (id: string) => void;
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
  onShippingMethodChange,
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
    <div className={variant === "payment" ? "co-payment-totals" : "my-4 text-sm"}>
      {Number(totals.discount) > 0 ? (
        <div className={variant === "payment" ? "co-payment-totals__row" : "mb-1.5 flex justify-between"}>
          <span>Discount</span>
          <span>
            −<Money value={String(totals.formattedDiscount)} />
          </span>
        </div>
      ) : null}
      <div className={variant === "payment" ? "co-payment-totals__row" : "mb-1.5 flex justify-between"}>
        <span>Shipping</span>
        <span>
          <Money value={String(totals.formattedShipping)} />
        </span>
      </div>
      {variant !== "payment" && Number(totals.vat) > 0 ? (
        <div className="mb-1.5 flex justify-between text-neutral-600">
          <span>VAT (15%)</span>
          <span>
            <Money value={String(totals.formattedVat)} />
          </span>
        </div>
      ) : null}
      {variant === "payment" ? (
        <div className="co-payment-totals__grand">
          <span>Total Incl VAT</span>
          <strong>
            <Money value={String(totals.formattedGrandTotal || totals.formattedTotalInclVat)} />
          </strong>
        </div>
      ) : (
        <p className="mt-2 mb-0 text-lg font-bold">
          Total Incl VAT{" "}
          <Money value={String(totals.formattedGrandTotal || totals.formattedTotalInclVat)} />
        </p>
      )}
    </div>
  );

  if (variant === "compact" || variant === "payment") {
    return (
      <div
        className={
          variant === "compact"
            ? "co-panel co-panel--compact"
            : "co-panel co-panel--payment"
        }
      >
        <ul className="co-compact-lines">
          {lines.map((line) => (
            <li key={String(line.id)} className="co-compact-line">
              <div className="co-compact-line__thumb">
                <span className="co-compact-line__qty">{String(line.quantity)}</span>
                <Image
                  src={String(line.image?.url || "/logo.png")}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <div className="co-compact-line__copy">
                <p className="co-compact-line__name">{String(line.name)}</p>
                <p className="co-compact-line__pack">{String(line.packagingLabel)}</p>
              </div>
              <span className="co-compact-line__price">
                <Money amount={Number(line.lineTotal || 0)} />
              </span>
            </li>
          ))}
        </ul>
        {variant === "compact" ? (
          <PromoCodeField cartId={cartId} promo={promo} onChanged={onPromoChanged} />
        ) : null}
        {variant === "compact" ? (
          <div className="co-compact-subtotal">
            <span>
              Subtotal . {String(totals.itemCount ?? lines.length)} items
            </span>
            <strong>
              <Money value={String(totals.formattedSubtotal)} />
            </strong>
          </div>
        ) : (
          totalsBlock
        )}
      </div>
    );
  }

  if (variant === "shipping") {
    const methodRows = shippingMethods.map((method) => {
      const qty = Number(method.qty ?? 0);
      const unitPrice = Number(method.priceAmount ?? 0);
      const lineTotal = Number(method.lineTotal ?? unitPrice * qty);
      const palletsLoaded = Number(method.palletsLoaded ?? 0);
      return {
        ...method,
        selected: method.id === selectedShippingId,
        qty,
        unitPrice,
        totalPriceAmount: lineTotal,
        totalPallets: palletsLoaded,
      };
    });
    const totalQty = methodRows.reduce((sum, row) => sum + row.qty, 0);
    const totalPriceAmount = methodRows.reduce((sum, row) => sum + row.totalPriceAmount, 0);
    const totalPallets = methodRows.reduce((sum, row) => sum + row.totalPallets, 0);
    const score =
      efficiencyScore != null && Number.isFinite(Number(efficiencyScore))
        ? Math.max(0, Math.min(100, Math.round(Number(efficiencyScore))))
        : null;

    return (
      <aside className="co-panel co-panel--shipping font-sf-pro">
        <p className="co-ship-subtotal">
          <span>Subtotal</span>
          <strong>
            <Money value={String(totals.formattedSubtotal)} />
          </strong>
        </p>

        {deliveryAddress ? (
          <div className="co-ship-address">
            <p className="co-ship-address__label">Delivery address:</p>
            <p className="co-ship-address__body">{deliveryAddress}</p>
          </div>
        ) : null}

        {logistics ? <PalletSummaryPanel logistics={logistics} /> : null}

        {methodRows.length ? (
          <div className="co-ship-methods">
            <table className="co-table co-table--ship-methods">
              <thead>
                <tr>
                  <th scope="col">Shipping Method</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Price</th>
                  <th scope="col">Total Price</th>
                  <th scope="col">Total Pallets</th>
                </tr>
              </thead>
              <tbody>
                {methodRows.map((method) => (
                  <tr key={method.id} className={method.qty > 0 ? "is-selected" : undefined}>
                    <td>{method.label}</td>
                    <td>{method.qty || "—"}</td>
                    <td>
                      {method.priceFormatted ? <Money value={method.priceFormatted} /> : "—"}
                    </td>
                    <td>
                      {method.totalPriceAmount > 0 ? (
                        <Money amount={method.totalPriceAmount} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{method.totalPallets || "—"}</td>
                  </tr>
                ))}
                <tr className="co-table__total">
                  <td>Total</td>
                  <td>{totalQty || "—"}</td>
                  <td />
                  <td>
                    {totalPriceAmount > 0 ? (
                      <Money amount={totalPriceAmount} />
                    ) : totals.formattedShipping ? (
                      <Money value={String(totals.formattedShipping)} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{totalPallets || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        {score != null ? (
          <div className="co-ship-efficiency">
            <p className="co-ship-efficiency__label">Shipping Efficiency Score {score}%</p>
            <div
              className="co-efficiency"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Shipping efficiency score"
            >
              <div className="co-efficiency__bar" style={{ width: `${score}%` }} />
            </div>
          </div>
        ) : null}

        {recommendationMessage ? (
          <div className="co-ship-reco">
            <p className="co-ship-reco__title">AI Shipping Recommendation:</p>
            <p className="co-ship-reco__body">{recommendationMessage}</p>
          </div>
        ) : null}

        <div className="co-ship-totals">
          {Number(totals.discount) > 0 ? (
            <div className="co-ship-totals__row">
              <span>Discount</span>
              <span>
                −<Money value={String(totals.formattedDiscount)} />
              </span>
            </div>
          ) : null}
          <div className="co-ship-totals__row">
            <span>Shipping</span>
            <span>
              <Money value={String(totals.formattedShipping)} />
            </span>
          </div>
          <div className="co-ship-totals__row co-ship-totals__row--grand">
            <span>Total Incl VAT</span>
            <strong>
              <Money value={String(totals.formattedGrandTotal || totals.formattedTotalInclVat)} />
            </strong>
          </div>
        </div>

        <label className="co-ship-note-label" htmlFor="order-note">
          Add a note to your order
        </label>
        <textarea
          id="order-note"
          className="co-field co-ship-note"
          value={orderNote ?? ""}
          onChange={(e) => onOrderNoteChange?.(e.target.value)}
        />

        <button type="button" className="co-cta co-ship-cta" onClick={onCtaClick} disabled={ctaDisabled}>
          {ctaLabel}
        </button>
      </aside>
    );
  }

  return (
    <aside className="co-panel co-panel--cart">
      <p className="co-cart-subtotal">
        <span className="co-cart-subtotal__label">Subtotal</span>
        <span className="co-cart-subtotal__value">
          <Money value={String(totals.formattedSubtotal)} />
          <span className="co-cart-subtotal__sar">SAR</span>
        </span>
      </p>
      <p className="co-cart-subtotal__hint">Taxes and shipping calculated at checkout</p>

      {logistics ? <PalletSummaryPanel logistics={logistics} /> : null}

      {ctaEl}
    </aside>
  );
}
