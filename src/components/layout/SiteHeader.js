import Link from "next/link";
import HeaderAccountLink from "@/components/layout/HeaderAccountLink";
import CartIconLink from "@/components/layout/CartIconLink";
import MobileMainNav from "@/components/layout/MobileMainNav";
import SiteNav from "@/components/layout/SiteNav";
import BrandLogo from "@/components/ui/BrandLogo";
import Icon from "@/components/ui/Icon";
import { routes } from "@/lib/routes";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <Link
            href="/"
            className="flex-y-center shrink-0 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <BrandLogo variant="header" priority />
          </Link>
        </div>
        <div className="site-header__nav hidden min-w-0 max-w-full lg:block">
          <SiteNav />
        </div>
        <div className="site-header__actions flex-y-center gap-1 sm:gap-2 md:gap-3">
          <form
            action={routes.shop}
            method="get"
            className="site-header__search hidden min-w-0 max-w-[14rem] md:flex md:max-w-[18rem] lg:max-w-xs"
            role="search"
          >
            <label className="sr-only" htmlFor="site-header-search-q">
              Search products
            </label>
            <input
              id="site-header-search-q"
              name="q"
              type="search"
              placeholder="Search products…"
              className="site-header__search-input"
              autoComplete="off"
            />
            <button type="submit" className="icon-btn shrink-0" aria-label="Submit search">
              <Icon name="search" className="header-icon text-white" />
            </button>
          </form>
          <nav className="flex-y-center gap-1 sm:gap-2 md:gap-3" aria-label="Quick actions">
            <Link
              href={routes.shop}
              className="icon-btn md:hidden"
              aria-label="Search"
              scroll={false}
            >
              <Icon name="search" className="header-icon text-white" />
            </Link>
            <HeaderAccountLink />
            <CartIconLink className="icon-btn icon-btn--lg-only" />
          </nav>
          <MobileMainNav />
        </div>
      </div>
    </header>
  );
}
