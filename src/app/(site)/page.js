import HomeFooter from "@/components/home/HomeFooter";
import HomeHotSellingProducts from "@/components/home/HomeHotSellingProducts";
import HomeProductStrip from "@/components/home/HomeProductStrip";
import HomeV2Accordion from "@/components/home/v2/HomeV2Accordion";
import HomeV2AdaptiveShield from "@/components/home/v2/HomeV2AdaptiveShield";
import HomeV2Locations from "@/components/home/v2/HomeV2Locations";
import HomeV2Packaging from "@/components/home/v2/HomeV2Packaging";
import HomeV2WorkshopCta from "@/components/home/v2/HomeV2WorkshopCta";
import SiteContainer from "@/components/layout/SiteContainer";
import SiteSection from "@/components/layout/SiteSection";
import { getFeatured } from "@/lib/api/catalog";
import { fetchPageContent } from "@/lib/api/content";
import { parseHomePage } from "@/lib/content/homePage";
import Link from "next/link";

export async function generateMetadata() {
  const cms = await fetchPageContent("home");
  const title = cms?.name ?? "Home";
  return {
    title: title === "Homepage" ? "Black Tiger Lubricants" : `${title} | Black Tiger`,
    description: "High-end lubricants engineered for performance and reliability.",
  };
}

/** Homepage — 1440 mock layout (formerly `/homev2`). */
export default async function Home() {
  const [cmsPage, featuredProducts] = await Promise.all([
    fetchPageContent("home"),
    getFeatured().catch(() => []),
  ]);

  const home = parseHomePage(cmsPage?.blocks);

  return (
    <div className="home-v2">
      <SiteSection
        backgroundImage={`url('${home.hero.backgroundImage}')`}
        height="660px"
        preserveAspectOnMobile={false}
        className="home-hero-section"
      >
        <SiteContainer className="flex h-full flex-col items-start justify-center gap-8 py-4 lg:justify-center lg:py-30">
          <h1 className="font-magistral m-0 max-w-[18ch] text-[clamp(1.125rem,5vw,4rem)] leading-[1.1] text-white lg:mx-20 lg:my-20">
            {home.hero.title}
          </h1>
        </SiteContainer>
      </SiteSection>

      <HomeProductStrip panels={home.productStrip} />

      <SiteSection
        backgroundImage={`url('${home.section3.backgroundImage}')`}
        aspectRatio="1440/420"
        preserveAspectOnMobile={false}
        className="min-h-[16rem] sm:min-h-[22rem] mb-0.5"
      >
        <SiteContainer className="flex h-full flex-col items-end justify-end py-10 sm:py-14">
          <Link
            href={home.section3.cta.href}
            className="btn btn-primary font-magistral inline-flex text-base no-underline sm:text-xl md:text-2xl"
          >
            {home.section3.cta.label}
          </Link>
        </SiteContainer>
      </SiteSection>

      <HomeV2AdaptiveShield
        backgroundImage={home.section4.backgroundImage}
        strongerImage={home.section4.strongerImage}
        eyebrow={home.section4.eyebrow}
        titleLine1={home.section4.titleLine1}
        titleLine2={home.section4.titleLine2}
        bodyHtml={home.section4.bodyHtml}
        cta={home.section4.cta}
      />

      <HomeV2Accordion categories={home.applications} />

      <HomeV2WorkshopCta imageUrl={home.section6Image} />
      <HomeV2Packaging imageUrl={home.section7Image} />
      <HomeV2Locations imageUrl={home.section8Image} />

      <HomeHotSellingProducts title="Best Selling Products" products={featuredProducts} />

      <HomeFooter footer={home.footer} />
    </div>
  );
}
