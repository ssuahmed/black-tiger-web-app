"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import {
  AddressesIcon,
  CreditsIcon,
  ListsIcon,
  NotificationsIcon,
  OrdersIcon,
  PaymentsIcon,
  ProfileIcon,
  ReturnsIcon,
  SecurityIcon,
  SignOutIcon,
  WireTransferIcon,
} from "@/components/account/AccountNavIcons";
import PageShell from "@/components/layout/PageShell";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout";
import { AccountSummaryProvider, useAccountSummary } from "@/contexts/AccountSummaryContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingCenter, Money } from "@/components/ui";

/** @typedef {{ href: string; label: string; icon: import('react').ComponentType<{ className?: string }>; badgeKey?: string }} NavLink */

/** @type {NavLink[]} */
const PRIMARY_LINKS = [
  { href: "/account/orders", label: "Orders", icon: OrdersIcon, badgeKey: "orders" },
  {
    href: "/account/wire-transfer",
    label: "Link Wire Transfer to orders",
    icon: WireTransferIcon,
  },
  { href: "/account/returns", label: "Returns", icon: ReturnsIcon, badgeKey: "returns" },
  { href: "/account/credits", label: "Credits", icon: CreditsIcon },
  { href: "/account/lists", label: "Lists", icon: ListsIcon, badgeKey: "lists" },
];

/** @type {NavLink[]} */
const ACCOUNT_LINKS = [
  { href: "/account/profile", label: "Profile", icon: ProfileIcon },
  { href: "/account/addresses", label: "Addresses", icon: AddressesIcon },
  { href: "/account/payments", label: "Payments", icon: PaymentsIcon },
];

/** @type {NavLink[]} */
const OTHER_LINKS = [
  { href: "/account/notifications", label: "Notifications", icon: NotificationsIcon },
  { href: "/account/security", label: "Security Settings", icon: SecurityIcon },
];

/**
 * @param {{
 *   item: NavLink;
 *   pathname: string;
 *   navBadges: Record<string, unknown>;
 * }} props
 */
function NavItem({ item, pathname, navBadges }) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const badge = item.badgeKey ? Number(navBadges[item.badgeKey]) : 0;

  return (
    <Link href={item.href} className={`acc-nav-link${active ? " is-active" : ""}`}>
      <Icon className="acc-nav-link__icon" />
      <span className="acc-nav-link__label">{item.label}</span>
      {badge > 0 ? <span className="acc-nav-link__badge">{badge}</span> : null}
    </Link>
  );
}

/**
 * @param {{
 *   pathname: string;
 *   navBadges: Record<string, unknown>;
 *   onSignOut: () => void;
 * }} props
 */
function AccountNavGroups({ pathname, navBadges, onSignOut }) {
  return (
    <>
      <div className="acc-card acc-card--nav flex flex-col bg-white">
        {PRIMARY_LINKS.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} navBadges={navBadges} />
        ))}
      </div>

      <p className="acc-section-label">My Account</p>
      <div className="acc-card acc-card--nav flex flex-col bg-white">
        {ACCOUNT_LINKS.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} navBadges={navBadges} />
        ))}
      </div>

      <p className="acc-section-label">Others</p>
      <div className="acc-card acc-card--nav flex flex-col bg-white">
        {OTHER_LINKS.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} navBadges={navBadges} />
        ))}
      </div>

      <div className="acc-card acc-card--nav flex flex-col bg-white">
        <button type="button" className="acc-nav-link acc-nav-link--signout" onClick={onSignOut}>
          <SignOutIcon className="acc-nav-link__icon" />
          <span className="acc-nav-link__label">Sign Out</span>
        </button>
      </div>
    </>
  );
}

/** @param {{ children: import('react').ReactNode }} props */
function AccountShellInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { summary, loading } = useAccountSummary();
  const isBusinessThankYou = pathname === "/account/business/thankyou";

  async function onSignOut() {
    await logout();
    router.push("/sign-in");
  }

  if (isBusinessThankYou) {
    return children;
  }

  const displayName = String(summary?.displayName ?? "Account");
  const email = String(summary?.email ?? "");
  const initials = String(
    summary?.avatar?.initials ?? (displayName.slice(0, 2).toUpperCase() || "BT"),
  );
  const completion = typeof summary?.profileCompletion?.percent === "number"
    ? Number(summary.profileCompletion.percent)
    : null;
  const business = summary?.business;
  const navBadges = summary?.navBadges && typeof summary.navBadges === "object" ? summary.navBadges : {};

  const sidebar = (
    <div className="acc-sidebar flex w-full max-w-[17.5rem] flex-col gap-3">
      <div className="acc-card acc-card--profile bg-white">
        <div className="acc-profile">
          <span className="acc-profile__avatar" aria-hidden>
            {initials}
          </span>
          <div className="acc-profile__meta">
            <p className="acc-profile__name">{displayName}!</p>
            <p className="acc-profile__email">{email}</p>
          </div>
        </div>

        {completion != null ? (
          <div className="acc-completion">
            <div className="acc-completion__row">
              <span className="acc-completion__label">Profile Completion</span>
              <span className="acc-completion__badge">{completion}%</span>
            </div>
            <div
              className="acc-completion__track"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            >
              <span className="acc-completion__fill" style={{ width: `${Math.max(0, Math.min(100, completion))}%` }} />
            </div>
          </div>
        ) : null}

        {business ? (
          <div className="acc-business">
            <p className="acc-business__name">{String(business.companyName ?? "B2B account")}</p>
            <p className="acc-business__credit">
              Credit limit:{" "}
              <strong>
                {business.creditLimit?.formatted ? (
                  <Money value={String(business.creditLimit.formatted)} />
                ) : (
                  "—"
                )}
              </strong>
            </p>
          </div>
        ) : null}
      </div>

      <details className="acc-sidebar__mobile group lg:hidden">
        <summary className="acc-sidebar__mobile-summary">
          <span>Account menu</span>
          <span className="acc-sidebar__mobile-chevron" aria-hidden>
            ▾
          </span>
        </summary>
        <div className="acc-sidebar__stack mt-2 flex flex-col gap-3">
          <AccountNavGroups pathname={pathname} navBadges={navBadges} onSignOut={() => void onSignOut()} />
        </div>
      </details>

      <div className="acc-sidebar__stack hidden w-full flex-col gap-3 lg:flex">
        <AccountNavGroups pathname={pathname} navBadges={navBadges} onSignOut={() => void onSignOut()} />
      </div>
    </div>
  );

  if (loading && !summary) {
    return <LoadingCenter className="min-h-[40vh] font-sf-pro" />;
  }

  return (
    <PageShell variant="account" className="font-sf-pro">
      <TwoColumnLayout preset="account" stickySidebar sidebar={sidebar}>
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
