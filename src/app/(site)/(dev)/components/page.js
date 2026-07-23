import ComponentCatalog from "@/components/dev/ComponentCatalog";
import SiteContainer from "@/components/layout/SiteContainer";
import { getComponentCatalog, groupCatalogByCategory } from "@/lib/component-catalog";

export const metadata = {
  title: "Components | Black Tiger",
  description: "Catalog of React components in the Black Tiger web app.",
};

export default function ComponentsPage() {
  const catalog = getComponentCatalog();
  const groups = groupCatalogByCategory(catalog);

  return (
    <div className="py-10 pb-16 md:py-12 md:pb-20">
      <SiteContainer>
        <header className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Developer reference</p>
          <h1 className="font-magistral mb-3 text-3xl font-bold leading-tight md:text-4xl">Components</h1>
          <p className="m-0 text-base leading-relaxed text-neutral-600">
            Auto-generated from{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">src/components</code>.
            Scanned at build time — add a new{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">.js</code> file and
            refresh this page.
          </p>
        </header>

        <ComponentCatalog groups={groups} />
      </SiteContainer>
    </div>
  );
}