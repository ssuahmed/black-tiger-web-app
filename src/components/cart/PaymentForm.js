"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContactCheckoutSection from "@/components/cart/ContactCheckoutSection";
import { Alert } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/routes";

const METHODS = [
  { id: "card", label: "Debit / Credit Card", logos: "Visa · Mastercard · Amex · Mada" },
  { id: "cod", label: "Cash on delivery" },
  { id: "wire", label: "Payment in advance by wire transfer" },
];

const inputClass =
  "box-border w-full min-h-10 py-2 px-3 text-sm text-neutral-900 bg-white border border-neutral-300";

const GATEWAY = (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "sandbox").toLowerCase();
const PAYTABS = GATEWAY === "paytabs";
const CARD_ACTIVE = GATEWAY !== "placeholder";

/** @param {{ onPay?: (payload: { method: string }) => void | Promise<void>; busy?: boolean }} props */
export default function PaymentForm({ onPay, busy = false }) {
  const { user, isAuthenticated } = useAuth();
  const [method, setMethod] = useState("cod");
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
      : "Placing order…"
    : method === "card" && PAYTABS
      ? "Pay securely with PayTabs"
      : "Place order";

  return (
    <form className="text-neutral-900" onSubmit={handleSubmit}>
      {!CARD_ACTIVE ? (
        <Alert variant="info" className="mb-6">
          Payment gateway integration is pending. Selecting a method and placing the order will submit your checkout to
          the commerce API without charging a card.
        </Alert>
      ) : PAYTABS ? (
        <Alert variant="info" className="mb-6">
          Card payments open the PayTabs secure hosted page. Cash on delivery and wire transfer stay on this site.
        </Alert>
      ) : (
        <Alert variant="info" className="mb-6">
          Sandbox payment mode is active. Card payments use a test flow — no real charges are made.
        </Alert>
      )}

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
        <ul className="m-0 p-0 list-none border border-neutral-300">
          {METHODS.map((m) => {
            const selected = method === m.id;
            const cardEnabled = CARD_ACTIVE && m.id === "card";
            return (
              <li key={m.id} className="border-b border-neutral-300 last:border-b-0">
                <button
                  type="button"
                  className="flex items-center gap-2 w-full py-3.5 px-4 text-sm font-semibold text-left bg-neutral-50 border-0 cursor-pointer"
                  onClick={() => setMethod(m.id)}
                >
                  <input type="radio" name="payMethod" checked={selected} readOnly tabIndex={-1} />
                  {m.label}
                  {m.logos ? <span className="ml-auto text-xs text-neutral-500">{m.logos}</span> : null}
                </button>
                {selected && m.id === "card" && !PAYTABS ? (
                  <div className="px-4 pb-4">
                    <input
                      type="text"
                      className={`${inputClass} mb-3`}
                      placeholder="Card number"
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                      disabled={!cardEnabled}
                    />
                    <div className="grid gap-3 mb-3 min-[480px]:grid-cols-2">
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Expiry Date (MM/YY)"
                        value={card.expiry}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
                        disabled={!cardEnabled}
                      />
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Security Code"
                        value={card.cvc}
                        onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
                        disabled={!cardEnabled}
                      />
                    </div>
                    <input
                      type="text"
                      className={`${inputClass} mb-3`}
                      placeholder="Name on card"
                      value={card.name}
                      onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                      disabled={!cardEnabled}
                    />
                    <label className="flex items-center gap-2 text-sm text-neutral-500">
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={(e) => setBillingSame(e.target.checked)}
                        disabled={!cardEnabled}
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
        <button
          type="submit"
          className="block w-full min-h-12 mt-4 py-3 px-6 text-base font-semibold text-white bg-neutral-900 border-0 cursor-pointer hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={busy}
        >
          {submitLabel}
        </button>
        <nav className="flex flex-wrap gap-x-4 gap-y-3 mt-4 text-xs [&_a]:text-neutral-600 [&_a]:underline" aria-label="Policies">
          <Link href={routes.terms}>Terms of service</Link>
          <Link href={routes.privacy}>Privacy policy</Link>
          <Link href={routes.disclaimer}>Disclaimer</Link>
        </nav>
      </section>
    </form>
  );
}
