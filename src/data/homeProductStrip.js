import { routes } from "@/lib/routes";

/** Homepage section 2 — four product columns (Figma `secrion-2`) */
export const HOME_PRODUCT_STRIP = [
  {
    id: "tiger-x",
    title: "Tiger X",
    href: routes.product("tiger-x-5w30-sn"),
    variant: "product",
    smoke: "/images/home/section-2/smoke-red.png",
    productImage: "/images/home/section-2/tiger-x.png",
    productAlt: "TIGER X 15W40 CI-4/SL motor oil",
  },
  {
    id: "tiger-plus",
    title: "Tiger Plus",
    href: routes.product("tiger-x-5w30-sn"),
    variant: "product",
    smoke: "/images/home/section-2/smoke-blue.png",
    productImage: "/images/home/section-2/tiger-plus.png",
    productAlt: "TIGER Plus 15W40 CI-4 motor oil",
  },
  {
    id: "tiger",
    title: "Tiger",
    href: routes.product("tiger-20w50-sl"),
    variant: "product",
    smoke: "/images/home/section-2/smoke-red.png",
    productImage: "/images/home/section-2/tiger.png",
    productAlt: "TIGER 20W50 CI-4/SL motor oil",
  },
  {
    id: "quality",
    title: "Quality Is First",
    href: routes.about,
    variant: "quality",
    background: "/images/home/section-2/quality-bg.png",
    productImage: "/images/home/section-2/quality-packaging.png",
    productAlt: "Black Tiger product packaging",
    showReadMore: false,
  },
];
