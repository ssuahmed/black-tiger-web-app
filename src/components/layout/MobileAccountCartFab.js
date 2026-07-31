"use client";

import Link from "next/link";
import { OPEN_ASK_AI_EVENT } from "@/components/chat/askAiEvents";
import CartIconLink from "@/components/layout/CartIconLink";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/routes";

export default function MobileAccountCartFab() {
  const { isAuthenticated, ready } = useAuth();
  const accountHref = ready && isAuthenticated ? routes.account : routes.signIn;
  const accountLabel = ready && isAuthenticated ? "My account" : "Sign in";

  function openAskAi() {
    window.location.hash = "ask-ai";
    window.dispatchEvent(new Event(OPEN_ASK_AI_EVENT));
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      role="presentation"
    >
      <div
        className="pointer-events-auto flex items-center gap-0.5 rounded-2xl border border-neutral-200 bg-white/90 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-neutral-100 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/80"
        role="toolbar"
        aria-label="Ask AI, account and cart"
      >
        <Link href={accountHref} className="fab-icon-btn" aria-label={accountLabel} scroll={false}>
          <Icon name="user" className="fab-icon text-neutral-900" />
        </Link>
        <span className="mx-1 h-9 w-px shrink-0 bg-neutral-200" aria-hidden />
        <button
          type="button"
          className="fab-icon-btn gap-1.5 px-2 text-xs font-bold tracking-wide text-primary uppercase"
          aria-label="Ask AI"
          onClick={openAskAi}
        >
          <Icon name="chat" className="h-5 w-5" />
          <span>Ask AI</span>
        </button>
        <span className="mx-1 h-9 w-px shrink-0 bg-neutral-200" aria-hidden />
        <CartIconLink
          className="fab-icon-btn"
          iconClassName="fab-icon text-neutral-900"
          badgeClassName="cart-icon-badge cart-icon-badge--fab"
        />
      </div>
    </div>
  );
}
