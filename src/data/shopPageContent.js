/** Copy and structure from Figma `material/figma-exports/pages/shop/shop.jpg`.
 *  Used only when Odoo CMS blocks for /shop are unavailable. */

export const SHOP_HERO = {
  eyebrow: "TECHNOLOGY",
  title: "ADAPTIVE SHIELD TECHNOLOGY",
  body:
  "Our Adaptive Shield Technology helps break new ground in engine performance. The technology is a combination of additive chemistries that shield engine parts from internal and external factors, by creating a robust shield against the extreme pressures, temperatures and shear forces affecting a broad range of engines.",
  ctaLabel: "LEARN MORE",
  ctaHref: "/about",
  backgroundImage: "/images/shop/bg-image.png",
};

export const SHOP_BREADCRUMBS = [
  { label: "HOME", href: "/" },
  { label: "SHOP" },
];

/** Products per page — matches Commerce API `pageSize` on GET /v1/catalog/products */
export const SHOP_PAGE_SIZE = 10;

/** Category PLP page size */
export const PLP_PAGE_SIZE = 24;
