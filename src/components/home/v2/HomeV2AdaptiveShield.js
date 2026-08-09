import Image from "next/image";
import Link from "next/link";
import SiteContainer from "@/components/layout/SiteContainer";
import SiteSection from "@/components/layout/SiteSection";
import { HOME_SECTION_4 } from "@/data/homeSection4Content";
import { cmsImageProps } from "@/lib/cmsImage";

const STRONGER_WIDTH = 307;
const STRONGER_HEIGHT = 481;

/**
 * homev2 Adaptive Shield — 1440 canvas; STRONGER art hidden on mobile.
 * @param {{
 *   backgroundImage?: string;
 *   strongerImage?: string;
 *   eyebrow?: string;
 *   titleLine1?: string;
 *   titleLine2?: string;
 *   bodyHtml?: string;
 *   cta?: { label?: string; href?: string };
 * }} props
 */
export default function HomeV2AdaptiveShield({
  backgroundImage = HOME_SECTION_4.backgroundImage ?? "/images/home/section-4/background.png",
  strongerImage = HOME_SECTION_4.strongerImage ?? "/images/home/section-4/stronger.png",
  eyebrow = HOME_SECTION_4.eyebrow,
  titleLine1 = HOME_SECTION_4.titleLine1,
  titleLine2 = HOME_SECTION_4.titleLine2,
  bodyHtml,
  cta = { label: HOME_SECTION_4.ctaLabel, href: HOME_SECTION_4.ctaHref },
}) {
  const bg = backgroundImage?.startsWith("url(")
    ? backgroundImage
    : `url('${backgroundImage}')`;

  return (
    <SiteSection
      width="100%"
      height="auto"
      preserveAspectOnMobile={false}
      backgroundImage={bg}
      backgroundSize="cover"
      backgroundPosition="center"
      className="home-v2-shield min-h-[22rem] sm:min-h-[26rem] md:min-h-[clamp(28rem,calc(100vw*560/1440),35rem)]"
      innerClassName="flex h-full min-h-0 items-stretch py-[clamp(2rem,calc(100vw*48/1440),3.5rem)]"
      aria-label="Adaptive Shield Technology"
    >
      <SiteContainer className="grid h-full min-h-0 grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-[clamp(2rem,calc(100vw*64/1440),5rem)] lg:gap-[clamp(3rem,calc(100vw*120/1440),7.5rem)]">
        <div className="hidden min-h-0 items-center justify-center md:flex md:justify-end">
          <Image
            src={strongerImage}
            alt="Stronger"
            width={STRONGER_WIDTH}
            height={STRONGER_HEIGHT}
            className="h-auto w-auto max-h-[calc(100vw*420/1440)] max-w-full object-contain object-right mix-blend-screen lg:max-h-[calc(100vw*480/1440)]"
            sizes="28vw"
            {...cmsImageProps(strongerImage)}
          />
        </div>

        <div className="flex min-h-0 items-stretch justify-center md:justify-start">
          <div className="box-border flex w-full min-w-0 max-w-[min(100%,clamp(18rem,calc(100vw*500/1440),31.25rem))] flex-col bg-white px-[clamp(1.25rem,calc(100vw*40/1440),2.5rem)] py-[clamp(1.25rem,calc(100vw*40/1440),2.5rem)] text-neutral-900">
            <p className="m-0 text-[clamp(0.6875rem,calc(100vw*12/1440),0.75rem)] font-bold tracking-[0.12em] text-primary uppercase">
              {eyebrow}
            </p>
            <h2 className="font-magistral mt-2.5 mb-0 text-[clamp(1.125rem,calc(100vw*28/1440),1.75rem)] leading-[1.12] font-bold tracking-[0.04em] uppercase italic">
              {titleLine1 ? <span className="block">{titleLine1}</span> : null}
              {titleLine2 ? <span className="block">{titleLine2}</span> : null}
            </h2>
            {bodyHtml ? (
              <div
                className="prose prose-sm mt-4 mb-8 max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <p className="mt-4 mb-8 text-sm leading-[1.55] text-neutral-700">{HOME_SECTION_4.body}</p>
            )}
            <Link
              href={cta?.href || HOME_SECTION_4.ctaHref}
              className="mt-auto inline-flex items-center justify-center self-start rounded-full border border-primary bg-white px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase italic no-underline transition-colors duration-150 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {cta?.label || HOME_SECTION_4.ctaLabel}
            </Link>
          </div>
        </div>
      </SiteContainer>
    </SiteSection>
  );
}
