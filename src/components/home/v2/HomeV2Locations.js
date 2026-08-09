import Link from "next/link";
import { routes } from "@/lib/routes";

/**
 * homev2 worldwide locations — full-bleed banner with fluid copy on mobile.
 * @param {{
 *   imageUrl?: string;
 *   title?: string;
 *   ctaLabel?: string;
 *   ctaHref?: string;
 * }} props
 */
export default function HomeV2Locations({
  imageUrl = "/images/home/section-8.png",
  title = "Our Worldwide Locations",
  ctaLabel = "CONTACT US",
  ctaHref = routes.contact,
}) {
  return (
    <section
      className="home-v2-locations"
      style={{ backgroundImage: `url('${imageUrl}')` }}
      aria-label="Worldwide locations"
    >
      <div className="home-v2-locations__stage">
        <div className="home-v2-locations__copy">
          <span className="home-v2-locations__rule" aria-hidden />
          <h2 className="home-v2-locations__title">{title}</h2>
          <Link href={ctaHref} className="home-v2-locations__cta">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
