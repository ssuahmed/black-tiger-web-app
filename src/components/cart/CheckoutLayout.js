import TwoColumnLayout from "@/components/layout/TwoColumnLayout";
import { cn } from "@/lib/cn";

/**
 * @param {{
 *   children: React.ReactNode;
 *   sidebar: React.ReactNode;
 *   top?: React.ReactNode;
 *   formLayout?: boolean;
 *   preset?: "checkout" | "checkoutForm" | "checkoutShipping" | "cart";
 *   className?: string;
 * }} props
 */
export default function CheckoutLayout({
  children,
  sidebar,
  top,
  formLayout,
  preset,
  className = "",
}) {
  return (
    <div className={cn("co-root", className)}>
      {top}
      <TwoColumnLayout
        preset={preset ?? (formLayout ? "checkoutForm" : "checkout")}
        sidebar={sidebar}
        sidebarSide="right"
        stickySidebar
      >
        {children}
      </TwoColumnLayout>
    </div>
  );
}
