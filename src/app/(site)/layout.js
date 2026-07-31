import MobileAccountCartFab from "@/components/layout/MobileAccountCartFab";
import SiteChromeFooter from "@/components/layout/SiteChromeFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ProductChatWidget from "@/components/chat/ProductChatWidget";
import CheckoutChromeGate from "@/components/checkout/CheckoutChromeGate";

/** Storefront chrome (header/footer) — not used on auth routes. */
/** @param {{ children: import('react').ReactNode }} props */
export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main className="page-content-mobile-fab-pad flex-1">{children}</main>
      <SiteChromeFooter />
      <CheckoutChromeGate>
        <MobileAccountCartFab />
        <ProductChatWidget />
      </CheckoutChromeGate>
    </>
  );
}
