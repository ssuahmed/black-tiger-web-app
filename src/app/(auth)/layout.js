import { Suspense } from "react";
import AuthRouteShell from "@/components/auth/AuthRouteShell";
import { LoadingCenter } from "@/components/ui";

/** Auth screens: no site header/footer; redirect when already signed in. */
/** @param {{ children: import('react').ReactNode }} props */
export default function AuthGroupLayout({ children }) {
  return (
    <Suspense fallback={<LoadingCenter className="min-h-[50vh] font-sf-pro" />}>
      <AuthRouteShell>{children}</AuthRouteShell>
    </Suspense>
  );
}
