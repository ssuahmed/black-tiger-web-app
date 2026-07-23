"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirect when cart is empty after ready (mock checkout steps).
 * @param {{ ready: boolean; isEmpty: boolean; redirectTo?: string }} options
 */
export function useCartStepGuard({ ready, isEmpty, redirectTo = "/cart" }) {
  const router = useRouter();

  useEffect(() => {
    if (ready && isEmpty) router.replace(redirectTo);
  }, [ready, isEmpty, redirectTo, router]);

  return { shouldRender: ready && !isEmpty };
}
