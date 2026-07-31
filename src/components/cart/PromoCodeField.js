"use client";

import { useState } from "react";
import { applyCartPromo, removeCartPromo } from "@/lib/api/cart";
import { formatApiError } from "@/lib/formatApiError";

/** @param {{ cartId?: string | null; promo?: { code: string; formattedDiscount?: string } | null; onChanged?: () => void | Promise<void> }} props */
export default function PromoCodeField({ cartId, promo, onChanged }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function apply(e) {
    e.preventDefault();
    if (!cartId || !code.trim()) return;
    setBusy(true);
    setError("");
    try {
      await applyCartPromo(cartId, code.trim());
      setCode("");
      await onChanged?.();
    } catch (err) {
      setError(formatApiError(err, "Could not apply code."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!cartId) return;
    setBusy(true);
    setError("");
    try {
      await removeCartPromo(cartId);
      await onChanged?.();
    } catch (err) {
      setError(formatApiError(err, "Could not remove code."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="co-promo my-4 pt-1">
      {promo ? (
        <div className="co-promo__applied flex items-center justify-between gap-3 text-sm">
          <span>
            Code <strong>{promo.code}</strong>
            {promo.formattedDiscount ? ` (−${promo.formattedDiscount})` : ""}
          </span>
          <button
            type="button"
            className="co-promo__remove cursor-pointer border-0 bg-transparent p-0 text-sm text-neutral-900 underline disabled:cursor-not-allowed disabled:opacity-55"
            onClick={remove}
            disabled={busy}
          >
            Remove
          </button>
        </div>
      ) : (
        <form className="co-promo__form grid grid-cols-[minmax(0,1fr)_auto] gap-2.5" onSubmit={apply}>
          <input
            type="text"
            className="co-promo__input box-border min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900"
            placeholder="Discount code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy || !cartId}
            aria-label="Discount code"
          />
          <button
            type="submit"
            className="co-promo__apply min-h-11 min-w-[5.25rem] cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-500 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={busy || !code.trim() || !cartId}
          >
            Apply
          </button>
        </form>
      )}
      {error ? <p className="co-promo__error mt-2 mb-0 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
