"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import PageShell from "@/components/layout/PageShell";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout";
import { AccountSummaryProvider, useAccountSummary } from "@/contexts/AccountSummaryContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingCenter } from "@/components/ui";

/** @typedef {{ type: 'heading'; label: string } | { type: 'link'; href: string; label: string; badgeKey?: string }} NavPiece */

/** @type {NavPiece[]} */
const NAV_ITEMS = [
  { type: "link", href: "/account/orders", label: "Orders", badgeKey: "orders" },
  { type: "link", href: "/account/returns", label: "Returns", badgeKey: "returns" },
  { type: "link", href: "/account/credits", label: "Credits" },
  { type: "link", href: "/account/lists", label: "Lists", badgeKey: "lists" },
  { type: "heading", label: "MY ACCOUNT" },
  { type: "link", href: "/account/profile", label: "Profile" },
  { type: "link", href: "/account/addresses", label: "Addresses" },
  { type: "link", href: "/account/payments", label: "Payments" },
  { type: "heading", label: "OTHERS" },
  { type: "link", href: "/account/notifications", label: "Notifications" },
  { type: "link", href: "/account/security", label: "Security" },
];

const linkClass =
  "block rounded px-3 py-2.5 text-base text-inherit no-underline hover:bg-primary/[0.08]";
const linkActiveClass = "bg-primary/[0.12] font-semibold";

/** @param {{ children: import('react').ReactNode }} props */
function AccountShellInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { summary, loading } = useAccountSummary();

  async function onSignOut() {
    await logout();
    router.push("/sign-in");
  }

  const displayName = String(summary?.displayName ?? "Account");
  const email = String(summary?.email ?? "");
  const initials = String(
    summary?.avatar?.initials ?? (displayName.slice(0, 2).toUpperCase() || "BT"),
  );
  const completion = summary?.profileCompletion?.percent;
  const business = summary?.business;
  const navBadges = summary?.navBadges && typeof summary.navBadges === "object" ? summary.navBadges : {};

  const sidebar = (
    <div className="rounded-md border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center gap-3">
          <span className="font-magistral flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-900">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-900">{displayName}</p>
            <p className="truncate text-xs text-neutral-600">{email}</p>
            {typeof completion === "number" ? (
              <p className="mt-1 mb-0 text-xs text-neutral-500">Profile {completion}% complete</p>
            ) : null}
          </div>
        </div>
        {business ? (
          <div className="mt-4 rounded border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
            <p className="m-0 font-semibold text-neutral-900">{String(business.companyName ?? "B2B account")}</p>
            <p className="mt-1 mb-0">
              Credit limit: <strong>{String(business.creditLimit?.formatted ?? "—")}</strong>
            </p>
          </div>
        ) : null}
      </div>
      <nav className="flex flex-col p-2">
        {NAV_ITEMS.map((item) =>
          item.type === "heading" ? (
            <p key={item.label} className="px-3 pb-1 pt-3 text-xs font-bold tracking-wider text-neutral-500">
              {item.label}
            </p>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass} ${pathname === item.href ? linkActiveClass : ""}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{item.label}</span>
                {item.badgeKey && Number(navBadges[item.badgeKey]) > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {Number(navBadges[item.badgeKey])}
                  </span>
                ) : null}
              </span>
            </Link>
          ),
        )}
        <button type="button" className={`${linkClass} mt-1 text-left text-primary`} onClick={() => void onSignOut()}>
          Sign out
        </button>
      </nav>
    </div>
  );

  if (loading && !summary) {
    return <LoadingCenter className="min-h-[40vh]" />;
  }

  return (
    <PageShell variant="account">
      <TwoColumnLayout preset="account" sidebar={sidebar}>
        <section>{children}</section>
      </TwoColumnLayout>
    </PageShell>
  );
}

/** @param {{ children: import('react').ReactNode }} props */
export default function AccountShell({ children }) {
  return (
    <RequireAuth>
      <AccountSummaryProvider>
        <AccountShellInner>{children}</AccountShellInner>
      </AccountSummaryProvider>
    </RequireAuth>
  );
}
