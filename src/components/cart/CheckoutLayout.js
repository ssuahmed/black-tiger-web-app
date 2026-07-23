import TwoColumnLayout from "@/components/layout/TwoColumnLayout";

/** @param {{ children: React.ReactNode; sidebar: React.ReactNode; formLayout?: boolean }} props */
export default function CheckoutLayout({ children, sidebar, formLayout }) {
  return (
    <TwoColumnLayout preset={formLayout ? "checkoutForm" : "checkout"} sidebar={sidebar} sidebarSide="right" stickySidebar>
      {children}
    </TwoColumnLayout>
  );
}
