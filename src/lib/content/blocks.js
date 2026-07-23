/**
 * Resolve CMS blocks from Commerce API / Odoo `bt.website.page`.
 * @param {Record<string, { text?: string | null; html?: string | null; imageUrl?: string | null; link?: { label?: string | null; href?: string | null } | null }> | undefined} blocks
 * @param {string} key
 * @param {string} [fallback]
 */
export function blockText(blocks, key, fallback = "") {
  const b = blocks?.[key];
  if (!b) return fallback;
  return b.text ?? fallback;
}

export function blockHtml(blocks, key, fallback = "") {
  const b = blocks?.[key];
  if (!b) return fallback;
  return b.html ?? b.text ?? fallback;
}

export function blockImage(blocks, key, fallback = "") {
  const b = blocks?.[key];
  if (!b?.imageUrl) return fallback;
  return b.imageUrl;
}

export function blockCta(blocks, key, fallback = { label: "", href: "#" }) {
  const b = blocks?.[key];
  if (!b?.link) return fallback;
  return {
    label: b.link.label ?? fallback.label,
    href: b.link.href ?? fallback.href,
  };
}

/**
 * Parse a JSON CMS block (product strip, accordion, footer, …).
 * @template T
 * @param {Record<string, { json?: unknown; text?: string | null }> | undefined} blocks
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function blockJson(blocks, key, fallback) {
  const b = blocks?.[key];
  if (!b) return fallback;
  const raw = b.json ?? b.text;
  if (raw == null || raw === "") return fallback;
  if (typeof raw === "object") return /** @type {T} */ (raw);
  if (typeof raw === "string") {
    try {
      return /** @type {T} */ (JSON.parse(raw));
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Map CMS hero.* blocks to CategoryHero props.
 * @param {Record<string, unknown> | undefined} blocks
 * @param {{ eyebrow?: string; title?: string; body?: string; ctaLabel?: string; ctaHref?: string; backgroundImage?: string }} [defaults]
 */
export function heroFromBlocks(blocks, defaults = {}) {
  const bodyHtml = blockHtml(blocks, "hero.body", "");
  const bodyText = blockText(blocks, "hero.body", defaults.body ?? "");
  const cta = blockCta(blocks, "hero.cta", {
    label: defaults.ctaLabel ?? "Learn more",
    href: defaults.ctaHref ?? "#",
  });

  return {
    eyebrow: blockText(blocks, "hero.eyebrow", defaults.eyebrow ?? ""),
    title: blockText(blocks, "hero.title", defaults.title ?? ""),
    body: bodyText || stripHtml(bodyHtml) || defaults.body || "",
    bodyHtml: bodyHtml || (defaults.body ? `<p>${defaults.body}</p>` : ""),
    ctaLabel: cta.label,
    ctaHref: cta.href,
    backgroundImage: blockImage(blocks, "hero.background_image", defaults.backgroundImage ?? ""),
  };
}

/**
 * Simple marketing page (about, legal, etc.) from page.* blocks.
 * @param {Record<string, unknown> | undefined} blocks
 * @param {{ title?: string; body?: string }} [defaults]
 */
export function simplePageFromBlocks(blocks, defaults = {}) {
  const bodyHtml = blockHtml(blocks, "page.body", defaults.body ? `<p>${defaults.body}</p>` : "");
  return {
    title: blockText(blocks, "page.title", defaults.title ?? ""),
    bodyHtml,
  };
}

/** @param {string} html */
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
