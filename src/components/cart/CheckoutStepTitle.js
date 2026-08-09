import Link from "next/link";
import { ArrowLeftIcon } from "@/components/checkout/icons/CheckoutIcons";

/**
 * @param {{
 *   step: string;
 *   title: string;
 *   continueHref?: string;
 *   continueLabel?: string;
 *   showContinue?: boolean;
 *   trailing?: import('react').ReactNode;
 * }} props
 */
export default function CheckoutStepTitle({
  step,
  title,
  continueHref = "/products",
  continueLabel = "Continue shopping",
  showContinue = true,
  trailing,
}) {
  return (
    <div className="co-cart-heading">
      <h1 className="co-cart-heading__title font-sf-pro m-0">
        <span>
          {step}-{title}
        </span>
      </h1>
      {showContinue || trailing ? (
        <div className="flex flex-wrap items-center gap-2">
          {trailing}
          {showContinue ? (
            <Link href={continueHref} className="co-cart-continue">
              <ArrowLeftIcon className="size-4" />
              {continueLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
