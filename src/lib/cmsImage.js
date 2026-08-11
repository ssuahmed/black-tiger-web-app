/**
 * next/image helpers for CMS / Odoo media URLs.
 * Remote Odoo and Commerce media proxies are marked `unoptimized` because they often lack
 * stable cacheable dimensions or conflict with the image optimizer.
 */

/**
 * Props for next/image when src may be an Odoo /web/image URL, Commerce API media proxy, or a local static path.
 * @param {string} src
 */
export function cmsImageProps(src) {
  if (!src) return { unoptimized: true };
  if (
    src.startsWith("/web/image/") ||
    src.includes("/web/image/") ||
    src.includes("/web/content/") ||
    src.includes("/v1/media/odoo")
  ) {
    return { unoptimized: true };
  }
  try {
    const url = new URL(src, "http://localhost");
    if (
      url.pathname.startsWith("/web/image/") ||
      url.pathname.startsWith("/web/content/") ||
      url.pathname.includes("/media/odoo")
    ) {
      return { unoptimized: true };
    }
  } catch {
    /* relative path */
  }
  return {};
}

/** @param {string} src */
export function isRemoteCmsImage(src) {
  return Boolean(cmsImageProps(src).unoptimized);
}
