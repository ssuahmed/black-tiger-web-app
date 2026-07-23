import LegalPageContent from "@/components/marketing/LegalPageContent";
import { fetchPageContent } from "@/lib/api/content";

export async function generateMetadata() {
  const cms = await fetchPageContent("terms");
  return { title: `${cms?.name ?? "General Sales Conditions"} | Black Tiger` };
}

export default async function TermsPage() {
  const cms = await fetchPageContent("terms");
  return (
    <LegalPageContent
      slug="terms"
      blocks={cms?.blocks}
      fallbackTitle="General sales conditions"
      fallbackBody="B2B/B2C terms of sale, returns, and delivery conditions will be published here."
    />
  );
}
