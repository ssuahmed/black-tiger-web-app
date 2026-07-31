"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ProductPricingBlock from "@/components/product/ProductPricingBlock";
import { getProductBySlug, getProductPriceQuote } from "@/lib/api/catalog";
import { scopePalletTables } from "@/lib/catalog/pdpPricing.mjs";
import { formatSarSymbol } from "@/lib/format/money";
import { formatApiError } from "@/lib/formatApiError";

/**
 * Cart volume-pricing modal (Figma Pages 22–23).
 * @param {{
 *   open: boolean;
 *   line: Record<string, unknown> | null;
 *   onClose: () => void;
 *   onUpdateQuantity?: (lineId: string, quantity: number) => void | Promise<void>;
 * }} props
 */
export default function CartPricingModal({ open, line, onClose, onUpdateQuantity }) {
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(() => Number(line?.quantity || 1));
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !line?.productSlug) return;
    let alive = true;
    getProductBySlug(String(line.productSlug))
      .then((data) => {
        if (alive) setProduct(data);
      })
      .catch((err) => {
        if (alive) setError(formatApiError(err, "Could not load pricing."));
      });
    return () => {
      alive = false;
    };
  }, [open, line?.productSlug, line?.quantity]);

  useEffect(() => {
    if (!open || !line?.productSlug) return;
    let alive = true;
    const timer = setTimeout(() => {
      getProductPriceQuote(String(line.productSlug), {
        packagingOptionId: String(line.packagingOptionId || ""),
        quantity: Math.max(1, Number(qty) || 1),
        palletType: String(line.palletType || "partial"),
      })
        .then((data) => {
          if (alive) setQuote(data);
        })
        .catch(() => {
          if (alive) setQuote(null);
        });
    }, 200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [open, line?.productSlug, line?.packagingOptionId, line?.palletType, qty]);

  async function handleUpdate() {
    if (!line?.id || !onUpdateQuantity) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      await onUpdateQuantity(String(line.id), Math.max(1, Number(qty) || 1));
      onClose();
    } catch (err) {
      setError(formatApiError(err, "Could not update quantity."));
    } finally {
      setBusy(false);
    }
  }

  const packagingOptions = Array.isArray(product?.packagingOptions) ? product.packagingOptions : [];
  const selectedPackaging = packagingOptions.find(
    (option) => String(option?.id ?? "") === String(line?.packagingOptionId ?? ""),
  );
  const selectedPricing =
    selectedPackaging?.pricing && typeof selectedPackaging.pricing === "object"
      ? selectedPackaging.pricing
      : null;
  const quotePricing =
    quote?.pricing && typeof quote.pricing === "object"
      ? quote.pricing
      : quote && typeof quote === "object"
        ? quote
        : {};
  const lineSummary =
    quote?.lineSummary && typeof quote.lineSummary === "object"
      ? quote.lineSummary
      : quotePricing.lineSummary && typeof quotePricing.lineSummary === "object"
        ? quotePricing.lineSummary
        : null;
  const unit = Number(lineSummary?.unitPrice ?? quotePricing.unitPrice ?? line?.unitPrice ?? 0);
  const quantity = Math.max(1, Number(qty) || 1);
  const total = Number(lineSummary?.totalPrice ?? lineSummary?.extendedPrice ?? unit * quantity);
  const displayPricing = product
    ? {
        ...(product.pricing && typeof product.pricing === "object" ? product.pricing : {}),
        ...quotePricing,
        ...scopePalletTables(selectedPricing, quotePricing),
      }
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={String(line?.name || "Pricing")}
      dialogClassName="modal-dialog--cart-pricing"
      showClose={false}
    >
      <div className="co-root co-cart-pricing">
        {error ? <p className="m-0 text-sm text-red-700">{error}</p> : null}
        <p className="co-cart-pricing__meta">Size: {String(line?.packagingLabel || "")}</p>
        {selectedPackaging?.sku ? (
          <p className="co-cart-pricing__meta">Part Number: {String(selectedPackaging.sku)}</p>
        ) : null}

        <div className="co-cart-pricing__update">
          <input
            type="number"
            min={1}
            className="co-cart-pricing__qty"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            disabled={busy}
            aria-label={`Quantity for ${String(line?.name || "product")}`}
          />
          <button type="button" className="co-cart-pricing__submit" onClick={handleUpdate} disabled={busy}>
            UPDATE
          </button>
        </div>

        <div className="co-cart-pricing__line-table">
          <table className="pdp-table">
            <thead>
              <tr>
                <th>Packaging</th>
                <th>Full/Partial Pallet</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>EXT Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{String(lineSummary?.packagingLabel ?? line?.packagingLabel ?? "")}</td>
                <td>{formatPalletType(lineSummary?.palletType ?? line?.palletType)}</td>
                <td>{quantity}</td>
                <td>{formatSarSymbol(unit)}</td>
                <td>{formatSarSymbol(total)}</td>
              </tr>
              <tr className="pdp-table__total">
                <td colSpan={4}>TOTAL PRICE</td>
                <td>{formatSarSymbol(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {product && displayPricing ? (
          <ProductPricingBlock product={{ ...product, documents: [], pricing: displayPricing }} />
        ) : (
          <p className="text-sm text-neutral-500">Loading tiers…</p>
        )}
      </div>
    </Modal>
  );
}

function formatPalletType(value) {
  if (value === "full") return "Full Pallet";
  if (value === "partial") return "Partial Pallet";
  return "Unit";
}
