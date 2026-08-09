import Link from "next/link";
import SiteContainer from "@/components/layout/SiteContainer";
import { routes } from "@/lib/routes";

/**
 * homev2 workshop CTA — text + button over section-6 background (1440 canvas).
 * @param {{
 *   imageUrl?: string;
 *   title?: string;
 *   ctaLabel?: string;
 *   ctaHref?: string;
 * }} props
 */
export default function HomeV2WorkshopCta({
  imageUrl = "/images/home/section-6.png",
  title = "INTERESTED IN TAKING YOUR WORKSHOP TO THE NEXT LEVEL?",
  ctaLabel = "FIND YOUR NEAREST DISTRIBUTOR",
  ctaHref = routes.businessRegister,
}) {
  return (
    <section
      className="home-v2-workshop"
      style={{ backgroundImage: `url('${imageUrl}')` }}
      aria-label="Workshop call to action"
    >
      <SiteContainer className="flex h-full min-h-[inherit] flex-col items-start justify-center gap-[clamp(1rem,calc(100vw*24/1440),1.5rem)] py-[clamp(2rem,calc(100vw*48/1440),3rem)]">
        <h2 className="font-magistral m-0 max-w-[22ch] text-[clamp(1.125rem,calc(100vw*32/1440),2rem)] leading-[1.15] font-bold tracking-[0.04em] text-white uppercase">
          {title}
        </h2>
        <Link
          href={ctaHref}
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-primary px-[clamp(1.25rem,calc(100vw*28/1440),1.75rem)] py-2.5 text-[clamp(0.6875rem,calc(100vw*13/1440),0.8125rem)] font-bold tracking-[0.1em] text-white uppercase no-underline transition-[filter] duration-150 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {ctaLabel}
        </Link>
      </SiteContainer>
    </section>
  );
}
