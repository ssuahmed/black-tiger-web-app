"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/routes";

/** @param {{ className?: string }} props */
export default function HeaderAccountLink({ className = "icon-btn icon-btn--lg-only" }) {
  const { isAuthenticated, ready } = useAuth();
  const href = ready && isAuthenticated ? routes.account : routes.signIn;
  const label = ready && isAuthenticated ? "My account" : "Sign in";

  return (
    <Link href={href} className={className} aria-label={label} scroll={false}>
      <Icon name="user" className="header-icon text-white" />
    </Link>
  );
}
