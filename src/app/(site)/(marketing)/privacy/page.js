import LegalPageContent from "@/components/marketing/LegalPageContent";
import { fetchPageContent } from "@/lib/api/content";

export async function generateMetadata() {
  const cms = await fetchPageContent("privacy");
  return { title: `${cms?.name ?? "Privacy Notice"} | Black Tiger` };
}

export default async function PrivacyPage() {
  const cms = await fetchPageContent("privacy");
  return (
    <LegalPageContent
      slug="privacy"
      blocks={cms?.blocks}
      fallbackTitle="Privacy Notice"
      fallbackBody="Privacy policy aligned with KSA PDPL and commerce data practices will be published here."
    />
  );
}
