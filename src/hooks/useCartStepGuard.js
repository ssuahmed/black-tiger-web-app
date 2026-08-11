"use client";

/**
 * Lightweight empty-cart redirect for cart-adjacent pages that do not need summary gates.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * @param {{ ready: boolean; isEmpty: boolean; redirectTo?: string }} options
 */
export function useCartStepGuard({ ready, isEmpty, redirectTo = "/cart" }) {
  const router = useRouter();

  useEffect(() => {
    if (ready && isEmpty) router.replace(redirectTo);
  }, [ready, isEmpty, redirectTo, router]);

  return { shouldRender: ready && !isEmpty };
}
