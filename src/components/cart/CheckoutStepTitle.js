import Link from "next/link";
import { BagIcon, ArrowLeftIcon, LockIcon } from "@/components/checkout/icons/CheckoutIcons";

/**
 * @param {{
 *   step: string;
 *   title: string;
 *   continueHref?: string;
 *   continueLabel?: string;
 *   showContinue?: boolean;
 *   trailing?: import('react').ReactNode;
 *   variant?: "default" | "cart" | "address";
 * }} props
 */
export default function CheckoutStepTitle({
  step,
  title,
  continueHref = "/shop",
  continueLabel = "Continue shopping",
  showContinue = true,
  trailing,
  variant = "default",
}) {
  const isCart = variant === "cart";
  const isAddress = variant === "address";

  return (
    <div
      className={
        isCart
          ? "co-cart-heading"
          : isAddress
            ? "co-address-heading"
            : "co-root mb-6 flex flex-wrap items-center justify-between gap-4"
      }
    >
      <h1
        className={
          isCart
            ? "font-magistral m-0 text-[clamp(2.75rem,5vw,4.5rem)] leading-none font-bold tracking-[-0.035em] text-black"
            : "font-magistral m-0 flex items-center gap-2 text-[clamp(1.5rem,2.5vw,1.75rem)] font-bold text-neutral-900"
        }
      >
        {isAddress ? <LockIcon className="size-5 text-neutral-800" /> : null}
        {!isCart && !isAddress ? <BagIcon className="size-6 text-neutral-800" /> : null}
        <span>
          {step}-{isAddress ? " " : ""}
          {title}
        </span>
      </h1>
      {showContinue || trailing ? (
        <div className="flex flex-wrap items-center gap-2">
          {trailing}
          {showContinue ? (
            <Link
              href={continueHref}
              className="inline-flex items-center gap-2 rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 no-underline transition-colors hover:border-neutral-900"
            >
              <ArrowLeftIcon className="size-4" />
              {continueLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
