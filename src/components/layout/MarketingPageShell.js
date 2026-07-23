import PageShell from "@/components/layout/PageShell";
import PageTitle from "@/components/layout/PageTitle";

/** @param {{ title: string; children: import('react').ReactNode }} props */
export default function MarketingPageShell({ title, children }) {
  return (
    <PageShell variant="marketing">
      <PageTitle>{title}</PageTitle>
      <div className="mt-4 max-w-2xl text-neutral-600">{children}</div>
    </PageShell>
  );
}
