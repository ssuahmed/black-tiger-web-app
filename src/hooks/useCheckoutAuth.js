"use client";

/**
 * Gate checkout steps behind an authenticated session.
 * Guests are redirected to sign-in with `intent=login` and a `returnTo` path.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/** @param {string} returnTo */
export function useCheckoutAuth(returnTo) {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      const q = new URLSearchParams({ intent: "login", returnTo });
      router.replace(`/sign-in?${q.toString()}`);
    }
  }, [ready, isAuthenticated, returnTo, router]);

  return { isAuthenticated, ready, canRender: ready && isAuthenticated };
}
