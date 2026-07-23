import MarketingPageShell from "@/components/layout/MarketingPageShell";
import { simplePageFromBlocks } from "@/lib/content/blocks";

/**
 * Legal / policy pages — CMS body with static intl placeholder.
 * @param {{ slug: string; fallbackTitle: string; fallbackBody: string; blocks?: Record<string, unknown> }} props
 */
export default function LegalPageContent({ slug, fallbackTitle, fallbackBody, blocks }) {
  const { title, bodyHtml } = simplePageFromBlocks(blocks, {
    title: fallbackTitle,
    body: fallbackBody,
  });

  return (
    <MarketingPageShell title={title}>
      {bodyHtml ? (
        <div
          className="prose prose-neutral max-w-none text-neutral-600"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : (
        <p>{fallbackBody}</p>
      )}
    </MarketingPageShell>
  );
}
