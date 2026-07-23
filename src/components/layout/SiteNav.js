"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav font-magistral w-full max-w-full text-white" aria-label="Main">
      <ul className="site-nav__list">
        {NAV_LINKS.map(({ href, label }) => {
          const active =
            href === "/shop"
              ? pathname === "/shop" || pathname.startsWith("/shop/")
              : href.startsWith("/products")
                ? pathname === href || pathname.startsWith("/products/")
                : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="site-nav__item">
              <Link
                href={href}
                className={`header-nav-link site-nav__link block whitespace-nowrap transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? "text-primary" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}