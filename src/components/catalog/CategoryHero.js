import Link from "next/link";
import SiteContainer from "@/components/layout/SiteContainer";

const HERO_GRADIENT =
  "linear-gradient(105deg, #f5f5f5 42%, #fff5f5 58%, #ffebeb 72%, #f5f5f5 100%)";

/** @param {{ eyebrow: string; title: string; body?: string; bodyHtml?: string; ctaLabel: string; ctaHref: string; backgroundImage?: string }} props */
export default function CategoryHero({
  eyebrow,
  title,
  body,
  bodyHtml,
  ctaLabel,
  ctaHref,
  backgroundImage,
}) {
  return (
    <section
      className="relative w-full min-h-[clamp(16rem,calc(100vw*420/1920),26.25rem)] bg-neutral-100 bg-cover bg-[center_left] bg-no-repeat lg:min-h-[clamp(20rem,calc(100vw*480/1920),30rem)] [background-image:var(--hero-bg-image)]"
      aria-label="Category highlight"
      style={
        backgroundImage
          ? { "--hero-bg-image": `url(${backgroundImage})` }
          : { "--hero-bg-image": HERO_GRADIENT }
      }
    >
      <SiteContainer className="box-border flex w-full min-h-[inherit] items-stretch justify-end">
        <div className="box-border my-0 ms-auto me-[var(--page-gutter-x)] flex w-full min-w-0 max-w-[min(100%,clamp(18rem,calc(100vw*420/1920),26.25rem))] flex-col bg-white px-[clamp(1.5rem,calc(100vw*40/1920),2.5rem)] py-[clamp(1.5rem,calc(100vw*40/1920),2.5rem)] text-neutral-900 lg:ms-8 lg:me-[max(var(--page-gutter-x),env(safe-area-inset-right,0px))]">
          <p className="m-0 text-xs font-bold tracking-[0.12em] text-primary uppercase">{eyebrow}</p>
          <h1 className="font-magistral mt-2.5 mb-0 text-2xl leading-[1.12] font-bold tracking-[0.04em] uppercase">
            {title}
          </h1>
          {bodyHtml ? (
            <div
              className="prose prose-sm prose-neutral mt-4 mb-0 max-w-none text-neutral-700"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <p className="mt-4 mb-0 text-sm leading-[1.55] text-neutral-700">{body}</p>
          )}
          <Link
            href={ctaHref}
            className="mt-auto inline-flex items-center justify-center self-start border border-primary bg-white px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase no-underline transition-colors duration-150 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {ctaLabel}
          </Link>
        </div>
      </SiteContainer>
    </section>
  );
}
