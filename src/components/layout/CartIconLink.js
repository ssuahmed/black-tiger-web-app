"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/contexts/CartContext";
import { routes } from "@/lib/routes";

/**
 * @param {{
 *   className?: string;
 *   iconClassName?: string;
 *   badgeClassName?: string;
 * }} props
 */
export default function CartIconLink({
  className = "icon-btn",
  iconClassName = "header-icon text-white",
  badgeClassName = "cart-icon-badge",
}) {
  const { itemCount } = useCart();
  const label = itemCount > 0 ? `Cart, ${itemCount} items` : "Cart";

  return (
    <Link href={routes.cart} className={`cart-icon-link ${className}`} aria-label={label} scroll={false}>
      <Icon name="cart" className={iconClassName} />
      {itemCount > 0 ? (
        <span className={badgeClassName} aria-hidden>
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
