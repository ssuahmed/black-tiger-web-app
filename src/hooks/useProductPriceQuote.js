"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductPriceQuote } from "@/lib/api/catalog";
import { inferPalletType, mergeQuotePricing } from "@/lib/catalog/pdpPricing.mjs";

/**
 * Live price quote when packaging or quantity changes.
 *
 * @param {{
 *   slug: string;
 *   packagingOptionId: string;
 *   quantity: number;
 *   fallbackPricing?: Record<string, unknown> | null;
 *   packagingPricing?: Record<string, unknown> | null;
 *   enabled?: boolean;
 * }} options
 */
export function useProductPriceQuote({
  slug,
  packagingOptionId,
  quantity,
  fallbackPricing = null,
  packagingPricing = null,
  enabled = true,
}) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const palletType = useMemo(
    () => inferPalletType(packagingPricing ?? fallbackPricing, Math.max(1, quantity)),
    [packagingPricing, fallbackPricing, quantity],
  );

  useEffect(() => {
    if (!enabled || !slug || !packagingOptionId || quantity < 1) return;

    let alive = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProductPriceQuote(slug, {
          packagingOptionId,
          quantity: Math.max(1, quantity),
          palletType,
        });
        if (!alive) return;
        setQuote(data && typeof data === "object" ? data : null);
      } catch (e) {
        if (!alive) return;
        setQuote(null);
        setError(e instanceof Error ? e.message : "Unable to load price.");
      } finally {
        if (alive) setLoading(false);
      }
    }, 200);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [enabled, slug, packagingOptionId, quantity, palletType]);

  const pricing = useMemo(
    () => mergeQuotePricing(quote, fallbackPricing),
    [quote, fallbackPricing],
  );

  return { pricing, loading, error, palletType };
}
