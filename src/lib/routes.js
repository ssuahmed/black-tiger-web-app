/** Canonical app paths — use for nav, footer, and redirects. */
export const routes = {
  home: "/",
  homeV2: "/homev2",
  /** @deprecated Catalog lives on /products — kept as alias for older call sites. */
  shop: "/products",
  productsIndex: "/products",
  productsDefault: "/products",
  product: (slug) => `/products/${encodeURIComponent(slug)}`,
  category: (categorySlug) => `/products/${encodeURIComponent(categorySlug)}`,
  about: "/about",
  contact: "/contact",
  cart: "/cart",
  cartAddress: "/cart/address",
  cartShipping: "/cart/shipping",
  cartPayment: "/cart/payment",
  cartPaymentReturn: "/cart/payment/return",
  checkout: "/checkout",
  warehouse: (slug) => `/warehouses/${encodeURIComponent(slug)}`,
  account: "/account",
  accountOrders: "/account/orders",
  accountProfile: "/account/profile",
  accountWireTransfer: "/account/wire-transfer",
  accountAddresses: "/account/addresses",
  accountBusinessThankYou: "/account/business/thankyou",
  signIn: "/sign-in",
  signUp: "/sign-in?intent=register",
  forgotPassword: "/forgot-password",
  verifyOtp: "/verify-otp",
  resetPassword: "/reset-password",
  businessRegister: "/business/register",
  disclaimer: "/disclaimer",
  privacy: "/privacy",
  cookies: "/cookies",
  terms: "/terms",
  refund: "/terms",
  shippingPolicy: "/terms",
  components: "/components",
};

/**
 * Rewrite legacy storefront paths (e.g. CMS `/shop`) to the products catalog.
 * @param {string | null | undefined} href
 * @returns {string}
 */
export function canonicalizeStorefrontHref(href) {
  if (href == null || href === "") return href ?? "";
  const raw = String(href);
  if (raw === "/shop" || raw.startsWith("/shop?")) {
    return `/products${raw.slice("/shop".length)}`;
  }
  if (raw.startsWith("/shop/")) {
    return `/products${raw.slice("/shop".length)}`;
  }
  return raw;
}
