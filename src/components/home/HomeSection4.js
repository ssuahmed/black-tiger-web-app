import Image from "next/image";
import Link from "next/link";
import SiteContainer from "@/components/layout/SiteContainer";
import SiteSection from "@/components/layout/SiteSection";
import { HOME_SECTION_4 } from "@/data/homeSection4Content";

const STRONGER_WIDTH = 307;
const STRONGER_HEIGHT = 481;

/** Homepage section 4 — background + 50/50 STRONGER | card */
export default function HomeSection4() {
  const { eyebrow, titleLine1, titleLine2, body, ctaLabel, ctaHref } = HOME_SECTION_4;

  return (
    <SiteSection
      width="100%"
      height="auto"
      preserveAspectOnMobile={false}
      backgroundImage="url('/images/home/section-4/background.png')"
      backgroundSize="100% 100%"
      backgroundPosition="center"
      className=""
      innerClassName="flex h-full min-h-0 items-stretch py-12 md:py-16 lg:py-20"
      aria-label="Adaptive Shield Technology"
    >
      <SiteContainer className="grid h-full min-h-0 grid-cols-1 items-stretch gap-40 md:grid-cols-2 md:gap-64 lg:gap-80">
        <div className="flex h-full min-h-0 items-center justify-center md:justify-end">
          <Image
            src="/images/home/section-4/stronger.png"
            alt="Stronger"
            width={STRONGER_WIDTH}
            height={STRONGER_HEIGHT}
            className="h-auto w-auto max-h-[calc(100vw*568/1440-6rem)] max-w-full object-contain object-right mix-blend-screen md:max-h-[calc(100vw*568/1440-8rem)] lg:max-h-[calc(100vw*568/1440-10rem)]"
            sizes="(max-width: 768px) 45vw, 22vw"
            priority
          />
        </div>

        <div className="flex h-full min-h-0 items-stretch justify-center md:justify-start">
          <div className="box-border flex h-full w-full min-w-0 max-w-[min(100%,clamp(18rem,calc(100vw*620/1920),38.75rem))] flex-col bg-white px-[clamp(1.5rem,calc(100vw*40/1920),2.5rem)] py-[clamp(1.5rem,calc(100vw*40/1920),2.5rem)] text-neutral-900">
            <p className="m-0 text-xs font-bold tracking-[0.12em] text-primary uppercase">{eyebrow}</p>
            <h2 className="font-magistral mt-2.5 mb-0 text-2xl leading-[1.12] font-bold tracking-[0.04em] uppercase">
              <span className="block">{titleLine1}</span>
              <span className="block">{titleLine2}</span>
            </h2>
            <p className="mt-4 mb-0 text-sm leading-[1.55] text-neutral-700">{body}</p>
            <Link
              href={ctaHref}
              className="mt-auto inline-flex items-center justify-center self-start rounded-full border border-primary bg-white px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase no-underline transition-colors duration-150 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </SiteContainer>
    </SiteSection>
  );
}
