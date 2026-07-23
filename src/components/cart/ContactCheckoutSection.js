"use client";

import Link from "next/link";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";

/** @param {{ email: string; marketingOptIn: boolean; onEmailChange: (value: string) => void; onMarketingChange: (checked: boolean) => void; signedIn?: boolean }} props */
export default function ContactCheckoutSection({
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingChange,
  signedIn = false,
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-magistral m-0 text-base font-bold">Contact</h2>
        {!signedIn ? (
          <Link href="/sign-in?returnTo=%2Fcart%2Faddress" className="text-sm text-primary underline">
            Sign in
          </Link>
        ) : null}
      </div>
      <Input
        type="text"
        placeholder="Email or mobile phone number"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
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
