import MarketingPageShell from "@/components/layout/MarketingPageShell";
import { simplePageFromBlocks } from "@/lib/content/blocks";

/** About page — title and body from Odoo CMS via Commerce API */
export default function AboutPageContent({ blocks }) {
  const { title, bodyHtml } = simplePageFromBlocks(blocks, {
    title: "About Black Tiger",
    body: "Black Tiger manufactures high-end lubricants engineered for performance and reliability.",
  });

  return (
    <MarketingPageShell title={title}>
      {bodyHtml ? (
        <div
          className="prose prose-neutral max-w-none text-neutral-600"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : null}
    </MarketingPageShell>
  );
}
