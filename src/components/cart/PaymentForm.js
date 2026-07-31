"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContactCheckoutSection from "@/components/cart/ContactCheckoutSection";
import {
  CardMethodIcon,
  CodMethodIcon,
  WireMethodIcon,
} from "@/components/checkout/icons/CheckoutIcons";
import { Alert } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/routes";

const METHODS = [
  { id: "card", label: "Debit / Credit Card", logos: "Visa · Mastercard · Amex · Mada", Icon: CardMethodIcon },
  { id: "cod", label: "CASH On Delivery", logos: "", Icon: CodMethodIcon },
  { id: "wire", label: "Payment in Advance by Wire Transfer", logos: "", Icon: WireMethodIcon },
];

const GATEWAY = (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "sandbox").toLowerCase();
const PAYTABS = GATEWAY === "paytabs";
const CARD_ACTIVE = GATEWAY !== "placeholder";

/** @param {{ onPay?: (payload: { method: string }) => void | Promise<void>; busy?: boolean }} props */
export default function PaymentForm({ onPay, busy = false }) {
  const { user, isAuthenticated } = useAuth();
  const [method, setMethod] = useState("card");
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [billingSame, setBillingSame] = useState(true);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  async function handleSubmit(e) {
    e.preventDefault();
    await onPay?.({ method });
  }

  const submitLabel = busy
    ? method === "card" && PAYTABS
      ? "Redirecting…"
      : "Processing…"
    : method === "card" && PAYTABS
      ? "Pay securely with PayTabs"
      : "Pay now";

  return (
    <form className="co-root text-neutral-900" onSubmit={handleSubmit}>
      {!CARD_ACTIVE ? (
        <Alert variant="info" className="mb-6">
          Payment gateway integration is pending. Selecting a method and placing the order will submit your checkout to
          the commerce API without charging a card.
        </Alert>
      ) : PAYTABS ? (
        <Alert variant="info" className="mb-6">
          Card payments open the PayTabs secure hosted page. Cash on delivery and wire transfer stay on this site.
        </Alert>
      ) : null}

      <ContactCheckoutSection
        email={email}
        marketingOptIn={marketing}
        signedIn={isAuthenticated}
        onEmailChange={setEmail}
        onMarketingChange={setMarketing}
      />

      <section className="mb-6">
        <h2 className="font-magistral m-0 text-base font-bold">Payment</h2>
        <p className="m-0 mb-3 text-xs text-neutral-500">All transactions are secure and encrypted.</p>
        <ul className="m-0 list-none border border-neutral-300 p-0">
          {METHODS.map((m) => {
            const selected = method === m.id;
            const Icon = m.Icon;
            return (
              <li key={m.id} className="border-b border-neutral-300 last:border-b-0">
                <button
                  type="button"
                  className={["co-method", selected ? "co-method--selected" : ""].filter(Boolean).join(" ")}
                  onClick={() => setMethod(m.id)}
                >
                  <input type="radio" name="payMethod" checked={selected} readOnly tabIndex={-1} />
                  <Icon className="size-5 shrink-0" />
                  <span className="text-sm font-semibold">{m.label}</span>
                  {m.logos ? <span className="ml-auto text-xs text-neutral-500">{m.logos}</span> : null}
                </button>
                {selected && m.id === "card" && !PAYTABS ? (
                  <div className="space-y-3 px-4 pb-4">
                    <input
                      type="text"
                      className="co-field"
                      placeholder="Card number"
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                      disabled={!CARD_ACTIVE}
                    />
                    <div className="grid gap-3 min-[480px]:grid-cols-2">
                      <input
                        type="text"
                        className="co-field"
                        placeholder="Expiry Date (MM/YY)"
                        value={card.expiry}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
                        disabled={!CARD_ACTIVE}
                      />
                      <input
                        type="text"
                        className="co-field"
                        placeholder="Security Code"
                        value={card.cvc}
                        onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
                        disabled={!CARD_ACTIVE}
                      />
                    </div>
                    <input
                      type="text"
                      className="co-field"
                      placeholder="Name on card"
                      value={card.name}
                      onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                      disabled={!CARD_ACTIVE}
                    />
                    <label className="flex items-center gap-2 text-sm text-neutral-500">
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={(e) => setBillingSame(e.target.checked)}
                        disabled={!CARD_ACTIVE}
                      />
                      Use shipping address as billing address
                    </label>
                  </div>
                ) : null}
                {selected && m.id === "card" && PAYTABS ? (
                  <p className="m-0 px-4 pb-4 text-sm text-neutral-600">
                    You will be redirected to PayTabs to enter card details. Card numbers never touch our servers.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
        <button type="submit" className="co-cta" disabled={busy}>
          {submitLabel}
        </button>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-3 text-xs [&_a]:text-neutral-600 [&_a]:underline" aria-label="Policies">
          <Link href={routes.refund}>Refund policy</Link>
          <Link href={routes.shippingPolicy}>Shipping</Link>
          <Link href={routes.privacy}>Privacy policy</Link>
          <Link href={routes.terms}>Terms of service</Link>
        </nav>
      </section>
    </form>
  );
}
