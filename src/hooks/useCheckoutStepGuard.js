"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { checkoutStepAllowed } from "@/lib/checkout/mapCheckout.mjs";
import { useCheckoutSummary } from "@/hooks/useCheckoutSummary";

/**
 * Redirects when cart is empty or checkout prerequisites are missing.
 * @param {{ step: "address" | "shipping" | "payment"; cartId?: string | null; ready: boolean; isEmpty: boolean; enabled?: boolean }} options
 */
export function useCheckoutStepGuard({ step, cartId, ready, isEmpty, enabled = true }) {
  const router = useRouter();
  const needsSummary = step === "shipping" || step === "payment";
  const { summary, loading: summaryLoading, refresh } = useCheckoutSummary(cartId, {
    enabled: enabled && needsSummary && ready && !isEmpty && Boolean(cartId),
  });

  useEffect(() => {
    if (!enabled || !ready) return;
    if (isEmpty) {
      router.replace("/cart");
    }
  }, [enabled, ready, isEmpty, router]);

  useEffect(() => {
    if (!enabled || !ready || isEmpty || !needsSummary || summaryLoading || !summary) return;
    if (!checkoutStepAllowed(summary, step)) {
      if (step === "payment") {
        router.replace("/cart/shipping");
      } else if (step === "shipping") {
        router.replace("/cart/address");
      }
    }
  }, [enabled, ready, isEmpty, needsSummary, summaryLoading, summary, step, router]);

  const allowed = step === "address" || (!!summary && checkoutStepAllowed(summary, step));
  const shouldRender =
    enabled &&
    ready &&
    !isEmpty &&
    (!needsSummary || (!summaryLoading && !!summary && allowed));

  return { shouldRender, summary, summaryLoading, refreshSummary: refresh };
}
