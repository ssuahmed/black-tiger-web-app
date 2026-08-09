import { redirect } from "next/navigation";

/** Legacy /shop URL — catalog lives on /products. */
export default function ShopPage() {
  redirect("/products");
}
