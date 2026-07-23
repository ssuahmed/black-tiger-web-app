"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingCenter } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/routes";

/** Redirects unauthenticated visitors to sign-in with a return URL. */
/** @param {{ children: import('react').ReactNode }} props */
export default function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, ready } = useAuth();

  useEffect(() => {
    if (!ready || isAuthenticated) return;
    const returnTo = encodeURIComponent(pathname || routes.account);
    router.replace(`${routes.signIn}?returnTo=${returnTo}`);
  }, [ready, isAuthenticated, router, pathname]);

  if (!ready) {
    return <LoadingCenter className="min-h-[40vh]" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
