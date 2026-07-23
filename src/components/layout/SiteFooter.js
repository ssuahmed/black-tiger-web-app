import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

const linkClass = "site-footer__link";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/", icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/", icon: InstagramIcon },
  { label: "YouTube", href: "https://www.youtube.com/", icon: YouTubeIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: LinkedInIcon },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer__inner">
        <div className="site-footer__columns">
          <div className="site-footer__col">
            <h2 className="site-footer__heading font-magistral">PRODUCTS</h2>
            <ul className="site-footer__list">
              <li>
                <Link className={linkClass} href={routes.contact}>
                  Become a distributor
                </Link>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__heading site-footer__heading--sentence font-magistral">About us</h2>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__heading font-magistral">SEGMENTS</h2>
            <ul className="site-footer__list">
              <li>
                <Link className={linkClass} href={routes.category("passenger-cars")}>
                  Passenger cars
                </Link>
              </li>
              <li>
                <Link className={linkClass} href={routes.category("motorcycle-atv")}>
                  Motorcycle
                </Link>
              </li>
              <li>
                <Link className={linkClass} href={routes.category("commercial")}>
                  Heavy-Duty
                </Link>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__heading site-footer__heading--italic font-magistral">CONTACT US</h2>
            <ul className="site-footer__list site-footer__list--contact">
              <li>
                <a className={linkClass} href="mailto:info@blacktiger.com.sa">
                  info@blacktiger.com.sa
                </a>
              </li>
              <li>
                <a className={linkClass} href="tel:+966555496568">
                  + 966 555 496568
                </a>
              </li>
              <li className="site-footer__address">
                3462 Old Al-Kharj Road, Hyt Unit, RNHA 3463 Riyadh 14371-6749 Kingdom of Saudi Arabia.
              </li>
            </ul>
          </div>

          <div className="site-footer__col site-footer__col--follow">
            <h2 className="site-footer__heading site-footer__heading--italic font-magistral">FOLLOW US</h2>
            <ul className="site-footer__social">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    className="site-footer__social-link"
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={label}
                  >
                    <Icon className="site-footer__social-icon" />
                  </a>
                </li>
              ))}
            </ul>
            <Link href={routes.home} className="site-footer__logo" aria-label="Black Tiger home">
              <Image src="/logo.png" alt="Black Tiger" width={200} height={48} className="site-footer__logo-img" />
            </Link>
          </div>
        </div>

        <nav className="site-footer__bottom" aria-label="Legal links">
          <span className="site-footer__legal-item">Black Tiger ©2025</span>
          <span className="site-footer__legal-sep" aria-hidden>
            |
          </span>
          <span className="site-footer__legal-item">All rights reserved</span>
          <span className="site-footer__legal-sep" aria-hidden>
            |
          </span>
          <Link className={`${linkClass} site-footer__legal-item`} href={routes.disclaimer}>
            Disclaimer
          </Link>
          <span className="site-footer__legal-sep" aria-hidden>
            |
          </span>
          <Link className={`${linkClass} site-footer__legal-item`} href={routes.privacy}>
            Privacy Notice
          </Link>
          <span className="site-footer__legal-sep" aria-hidden>
            |
          </span>
          <Link className={`${linkClass} site-footer__legal-item`} href={routes.cookies}>
            Cookies Notice
          </Link>
          <span className="site-footer__legal-sep" aria-hidden>
            |
          </span>
          <Link className={`${linkClass} site-footer__legal-item`} href={routes.terms}>
            General sales conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.5h2.5V5H14c-2.2 0-3.5 1.35-3.5 3.65V11H8v3.5h2.5V21h3.5v-6.5H17V11h-3V9.1c0-1 .35-1.6 1.5-1.6Z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5Zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5ZM17.25 6.75a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function YouTubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9C2 9 2 12 2 12s0 3 .4 4.8a2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9c.4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

function LinkedInIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.5 9H3.4v12h3.1V9Zm-.05-3.6c-1 0-1.75.75-1.75 1.7 0 .9.7 1.65 1.75 1.65h.02c1.02 0 1.75-.75 1.75-1.65 0-.95-.73-1.7-1.77-1.7ZM10.2 9H7.1v12h3.1v-6.4c0-1.7.35-3.35 2.45-3.35 2.1 0 2.1 2 2.1 3.55V21h3.1V14.2c0-3.15-.7-5.55-4.35-5.55-1.75 0-2.9.95-3.4 1.85h-.05V9Z" />
    </svg>
  );
}
