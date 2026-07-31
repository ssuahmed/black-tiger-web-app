import Image from "next/image";
import Link from "next/link";
import { HOME_PRODUCT_STRIP } from "@/data/homeProductStrip";
import { cmsImageProps } from "@/lib/cmsImage";
import { cn } from "@/lib/cn";

/** @param {typeof HOME_PRODUCT_STRIP[number]} panel */
function ProductPanel({ panel }) {
  const isQuality = panel.variant === "quality";

  return (
    <article className="relative box-border h-full min-h-0 overflow-hidden">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-black bg-center bg-no-repeat",
          isQuality ? "bg-[length:100%_100%]" : "bg-cover",
        )}
        style={{
          backgroundImage: `url(${isQuality ? panel.background : panel.smoke})`,
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] flex h-full min-h-0 flex-col",
          "p-2.5 sm:p-3",
          "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-2 lg:p-4",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 flex-col items-start justify-start gap-1.5 lg:gap-[clamp(0.75rem,calc(100vw*20/1920),1.25rem)]",
            isQuality && "lg:justify-center lg:self-center",
          )}
        >
          <h2
            className={cn(
              "m-0 font-bold leading-[1.05] tracking-[0.01em]",
              isQuality
                ? "text-[clamp(1.125rem,4vw,1.75rem)] leading-[1.08] text-black"
                : "text-[clamp(1.25rem,4.5vw,2.75rem)] text-white italic",
            )}
          >
            {isQuality ? (
              <>
                <span className="block">Quality Is</span>
                <span className="block">First</span>
              </>
            ) : (
              panel.title
            )}
          </h2>

          {panel.showReadMore !== false ? (
            <Link
              href={panel.href}
              className="inline-block border-b border-white pb-0.5 text-[clamp(0.75rem,calc(100vw*18/1920),1.125rem)] leading-[1.2] font-normal text-white italic no-underline transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Read more...
            </Link>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 items-end justify-center pt-2 lg:flex-none lg:self-end lg:pt-0">
          <Image
            src={panel.productImage}
            alt={panel.productAlt}
            width={isQuality ? 420 : 280}
            height={isQuality ? 320 : 380}
            className={cn(
              "h-full max-h-full w-auto max-w-full object-contain lg:h-auto lg:max-h-[45%]",
              isQuality ? "object-bottom-right" : "object-bottom",
            )}
            sizes="(max-width: 1024px) 50vw, 25vw"
            priority
            {...cmsImageProps(panel.productImage)}
          />
        </div>
      </div>
    </article>
  );
}

/** Homepage section 2 — product strip after hero (2×2 on mobile, 4×1 on desktop) */
export default function HomeProductStrip({ panels = HOME_PRODUCT_STRIP }) {
  if (!panels?.length) return null;

  return (
    <section
      className="mt-1 w-full max-w-full bg-white lg:h-[min(28vh,20rem)]"
      aria-label="Featured product lines"
    >
      <div className="grid h-full w-full auto-rows-[minmax(14rem,1fr)] grid-cols-2 gap-px bg-white sm:auto-rows-[minmax(17rem,1fr)] lg:auto-rows-fr lg:grid-cols-4 lg:grid-rows-1">
        {panels.map((panel) => (
          <ProductPanel key={panel.id} panel={panel} />
        ))}
      </div>
    </section>
  );
}
