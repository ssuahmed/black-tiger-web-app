"use client";

import Link from "next/link";
import Checkbox from "@/components/ui/Checkbox";

/** @param {{ email: string; marketingOptIn: boolean; onEmailChange: (value: string) => void; onMarketingChange: (checked: boolean) => void; signedIn?: boolean }} props */
export default function ContactCheckoutSection({
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingChange,
  signedIn = false,
}) {
  return (
    <section className="co-address-section">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="m-0 text-base font-bold text-neutral-900">Contact</h2>
        {!signedIn ? (
          <Link href="/sign-in?returnTo=%2Fcart%2Faddress" className="text-sm text-[#0b63ce] no-underline hover:underline">
            Sign in
          </Link>
        ) : null}
      </div>
      <input
        type="text"
        className="co-field"
        placeholder="Email or mobile phone number"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        autoComplete="email"
      />
      <div className="mt-2">
        <Checkbox
          checked={marketingOptIn}
          label="Email me with news and offers"
          onChange={(e) => onMarketingChange(e.target.checked)}
        />
      </div>
    </section>
  );
}
