import Link from "next/link";
import { cn } from "@/lib/cn";

function BreadcrumbSeparator({ className = "" }) {
  return (
    <span
      className={cn(
        "inline-block h-[0.7em] w-[0.5em] shrink-0 bg-current [-webkit-mask:url('/icons/breadcrumb-next.png')_center/contain_no-repeat] [mask:url('/icons/breadcrumb-next.png')_center/contain_no-repeat]",
        className,
      )}
      aria-hidden
    />
  );
}

/**
 * @param {{ items?: Array<{ label: string; href?: string }>; variant?: 'default' | 'shop' }} props
 */
export default function Breadcrumbs({ items = [], variant = "default" }) {
  if (!items.length) return null;

  if (variant === "shop") {
    return (
      <nav
        className="font-geogrotesque m-0 mb-0 text-[clamp(0.8125rem,calc(100vw*15/1440),0.9375rem)] font-medium tracking-[0.04em] text-[#9C6D70] uppercase"
        aria-label="Breadcrumb"
      >
        <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
          {items.map((crumb, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                {i > 0 ? <BreadcrumbSeparator className="bg-[#2D2D2D]" /> : null}
                {last || !crumb.href ? (
                  <span className={cn(last ? "text-[#2D2D2D]" : undefined)}>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-inherit no-underline transition-colors hover:text-primary">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-600">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <BreadcrumbSeparator className="bg-neutral-500" /> : null}
              {last || !crumb.href ? (
                <span className={cn(last && "font-semibold text-neutral-900")}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-primary">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
