import SiteContainer from "@/components/layout/SiteContainer";
import { cn } from "@/lib/cn";

/** @type {Record<string, string>} */
const VARIANT_CLASS = {
  default: "py-8 md:py-12",
  marketing: "py-12 md:py-16",
  commerce: "",
  commerceLight: "bg-[#f2f2f2] text-neutral-900 [color-scheme:light]",
  account: "bg-neutral-50 py-8 md:py-12",
  checkout: "bg-white py-6 pb-14 text-neutral-900",
  pdp: "bg-white py-6 pb-14 text-neutral-900 [color-scheme:light]",
  auth: "flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-14",
  none: "",
};

/**
 * @param {{
 *   variant?: keyof typeof VARIANT_CLASS;
 *   children: import('react').ReactNode;
 *   className?: string;
 *   container?: boolean;
 *   containerClassName?: string;
 * }} props
 */
export default function PageShell({
  variant = "default",
  children,
  className = "",
  container = true,
  containerClassName = "",
}) {
  const outerClass = cn(VARIANT_CLASS[variant] ?? VARIANT_CLASS.default, className);

  if (!container) {
    return <div className={outerClass}>{children}</div>;
  }

  return (
    <div className={outerClass}>
      <SiteContainer className={containerClassName}>{children}</SiteContainer>
    </div>
  );
}
