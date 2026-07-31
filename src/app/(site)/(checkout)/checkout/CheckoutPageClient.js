"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingCenter } from "@/components/ui";
import { routes } from "@/lib/routes";

/** Legacy `/checkout` wizard — redirect to canonical cart checkout. */
export default function CheckoutPageClient() {
  const router = useRouter();
  useEffect(() => {
    router.replace(routes.cart);
  }, [router]);
  return <LoadingCenter />;
}
