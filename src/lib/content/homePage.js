/**
 * Merge CMS home-page blocks with static defaults for the storefront landing page.
 * Missing or unpublished CMS fields fall back to the hardcoded marketing copy/data modules.
 */

import { HOME_APPLICATION_ACCORDIONS } from "@/data/homeApplicationCategories";
import { HOME_PRODUCT_STRIP } from "@/data/homeProductStrip";
import { HOME_SECTION_4 } from "@/data/homeSection4Content";
import { canonicalizeStorefrontHref, routes } from "@/lib/routes";
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
 * @param {import("@/components/home/HomeFooter").HomeFooterData} footer
 * @returns {import("@/components/home/HomeFooter").HomeFooterData}
 */
function canonicalizeFooter(footer) {
  if (!footer || typeof footer !== "object") return footer;
  return {
    ...footer,
    navLinks: Array.isArray(footer.navLinks)
      ? footer.navLinks.map((l) => ({
          ...l,
          href: canonicalizeStorefrontHref(l.href),
        }))
      : footer.navLinks,
    contactCta: footer.contactCta
      ? {
          ...footer.contactCta,
          href: canonicalizeStorefrontHref(footer.contactCta.href),
        }
      : footer.contactCta,
  };
}

/**
 * Resolve all homepage CMS sections from Commerce API blocks.
 * @param {Record<string, unknown> | undefined} blocks
 */
export function parseHomePage(blocks) {
  console.log({ blocks });
  const productStrip = blockJson(blocks, "product_strip.data", HOME_PRODUCT_STRIP);
  return {
    hero: {
      title: blockText(blocks, "hero.title", "The High-End Lubricants"),
      backgroundImage: blockImage(blocks, "hero.background_image", "/images/home/section-1.png"),
      cta: blockCta(blocks, "hero.cta", { label: "Ask AI", href: "#" }),
    },
    productStrip: Array.isArray(productStrip)
      ? productStrip.map((p) =>
          p && typeof p === "object"
            ? { ...p, href: canonicalizeStorefrontHref(/** @type {{ href?: string }} */ (p).href) }
            : p,
        )
      : productStrip,
    section3: {
      backgroundImage: blockImage(blocks, "section3.background_image", "/images/home/section-3.png"),
      cta: blockCta(blocks, "section3.cta", { label: "Shop Now", href: "/products" }),
    },
    section4: {
      backgroundImage: blockImage(
        blocks,
        "section4.background_image",
        HOME_SECTION_4.backgroundImage,
      ),
      strongerImage: blockImage(blocks, "section4.stronger_image", HOME_SECTION_4.strongerImage),
      imageRight: blockImage(blocks, "section4.image_right", HOME_SECTION_4.imageRight),
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
    footer: canonicalizeFooter(blockJson(blocks, "footer.data", DEFAULT_HOME_FOOTER)),
  };
}
