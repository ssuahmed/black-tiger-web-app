import { notFound } from "next/navigation";
import WarehousePageClient from "./WarehousePageClient";
import { getWarehouseBySlug } from "@/data/warehouses";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const warehouse = getWarehouseBySlug(slug);
  if (!warehouse) return { title: "Warehouse | Black Tiger" };
  return {
    title: `${warehouse.name} | Black Tiger`,
    description: warehouse.formattedAddress,
  };
}

export default async function WarehousePage({ params }) {
  const { slug } = await params;
  if (!getWarehouseBySlug(slug)) notFound();
  return <WarehousePageClient slug={slug} />;
}
