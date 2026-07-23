import Image from "next/image";
import Link from "next/link";
import { HOME_PRODUCT_STRIP } from "@/data/homeProductStrip";
import { cmsImageProps } from "@/lib/cmsImage";
import { cn } from "@/lib/cn";

/** @param {typeof HOME_PRODUCT_STRIP[number]} panel */
function ProductPanel({ panel }) {
  const isQuality = panel.variant === "quality";

  return (
    <article
      className={cn(
        "relative box-border h-full min-h-0 overflow-hidden",
        "border-b border-white sm:border-r sm:border-b-0 sm:even:border-r-0",
        "lg:border-r lg:even:border-r lg:last:border-r-0",
      )}
    >
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
          "relative z-[1] flex h-full min-h-0 flex-col justify-between",
          "p-2 sm:p-3",
          "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-2 lg:p-4",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-start justify-start gap-[clamp(0.75rem,calc(100vw*20/1920),1.25rem)]",
            isQuality && "justify-center self-center",
          )}
        >
          <h2
            className={cn(
              "m-0 font-bold leading-[1.05] tracking-[0.01em]",
              isQuality
                ? "text-[clamp(1.75rem,calc(100vw*44/1440),1.75rem)] leading-[1.08] text-black"
                : "text-[clamp(2rem,calc(100vw*56/1440),2.75rem)] text-white italic",
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
              className="inline-block border-b border-white pb-0.5 text-[clamp(0.875rem,calc(100vw*18/1920),1.125rem)] leading-[1.2] font-normal text-white italic no-underline transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Read more...
            </Link>
          ) : null}
        </div>

        <div className="flex items-end justify-center self-end">
          <Image
            src={panel.productImage}
            alt={panel.productAlt}
            width={isQuality ? 420 : 280}
            height={isQuality ? 320 : 380}
            className={cn(
              "h-auto w-auto max-h-[45%] max-w-full object-contain",
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

/** Homepage section 2 — product strip after hero */
export default function HomeProductStrip({ panels = HOME_PRODUCT_STRIP }) {
  if (!panels?.length) return null;

  return (
    <section className="h-[20vh] w-full max-w-full bg-black" aria-label="Featured product lines" style={{marginTop: "4px"}}>
      <div className="grid h-full w-full grid-cols-1 grid-rows-4 sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-4 lg:grid-rows-1">
        {panels.map((panel) => (
          <ProductPanel key={panel.id} panel={panel} />
        ))}
      </div>
    </section>
  );
}
