import Link from "next/link";
import { Suspense } from "react";
import HeaderAccountLink from "@/components/layout/HeaderAccountLink";
import HeaderAskAiButton from "@/components/layout/HeaderAskAiButton";
import CartIconLink from "@/components/layout/CartIconLink";
import HeaderSearch from "@/components/layout/HeaderSearch";
import MobileMainNav from "@/components/layout/MobileMainNav";
import SiteNav from "@/components/layout/SiteNav";
import BrandLogo from "@/components/ui/BrandLogo";
import Icon from "@/components/ui/Icon";

export default function SiteHeader() {
  return (
    <header className="site-header relative">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <Link
            href="/"
            className="flex-y-center max-w-full outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <BrandLogo variant="header" priority />
          </Link>
        </div>
        <div className="site-header__nav hidden min-w-0 max-w-full lg:block">
          <SiteNav />
        </div>
        <div className="site-header__actions flex-y-center gap-1 sm:gap-2 md:gap-3">
          <Suspense
            fallback={
              <span className="site-header__search" aria-hidden>
                <span className="icon-btn shrink-0">
                  <Icon name="search" className="header-icon text-white" />
                </span>
              </span>
            }
          >
            <HeaderSearch />
          </Suspense>
          <nav className="flex-y-center gap-1 sm:gap-2 md:gap-3" aria-label="Quick actions">
            <HeaderAccountLink />
            <CartIconLink className="icon-btn icon-btn--lg-only" />
            <HeaderAskAiButton />
          </nav>
          <MobileMainNav />
        </div>
      </div>
    </header>
  );
}
