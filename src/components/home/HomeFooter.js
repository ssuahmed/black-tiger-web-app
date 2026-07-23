import Image from "next/image";
import Link from "next/link";
import SiteContainer from "@/components/layout/SiteContainer";
import { DEFAULT_HOME_FOOTER } from "@/lib/content/homePage";
import { cmsImageProps } from "@/lib/cmsImage";
import { routes } from "@/lib/routes";

/**
 * @typedef {{ label: string; href: string }} FooterNavLink
 * @typedef {{ label: string; href: string; icon?: string }} FooterSocialLink
 * @typedef {{
 *   navLinks: FooterNavLink[];
 *   contactHeading: string;
 *   contactCta: { label: string; href: string };
 *   socialHeading: string;
 *   socialLinks: FooterSocialLink[];
 *   logoUrl: string;
 *   logoAlt: string;
 * }} HomeFooterData
 */

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  x: XIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  vimeo: VimeoIcon,
};

const linkClass =
  "text-[0.8125rem] font-normal tracking-[0.14em] text-[#808080] uppercase no-underline transition-colors duration-150 hover:text-neutral-600";

const headingClass =
  "m-0 text-[0.8125rem] font-normal tracking-[0.14em] text-[#808080] uppercase";

/** Homepage footer — Figma three-column layout (nav | contact | social + logo) */
/** @param {{ footer?: HomeFooterData }} props */
export default function HomeFooter({ footer = DEFAULT_HOME_FOOTER }) {
  const {
    navLinks = [],
    contactHeading,
    contactCta,
    socialHeading,
    socialLinks = [],
    logoUrl,
    logoAlt,
  } = footer;

  return (
    <footer className="mt-auto w-full bg-[#f2f2f2]" aria-label="Site footer">
      <SiteContainer className="py-[clamp(3rem,5.5vw,4.75rem)]">
        <div className="flex flex-col md:flex-row md:items-stretch">
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-2 md:px-8 lg:px-12">
            <nav aria-label="Product links">
              <ul className="m-0 flex list-none flex-col items-start gap-[1.125rem] p-0">
                {navLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link className={linkClass} href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <FooterDivider />

          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 md:gap-7 md:px-8 md:py-2 lg:px-12">
            <div className="flex flex-col items-center gap-6 md:gap-7">
              <p className={headingClass}>{contactHeading}</p>
              <Link
                href={contactCta?.href || routes.contact}
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-none bg-primary px-8 py-2.5 text-[0.8125rem] font-semibold tracking-[0.12em] text-white uppercase no-underline transition-[filter] duration-150 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {contactCta?.label || "CONTACT US"}
              </Link>
            </div>
          </div>

          <FooterDivider />

          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-2 md:gap-9 md:px-8 lg:px-12">
            <div className="flex flex-col items-center gap-7 md:gap-8">
              <p className={headingClass}>{socialHeading}</p>
              <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-5 p-0 md:gap-6">
                {socialLinks.map(({ label, href, icon }) => {
                  const Icon = SOCIAL_ICONS[icon] || SOCIAL_ICONS.facebook;
                  return (
                    <li key={label}>
                      <a
                        className="inline-flex h-8 w-8 items-center justify-center text-[#808080] no-underline transition-colors duration-150 hover:text-neutral-600"
                        href={href}
                        rel="noopener noreferrer"
                        target="_blank"
                        aria-label={label}
                      >
                        <Icon className="h-[1.125rem] w-[1.125rem]" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Link href={routes.home} className="inline-flex shrink-0" aria-label="Black Tiger home">
              <Image
                src={logoUrl || "/logo.png"}
                alt={logoAlt || "Black Tiger"}
                width={200}
                height={48}
                className="h-[clamp(2rem,3.2vw,2.75rem)] w-auto"
                {...cmsImageProps(logoUrl || "/logo.png")}
              />
            </Link>
          </div>
        </div>
      </SiteContainer>
    </footer>
  );
}

function FooterDivider() {
  return (
    <>
      <div
        className="mx-auto my-2 h-px w-[min(100%,12rem)] shrink-0 bg-gradient-to-r from-transparent via-neutral-400/55 to-transparent md:hidden"
        aria-hidden
      />
      <div
        className="relative hidden w-px shrink-0 self-stretch md:block"
        aria-hidden
      >
        <div className="absolute inset-y-[14%] left-0 w-px bg-gradient-to-b from-transparent via-neutral-400/55 to-transparent" />
      </div>
    </>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.5h2.5V5H14c-2.2 0-3.5 1.35-3.5 3.65V11H8v3.5h2.5V21h3.5v-6.5H17V11h-3V9.1c0-1 .35-1.6 1.5-1.6Z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 5h2.9l-6.4 7.3L20.5 19h-5.5l-4.3-5.6-4.9 5.6H3.4l6.8-7.8L3.4 5h5.6l3.9 5.1L16.6 5Zm-1 12.4h1.6L8.1 6.5h-1.7l9.2 11Z" />
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

function YouTubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9C2 9 2 12 2 12s0 3 .4 4.8a2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9c.4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

function VimeoIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.1 6.3c-.1 1.6-1.2 3.8-3.3 6.6-2.2 2.9-4 4.3-5.4 4.3-.9 0-1.7-1.6-2.3-4.8-.8-3.7-1.6-5.6-2.4-5.6-.2 0-.9.4-2.1 1.2L5.8 5.5c2-1.8 3.9-3.5 5.8-5.2 2.6-2.3 4.5-3.5 5.6-3.6.9-.1 1.4.8 1.5 2.6Z" />
    </svg>
  );
}
