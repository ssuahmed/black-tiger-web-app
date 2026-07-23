import Image from "next/image";
import { cmsImageProps } from "@/lib/cmsImage";

/** Homepage section 7 — Extensive Packaging Range (Figma section-7) */
export default function HomeSection7({ imageUrl = "/images/home/section-7.png" }) {
  return (
    <section className="home-section-7" aria-label="Extensive packaging range">
      <Image
        src={imageUrl}
        alt="Extensive Packaging Range — Black Tiger lubricants in multiple container sizes"
        width={1440}
        height={470}
        className="home-section-7__img"
        sizes="100vw"
        {...cmsImageProps(imageUrl)}
      />
    </section>
  );
}
