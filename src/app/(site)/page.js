import ApplicationAccordion from "@/components/home/ApplicationAccordion";
import HomeAskAiButton from "@/components/home/HomeAskAiButton";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHotSellingProducts from "@/components/home/HomeHotSellingProducts";
import HomeProductStrip from "@/components/home/HomeProductStrip";
import HomeSection6 from "@/components/home/HomeSection6";
import HomeSection7 from "@/components/home/HomeSection7";
import HomeSection8 from "@/components/home/HomeSection8";
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

export default async function Home() {
  const [cmsPage, featuredProducts] = await Promise.all([
    fetchPageContent("home"),
    getFeatured().catch(() => []),
  ]);

  const home = parseHomePage(cmsPage?.blocks);

  return (
    <>
      <SiteSection
        backgroundImage={`url('${home.hero.backgroundImage}')`}
        height="80vh"
        preserveAspectOnMobile={false}
        className="home-hero-section"
      >
        <SiteContainer className="flex h-full flex-col items-start justify-center gap-8 py-4 lg:justify-between lg:py-30">
          <h1 className="font-magistral m-0 max-w-[18ch] text-[clamp(1.125rem,5vw,3rem)] leading-[1.1] text-white">
            {home.hero.title}
          </h1>
          <HomeAskAiButton
            label={home.hero.cta.label}
            className="btn btn-primary font-magistral home-ask-ai-btn items-center gap-2 text-2xl no-underline"
            style={{ alignSelf: "flex-end", border: "none", backgroundColor: "var(--header-bg)" }}
          />
        </SiteContainer>
      </SiteSection>

      <HomeProductStrip panels={home.productStrip} />

      <SiteSection
        backgroundImage={`url('${home.section3.backgroundImage}')`}
        height="580px"
        preserveAspectOnMobile={false}
        className="min-h-[16rem] sm:min-h-[22rem]"
      >
        <SiteContainer className="flex min-h-[inherit] h-full flex-col items-end justify-end py-10 sm:py-14">
          <Link
            href={home.section3.cta.href}
            className="btn btn-primary font-magistral inline-flex text-base no-underline sm:text-xl md:text-2xl"
          >
            {home.section3.cta.label}
          </Link>
        </SiteContainer>
      </SiteSection>

      <SiteSection
        width="100%"
        height="auto"
        preserveAspectOnMobile={false}
        backgroundImage={`url('${home.section4.backgroundImage}')`}
        backgroundSize="100% 100%"
        backgroundPosition="center"
        innerClassName="flex h-full min-h-0 items-stretch py-12 md:py-16 lg:py-20"
        aria-label="Adaptive Shield Technology"
      >
        <SiteContainer className="grid h-full min-h-0 grid-cols-1 items-stretch gap-8 md:grid-cols-2 md:gap-16 lg:gap-24 xl:gap-40">
          <div className="flex justify-center md:justify-end">
            <img
              src={home.section4.strongerImage}
              alt="Stronger"
              className="h-auto w-auto max-h-[16rem] max-w-full object-contain sm:max-h-[20rem] md:max-h-none md:scale-110 lg:scale-[1.2]"
            />
          </div>
          <div className="flex min-w-0 justify-center md:justify-start">
            <div className="box-border flex h-full min-w-0 w-full max-w-[min(100%,500px)] flex-col bg-white px-[clamp(1.25rem,calc(100vw*40/1920),2.5rem)] py-[clamp(1.25rem,calc(100vw*40/1920),2.5rem)] text-neutral-900">
              <p className="m-0 text-xs font-bold tracking-[0.12em] text-primary uppercase">{home.section4.eyebrow}</p>
              <h2 className="font-magistral mt-2.5 mb-0 text-xl leading-[1.12] font-bold tracking-[0.04em] uppercase sm:text-2xl">
                <span className="block">{home.section4.titleLine1}</span>
                <span className="block">{home.section4.titleLine2}</span>
              </h2>
              <div
                className="prose prose-sm mt-4 mb-0 max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: home.section4.bodyHtml }}
              />
              <Link
                href={home.section4.cta.href}
                className="mt-6 inline-flex items-center justify-center self-start rounded-full border 
                border-primary bg-white px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-primary uppercase 
                no-underline transition-colors duration-150 hover:bg-primary hover:text-white focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-primary md:mt-auto"
              >
                {home.section4.cta.label}
              </Link>
            </div>
          </div>
        </SiteContainer>
      </SiteSection>

      <SiteSection className="w-full max-w-full" preserveAspectOnMobile={false}>
        <ApplicationAccordion categories={home.applications} />
      </SiteSection>

      <HomeSection6 imageUrl={home.section6Image} />
      <HomeSection7 imageUrl={home.section7Image} />
      <HomeSection8 imageUrl={home.section8Image} />
      <HomeHotSellingProducts title={home.hotSellingTitle} products={featuredProducts} />
      <HomeFooter footer={home.footer} />
    </>
  );
}
