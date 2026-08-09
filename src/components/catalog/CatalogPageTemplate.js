import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import ActiveFilterChips from "@/components/catalog/ActiveFilterChips";
import CatalogLayout from "@/components/layout/CatalogLayout";
import PageShell from "@/components/layout/PageShell";
import SiteContainer from "@/components/layout/SiteContainer";

/**
 * Shared catalog listing chrome: breadcrumbs, optional filter chips, sidebar + main grid.
 * Active filter chips sit above the product list in the main column.
 *
 * @param {{
 *   variant?: 'shop' | 'listing';
 *   breadcrumbs: Array<{ label: string; href?: string }>;
 *   breadcrumbVariant?: 'default' | 'shop';
 *   title?: string;
 *   activeFilters?: Array<{ key: string; value: string; label: string }>;
 *   onRemoveFilter?: (key: string, value: string) => void;
 *   onClearFilters?: () => void;
 *   hero?: import('react').ReactNode;
 *   sidebar?: import('react').ReactNode;
 *   children: import('react').ReactNode;
 *   footer?: import('react').ReactNode;
 * }} props
 */
export default function CatalogPageTemplate({
  variant = "listing",
  breadcrumbs,
  breadcrumbVariant,
  title,
  activeFilters = [],
  onRemoveFilter,
  onClearFilters,
  hero,
  sidebar,
  children,
  footer,
}) {
  const isShop = variant === "shop";
  const crumbsVariant = breadcrumbVariant ?? "shop";
  const chips =
    onRemoveFilter && onClearFilters ? (
      <ActiveFilterChips
        filters={activeFilters}
        onRemove={onRemoveFilter}
        onClearAll={onClearFilters}
        className="mb-4"
      />
    ) : null;

  if (isShop) {
    return (
      <PageShell variant="commerceLight" container={false}>
        {hero}
        <div className="bg-[#f2f2f2] pt-4 pb-3">
          <SiteContainer>
            <Breadcrumbs items={breadcrumbs} variant={crumbsVariant} />
          </SiteContainer>
        </div>
        <div className="bg-[#f2f2f2] pb-12">
          <SiteContainer>
            <CatalogLayout sidebar={sidebar}>
              {chips}
              {children}
              {footer}
            </CatalogLayout>
          </SiteContainer>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="default" className="bg-[#EDEEF2] font-geogrotesque">
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbs} variant={crumbsVariant} />
      </div>
      {title ? (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 text-2xl font-bold tracking-wide md:text-3xl">{title}</h1>
        </div>
      ) : null}
      <CatalogLayout sidebar={sidebar} className={title ? "" : "mt-6"}>
        {chips}
        {children}
        {footer}
      </CatalogLayout>
    </PageShell>
  );
}
