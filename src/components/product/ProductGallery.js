"use client";

import Image from "next/image";
import { useState } from "react";

import { cmsImageProps } from "@/lib/cmsImage";
import { cn } from "@/lib/cn";

const PLACEHOLDER = {
  url: "https://placehold.co/600x800/1a1a1a/f5f5f5/png?text=Product",
  alt: "Product",
};

/** @param {{ media?: Array<{ url?: string; alt?: string }> }} props */
export default function ProductGallery({ media = [] }) {
  const items = media.length ? media : [PLACEHOLDER];
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  const src = current?.url ?? items[0]?.url;
  const alt = current?.alt ?? "Product image";

  function go(delta) {
    setActive((i) => (i + delta + items.length) % items.length);
  }

  return (
    <div className="pdp-gallery">
      <ul className="pdp-gallery__thumbs">
        {items.map((m, i) => (
          <li key={i}>
            <button
              type="button"
              className={cn("pdp-gallery__thumb", i === active && "pdp-gallery__thumb--active")}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
            >
              <Image
                src={m.url ?? src}
                alt=""
                fill
                sizes="76px"
                className="object-contain"
                {...cmsImageProps(m.url ?? src)}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="pdp-gallery__stage">
        {items.length > 1 ? (
          <button
            type="button"
            className="pdp-gallery__arrow"
            onClick={() => go(-1)}
            aria-label="Previous image"
          >
            <Chevron direction="left" />
          </button>
        ) : (
          <span />
        )}

        <div className="pdp-gallery__viewport">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width:1024px) 100vw, 620px"
            className="object-contain"
            priority
            {...cmsImageProps(src)}
          />
        </div>

        {items.length > 1 ? (
          <button
            type="button"
            className="pdp-gallery__arrow"
            onClick={() => go(1)}
            aria-label="Next image"
          >
            <Chevron direction="right" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function Chevron({ direction }) {
  return (
    <svg viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" aria-hidden>
      <path
        d={direction === "left" ? "M9 1 2 10l7 9" : "M3 1l7 9-7 9"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
