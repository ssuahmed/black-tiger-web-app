import Image from "next/image";
import Link from "next/link";
import { cmsImageProps } from "@/lib/cmsImage";
import { routes } from "@/lib/routes";

/**
 * homev2 packaging range — full-bleed image with overlay CTA (fluid on mobile).
 * @param {{
 *   imageUrl?: string;
 *   ctaLabel?: string;
 *   ctaHref?: string;
 * }} props
 */
export default function HomeV2Packaging({
  imageUrl = "/images/home/section-7.png",
  ctaLabel = "VISIT OUR SHOP",
  ctaHref = routes.productsDefault,
}) {
  return (
    <section className="home-v2-packaging" aria-label="Extensive packaging range">
      <div className="home-v2-packaging__media">
        <Image
          src={imageUrl}
          alt="Extensive Packaging Range — Black Tiger lubricants in multiple container sizes"
          width={1440}
          height={470}
          className="home-v2-packaging__img"
          sizes="100vw"
          {...cmsImageProps(imageUrl)}
        />
        <div className="home-v2-packaging__stage">
          <Link href={ctaHref} className="home-v2-packaging__cta">
            <span>{ctaLabel}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
