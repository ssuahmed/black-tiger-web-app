import LegalPageContent from "@/components/marketing/LegalPageContent";
import { fetchPageContent } from "@/lib/api/content";

export async function generateMetadata() {
  const cms = await fetchPageContent("disclaimer");
  return { title: `${cms?.name ?? "Disclaimer"} | Black Tiger` };
}

export default async function DisclaimerPage() {
  const cms = await fetchPageContent("disclaimer");
  return (
    <LegalPageContent
      slug="disclaimer"
      blocks={cms?.blocks}
      fallbackTitle="Disclaimer"
      fallbackBody="Legal disclaimer copy for the Black Tiger storefront will be published here."
    />
  );
}
