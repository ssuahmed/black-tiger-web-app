"use client";

import Link from "next/link";
import BusinessThankYouIllustration from "@/components/account/BusinessThankYouIllustration";
import { routes } from "@/lib/routes";

export default function BusinessThankYouClient() {
  return (
    <div className="bt-thankyou font-sf-pro">
      <section className="bt-thankyou__hero" aria-labelledby="bt-thankyou-heading">
        <div className="bt-thankyou__hero-inner site-container">
          <div className="bt-thankyou__copy">
            <h1 id="bt-thankyou-heading" className="bt-thankyou__title">
              Thank you
            </h1>
            <p className="bt-thankyou__subtitle">We are verifying your information</p>
            <p className="bt-thankyou__body">
              We&apos;ll email you to notify your verification status in 24 to 48 hours. You may also
              check your status at any time using the link below.
            </p>
            <Link href={routes.accountProfile} className="bt-thankyou__status-btn">
              Check status
            </Link>
          </div>
          <div className="bt-thankyou__art">
            <BusinessThankYouIllustration className="bt-thankyou__illustration" />
          </div>
        </div>
      </section>

      <section className="bt-thankyou__browse" aria-labelledby="bt-thankyou-browse-heading">
        <div className="bt-thankyou__browse-inner site-container">
          <h2 id="bt-thankyou-browse-heading" className="bt-thankyou__browse-title">
            Want to browse in the meantime?
          </h2>
          <p className="bt-thankyou__browse-body">
            Explore business only price and selection while you wait for the verification
          </p>
          <Link href={routes.productsDefault} className="bt-thankyou__browse-btn">
            Start Browsing
          </Link>
        </div>
      </section>
    </div>
  );
}
