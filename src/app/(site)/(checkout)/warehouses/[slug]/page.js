import WarehousePageClient from "./WarehousePageClient";

export default async function WarehousePage({ params }) {
  const { slug } = await params;
  return <WarehousePageClient slug={slug} />;
}
