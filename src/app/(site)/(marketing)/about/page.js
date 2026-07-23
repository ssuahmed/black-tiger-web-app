import AboutPageContent from "@/components/marketing/AboutPageContent";
import { fetchPageContent } from "@/lib/api/content";

export async function generateMetadata() {
  const cms = await fetchPageContent("about");
  const title = cms?.name ?? "About Us";
  return {
    title: `${title} | Black Tiger`,
    description: "Learn about Black Tiger Lubricants — brand story, technology, and distribution.",
  };
}

export default async function AboutPage() {
  const cms = await fetchPageContent("about");
  return <AboutPageContent blocks={cms?.blocks} />;
}
