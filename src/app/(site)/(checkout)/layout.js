import PageShell from "@/components/layout/PageShell";

/** @param {{ children: import('react').ReactNode }} props */
export default function CheckoutGroupLayout({ children }) {
  return <PageShell variant="checkout">{children}</PageShell>;
}
