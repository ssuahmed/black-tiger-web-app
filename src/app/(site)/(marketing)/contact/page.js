import ContactPageContent from "@/components/contact/ContactPageContent";
import { fetchPageContent } from "@/lib/api/content";

export async function generateMetadata() {
  const cms = await fetchPageContent("contact");
  const title = cms?.name ?? "Contact Us";
  return {
    title: `${title} | Black Tiger`,
    description: "Get in touch with Black Tiger — lubricants, distribution, and technical support.",
  };
}

export default async function ContactPage() {
  const cms = await fetchPageContent("contact");
  return <ContactPageContent blocks={cms?.blocks} />;
}
