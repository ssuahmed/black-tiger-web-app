"use client";

import { usePathname } from "next/navigation";

/**
 * Hide floating chrome on multi-step checkout routes (Figma logo-only frames).
 * Keep on /cart and warehouse pages where full chrome is shown.
 */
export default function CheckoutChromeGate({ children }) {
  const pathname = usePathname() || "";
  const hideFloating =
    pathname.startsWith("/cart/address") ||
    pathname.startsWith("/cart/shipping") ||
    pathname.startsWith("/cart/payment") ||
    pathname.startsWith("/checkout");

  if (hideFloating) return null;
  return children;
}
