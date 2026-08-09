import { cn } from "@/lib/cn";

/** @type {Record<string, string>} */
const PRESET_CLASS = {
  catalog: "grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start",
  account: "grid gap-[clamp(1.25rem,3vw,2.5rem)] lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] lg:items-start",
  checkout: "grid gap-8 items-start lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-x-12 lg:gap-y-10",
  checkoutShipping: "grid gap-8 items-start lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-x-10 lg:gap-y-10",
  checkoutForm: "co-checkout-split grid gap-8 items-start lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-10 lg:gap-y-10",
  cart: "grid gap-8 items-start lg:grid-cols-[minmax(0,1fr)_minmax(20rem,22.5rem)] lg:gap-x-10",
  pdp: "grid gap-8 items-start lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-10",
};

/**
 * @param {{
 *   preset?: keyof typeof PRESET_CLASS;
 *   children: import('react').ReactNode;
 *   sidebar?: import('react').ReactNode;
 *   sidebarSide?: 'left' | 'right';
 *   stickySidebar?: boolean;
 *   className?: string;
 * }} props
 */
export default function TwoColumnLayout({
  preset = "catalog",
  children,
  sidebar,
  sidebarSide = "left",
  stickySidebar = false,
  className = "",
}) {
  const gridClass = cn(PRESET_CLASS[preset] ?? PRESET_CLASS.catalog, className);
  const sidebarClass = cn("min-w-0", stickySidebar && "lg:sticky lg:top-4");
  const mainClass = "min-w-0";

  if (!sidebar) {
    return <div className={cn("min-w-0", className)}>{children}</div>;
  }

  const sidebarEl = <aside className={sidebarClass}>{sidebar}</aside>;
  const mainEl = <div className={mainClass}>{children}</div>;

  return (
    <div className={gridClass}>
      {sidebarSide === "left" ? (
        <>
          {sidebarEl}
          {mainEl}
        </>
      ) : (
        <>
          {mainEl}
          {sidebarEl}
        </>
      )}
    </div>
  );
}
