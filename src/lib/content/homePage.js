import { HOME_APPLICATION_ACCORDIONS } from "@/data/homeApplicationCategories";
import { HOME_PRODUCT_STRIP } from "@/data/homeProductStrip";
import { HOME_SECTION_4 } from "@/data/homeSection4Content";
import { routes } from "@/lib/routes";
import { blockCta, blockHtml, blockImage, blockJson, blockText } from "@/lib/content/blocks";

/** @type {import("@/components/home/HomeFooter").HomeFooterData} */
export const DEFAULT_HOME_FOOTER = {
  navLinks: [
    { label: "TIGER X", href: routes.product("tiger-x-5w30-sn") },
    { label: "TIGER PLUS", href: routes.product("tiger-x-5w30-sn") },
    { label: "TIGER", href: routes.product("tiger-20w50-sl") },
    { label: "DISCLAIMER", href: routes.disclaimer },
  ],
  contactHeading: "ANY QUESTION",
  contactCta: { label: "CONTACT US", href: routes.contact },
  socialHeading: "STAY TUNED",
  socialLinks: [
    { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
    { label: "X", href: "https://x.com/", icon: "x" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
    { label: "Vimeo", href: "https://vimeo.com/", icon: "vimeo" },
  ],
  logoUrl: "/logo.png",
  logoAlt: "Black Tiger",
};

/**
 * Resolve all homepage CMS sections from Commerce API blocks.
 * @param {Record<string, unknown> | undefined} blocks
 */
export function parseHomePage(blocks) {
  return {
    hero: {
      title: blockText(blocks, "hero.title", "The High-End Lubricants"),
      backgroundImage: blockImage(blocks, "hero.background_image", "/images/home/section-1.png"),
      cta: blockCta(blocks, "hero.cta", { label: "Ask AI", href: "#" }),
    },
    productStrip: blockJson(blocks, "product_strip.data", HOME_PRODUCT_STRIP),
    section3: {
      backgroundImage: blockImage(blocks, "section3.background_image", "/images/home/section-3.png"),
      cta: blockCta(blocks, "section3.cta", { label: "Shop Now", href: "/shop" }),
    },
    section4: {
      backgroundImage: blockImage(
        blocks,
        "section4.background_image",
        "/images/home/section-4/background.png",
      ),
      strongerImage: blockImage(
        blocks,
        "section4.stronger_image",
        "/images/home/section-4/stronger.png",
      ),
      eyebrow: blockText(blocks, "section4.eyebrow", HOME_SECTION_4.eyebrow),
      titleLine1: blockText(blocks, "section4.title_line1", HOME_SECTION_4.titleLine1),
      titleLine2: blockText(blocks, "section4.title_line2", HOME_SECTION_4.titleLine2),
      bodyHtml: blockHtml(blocks, "section4.body", `<p>${HOME_SECTION_4.body}</p>`),
      cta: blockCta(blocks, "section4.cta", {
        label: HOME_SECTION_4.ctaLabel,
        href: HOME_SECTION_4.ctaHref,
      }),
    },
    applications: blockJson(blocks, "applications.data", HOME_APPLICATION_ACCORDIONS),
    section6Image: blockImage(blocks, "section6.image", "/images/home/section-6.png"),
    section7Image: blockImage(blocks, "section7.image", "/images/home/section-7.png"),
    section8Image: blockImage(blocks, "section8.image", "/images/home/section-8.png"),
    hotSellingTitle: blockText(blocks, "hot_selling.title", "Hot Selling Products"),
    footer: blockJson(blocks, "footer.data", DEFAULT_HOME_FOOTER),
  };
}
