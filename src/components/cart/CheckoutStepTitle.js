import Link from "next/link";

/** @param {{ step: string; title: string; continueHref?: string }} props */
export default function CheckoutStepTitle({ step, title, continueHref = "/shop" }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 className="font-magistral flex items-center gap-2 m-0 text-2xl font-bold text-neutral-900">
        <span className="text-xl leading-none" aria-hidden>
          🛍
        </span>
        {step}-{title}
      </h1>
      <Link
        href={continueHref}
        className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-neutral-900 no-underline bg-white border border-neutral-300 rounded transition-colors hover:border-neutral-900"
      >
        <span className="text-base leading-none" aria-hidden>
          ←
        </span>
        Continue shopping
      </Link>
    </div>
  );
}