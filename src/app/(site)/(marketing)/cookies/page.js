import LegalPageContent from "@/components/marketing/LegalPageContent";
import { fetchPageContent } from "@/lib/api/content";

export async function generateMetadata() {
  const cms = await fetchPageContent("cookies");
  return { title: `${cms?.name ?? "Cookie Notice"} | Black Tiger` };
}

export default async function CookiesPage() {
  const cms = await fetchPageContent("cookies");
  return (
    <LegalPageContent
      slug="cookies"
      blocks={cms?.blocks}
      fallbackTitle="Cookie Notice"
      fallbackBody="Cookie usage and consent details for analytics and session cookies will be published here."
    />
  );
}
