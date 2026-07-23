import TwoColumnLayout from "@/components/layout/TwoColumnLayout";

/** @param {{ sidebar: import('react').ReactNode; children: import('react').ReactNode; className?: string }} props */
export default function CatalogLayout({ sidebar, children, className = "" }) {
  return (
    <TwoColumnLayout preset="catalog" sidebar={sidebar} className={className}>
      {children}
    </TwoColumnLayout>
  );
}
