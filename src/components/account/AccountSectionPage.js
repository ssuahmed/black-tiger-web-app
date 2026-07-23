import Card from "@/components/ui/Card";

/** @param {{ title: string; description: string }} props */
export default function AccountSectionPage({ title, description }) {
  return (
    <Card>
      <h2 className="font-magistral text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </Card>
  );
}
