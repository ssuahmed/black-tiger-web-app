import Image from "next/image";
import { cmsImageProps } from "@/lib/cmsImage";

/** Homepage section 8 — global presence map (Figma section-8) */
export default function HomeSection8({ imageUrl = "/images/home/section-8.png" }) {
  return (
    <section className="home-section-8" aria-label="Global presence">
      <Image
        src={imageUrl}
        alt="Black Tiger global presence map"
        width={1440}
        height={395}
        className="home-section-8__img"
        sizes="100vw"
        {...cmsImageProps(imageUrl)}
      />
    </section>
  );
}
