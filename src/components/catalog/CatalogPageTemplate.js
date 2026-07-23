import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import ActiveFilterChips from "@/components/catalog/ActiveFilterChips";
import CatalogLayout from "@/components/layout/CatalogLayout";
import PageShell from "@/components/layout/PageShell";
import SiteContainer from "@/components/layout/SiteContainer";

/**
 * Shared catalog listing chrome: breadcrumbs, optional filter chips, sidebar + main grid.
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
 *   sidebar: import('react').ReactNode;
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
  const crumbsVariant = breadcrumbVariant ?? (isShop ? "shop" : "default");

  if (isShop) {
    return (
      <PageShell variant="commerceLight" container={false}>
        {hero}
        <div className="bg-[#f2f2f2] pt-4 pb-3">
          <SiteContainer>
            <Breadcrumbs items={breadcrumbs} variant={crumbsVariant} />
            {onRemoveFilter && onClearFilters ? (
              <ActiveFilterChips filters={activeFilters} onRemove={onRemoveFilter} onClearAll={onClearFilters} />
            ) : null}
          </SiteContainer>
        </div>
        <div className="bg-[#f2f2f2] pb-12">
          <SiteContainer>
            <CatalogLayout sidebar={sidebar}>
              {children}
              {footer}
            </CatalogLayout>
          </SiteContainer>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="default">
      <Breadcrumbs items={breadcrumbs} variant={crumbsVariant} />
      {title ? (
        <div className="mb-4 mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-magistral m-0 text-2xl font-bold tracking-wide md:text-3xl">{title}</h1>
        </div>
      ) : null}
      {onRemoveFilter && onClearFilters ? (
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={onRemoveFilter}
          onClearAll={onClearFilters}
          className={title ? "mb-4" : "mt-3 mb-4"}
        />
      ) : null}
      <CatalogLayout sidebar={sidebar} className={title || activeFilters.length ? "" : "mt-6"}>
        {children}
        {footer}
      </CatalogLayout>
    </PageShell>
  );
}
