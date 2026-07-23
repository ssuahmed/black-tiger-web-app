import { commerceFetch } from "@/lib/api/client";

const CMS_REVALIDATE = { next: { revalidate: 60 } };

/**
 * @typedef {{ slug: string; name: string; published: boolean; blocks?: Record<string, unknown> }} ContentPage
 */

/**
 * @returns {Promise<Array<{ slug: string; name: string; published: boolean }>>}
 */
export async function fetchPages() {
  try {
    const pages = await commerceFetch("content/pages", CMS_REVALIDATE);
    return Array.isArray(pages) ? pages : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} slug - Odoo page slug: home | contact | shop | about
 * @returns {Promise<ContentPage | null>}
 */
export async function fetchPageContent(slug) {
  try {
    const page = await commerceFetch(`content/pages/${encodeURIComponent(slug)}`, CMS_REVALIDATE);
    return page ?? null;
  } catch {
    return null;
  }
}
