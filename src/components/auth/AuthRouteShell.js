"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { LoadingCenter } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { safeReturnPath } from "@/lib/authRedirect";
import { routes } from "@/lib/routes";

/** @param {{ children: import('react').ReactNode }} props */
export default function AuthRouteShell({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, ready } = useAuth();

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    const returnTo = safeReturnPath(searchParams.get("returnTo"));
    router.replace(returnTo);
  }, [ready, isAuthenticated, router, searchParams]);

  if (!ready) {
    return (
      <main className="flex flex-1 flex-col">
        <LoadingCenter className="min-h-[50vh]" />
      </main>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <main className="flex flex-1 flex-col">{children}</main>;
}
