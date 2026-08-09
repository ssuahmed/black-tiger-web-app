"use client";

import Link from "next/link";
import Checkbox from "@/components/ui/Checkbox";

/** @param {{ email: string; marketingOptIn: boolean; onEmailChange: (value: string) => void; onMarketingChange: (checked: boolean) => void; signedIn?: boolean; signInHref?: string }} props */
export default function ContactCheckoutSection({
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingChange,
  signedIn = false,
  signInHref = "/sign-in?returnTo=%2Fcart%2Faddress",
}) {
  return (
    <section className="co-address-section co-contact-section">
      <div className="co-contact-section__head">
        <h2 className="co-section-title">Contact</h2>
        {!signedIn ? (
          <Link href={signInHref} className="co-contact-section__signin">
            Sign in
          </Link>
        ) : null}
      </div>
      <input
        type="text"
        className="co-field co-field--rounded"
        placeholder="Email or mobile phone number"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        autoComplete="email"
      />
      <div className="co-contact-section__optin">
        <Checkbox
          checked={marketingOptIn}
          label="Email me with news and offers"
          onChange={(e) => onMarketingChange(e.target.checked)}
        />
      </div>
    </section>
  );
}
