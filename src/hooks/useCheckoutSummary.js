"use client";

import { useCallback, useEffect, useState } from "react";
import { getCheckoutSummary } from "@/lib/api/checkout";

/** @param {string | null | undefined} cartId @param {{ enabled?: boolean }} [opts] */
export function useCheckoutSummary(cartId, opts = {}) {
  const enabled = opts.enabled !== false;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(cartId) && enabled);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!cartId) {
      setSummary(null);
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getCheckoutSummary(cartId);
      setSummary(data && typeof data === "object" ? data : null);
      return data;
    } catch (err) {
      setSummary(null);
      setError(err instanceof Error ? err.message : "Could not load checkout summary.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  useEffect(() => {
    if (!enabled || !cartId) return;
    void refresh();
  }, [enabled, cartId, refresh]);

  return { summary, loading, error, refresh };
}
