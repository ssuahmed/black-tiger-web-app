"use client";

/**
 * Payment method selector for checkout.
 * Visibility of Apple Pay / hosted copy depends on `NEXT_PUBLIC_PAYMENT_GATEWAY`
 * (`paytabs` | `sandbox` | `placeholder`). Actual charging is handled by PaymentPageClient.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import ContactCheckoutSection from "@/components/cart/ContactCheckoutSection";
import {
  ApplePayMethodIcon,
  CardMethodIcon,
  CodMethodIcon,
  WireMethodIcon,
} from "@/components/checkout/icons/CheckoutIcons";
import { Alert } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/routes";

const METHODS = [
  { id: "card", label: "Debit / Credit Card", Icon: CardMethodIcon, showCardLogos: true },
  { id: "apple_pay", label: "Apple Pay", Icon: ApplePayMethodIcon, paytabsOnly: true, appleMark: true },
  { id: "cod", label: "CASH On Delivery", Icon: CodMethodIcon },
  { id: "wire", label: "Payment in Advance by Wire Transfer", Icon: WireMethodIcon },
];

const GATEWAY = (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "sandbox").toLowerCase();
const PAYTABS = GATEWAY === "paytabs";
const CARD_ACTIVE = GATEWAY !== "placeholder";

function isHostedPayMethod(method) {
  return method === "card" || method === "apple_pay";
}

/** @param {{ onPay?: (payload: { method: string }) => void | Promise<void>; busy?: boolean }} props */
export default function PaymentForm({ onPay, busy = false }) {
  const { user, isAuthenticated } = useAuth();
  const [method, setMethod] = useState("card");
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(true);

  const visibleMethods = METHODS.filter((m) => !m.paytabsOnly || PAYTABS);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (method === "apple_pay" && !PAYTABS) setMethod("card");
  }, [method]);

  async function handleSubmit(e) {
    e.preventDefault();
    await onPay?.({ method });
  }

  const hosted = isHostedPayMethod(method) && PAYTABS;
  const submitLabel = busy ? (hosted ? "Redirecting…" : "Processing…") : "Pay now";

  return (
    <form className="co-payment-form text-neutral-900" onSubmit={handleSubmit}>
      {!CARD_ACTIVE ? (
        <Alert variant="info" className="mb-6 hidden" hidden>
          Payment gateway integration is pending. Selecting a method and placing the order will submit your checkout to
          the commerce API without charging a card.
        </Alert>
      ) : PAYTABS ? (
        <Alert variant="info" className="mb-6 hidden" hidden>
          Card and Apple Pay open the PayTabs secure hosted page. Cash on delivery and wire transfer stay on this site.
        </Alert>
      ) : null}

      <ContactCheckoutSection
        email={email}
        marketingOptIn={marketing}
        signedIn={isAuthenticated}
        signInHref="/sign-in?returnTo=%2Fcart%2Fpayment"
        onEmailChange={setEmail}
        onMarketingChange={setMarketing}
      />

      <section className="co-payment-section">
        <h2 className="co-section-title">Payment</h2>
        <p className="co-payment-section__hint">All transactions are secure and encrypted.</p>
        <ul className="co-payment-methods">
          {visibleMethods.map((m) => {
            const selected = method === m.id;
            const Icon = m.Icon;
            return (
              <li key={m.id} className={selected ? "co-payment-methods__item is-selected" : "co-payment-methods__item"}>
                <button
                  type="button"
                  className={["co-method", selected ? "co-method--selected" : ""].filter(Boolean).join(" ")}
                  onClick={() => setMethod(m.id)}
                  aria-pressed={selected}
                >
                  <span className={selected ? "co-method__radio is-checked" : "co-method__radio"} aria-hidden />
                  {m.appleMark ? (
                    <ApplePayMethodIcon className="size-5 shrink-0" />
                  ) : m.id !== "card" ? (
                    <Icon className="size-5 shrink-0" />
                  ) : (
                    <CardMethodIcon className="size-5 shrink-0" />
                  )}
                  <span className="co-method__label">{m.label}</span>
                  {m.showCardLogos ? <CardBrandLogos /> : null}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="submit" className="co-cta co-cta--payment" disabled={busy}>
          {submitLabel}
        </button>
        <nav className="co-payment-policies" aria-label="Policies">
          <Link href={routes.refund}>Refund policy</Link>
          <Link href={routes.shippingPolicy}>Shipping</Link>
          <Link href={routes.privacy}>Privacy policy</Link>
          <Link href={routes.terms}>Terms of service</Link>
        </nav>
      </section>
    </form>
  );
}

function CardBrandLogos() {
  return (
    <span className="co-card-brands" aria-hidden>
      <span className="co-card-brands__visa">VISA</span>
      <span className="co-card-brands__mc" />
      <span className="co-card-brands__amex">AMEX</span>
      <span className="co-card-brands__mada">mada</span>
    </span>
  );
}
