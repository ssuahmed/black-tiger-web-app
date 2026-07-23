"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";

/** Renders the global footer on all pages except the homepage (uses HomeFooter there). */
export default function SiteChromeFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <SiteFooter />;
}
