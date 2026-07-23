/**
 * Props for next/image when src may be an Odoo /web/image URL or a local static path.
 * @param {string} src
 */
export function cmsImageProps(src) {
  if (!src) return { unoptimized: true };
  if (src.startsWith("/web/image/") || src.includes("/web/image/bt.website.block/")) {
    return { unoptimized: true };
  }
  try {
    const url = new URL(src, "http://localhost");
    if (url.pathname.startsWith("/web/image/")) {
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
