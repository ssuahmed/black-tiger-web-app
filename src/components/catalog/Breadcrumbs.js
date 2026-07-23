import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * @param {{ items?: Array<{ label: string; href?: string }>; variant?: 'default' | 'shop' }} props
 */
export default function Breadcrumbs({ items = [], variant = "default" }) {
  if (!items.length) return null;

  if (variant === "shop") {
    return (
      <nav className="m-0 text-xs tracking-wide text-[#c4a4a8] uppercase" aria-label="Breadcrumb">
        <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
          {items.map((crumb, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 ? (
                  <span className="text-[#c4a4a8]" aria-hidden>
                    {">"}
                  </span>
                ) : null}
                {last || !crumb.href ? (
                  <span className={last ? "text-[#9a7a7e]" : undefined}>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-inherit no-underline hover:text-primary">
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
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <span aria-hidden>/</span> : null}
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
