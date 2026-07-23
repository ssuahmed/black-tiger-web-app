"use client";

import Image from "next/image";
import { useState } from "react";

import { cmsImageProps } from "@/lib/cmsImage";
import { cn } from "@/lib/cn";

/** @param {{ media: Array<{ url?: string; alt?: string }> }} props */
export default function ProductGallery({ media = [] }) {
  const items = media.length ? media : [{ url: "https://placehold.co/600x800/1a1a1a/f5f5f5/png?text=Product", alt: "Product" }];
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  const src = current?.url ?? items[0]?.url;
  const alt = current?.alt ?? "Product image";

  function go(delta) {
    setActive((i) => (i + delta + items.length) % items.length);
  }

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((m, i) => (
          <li key={i}>
            <button
              type="button"
              className={cn(
              "relative size-14 cursor-pointer overflow-hidden border bg-white p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                i === active ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-neutral-300",
              )}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
            >
              <Image
                src={m.url ?? src}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-1"
                {...cmsImageProps(m.url ?? src)}
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="relative aspect-4/5 max-h-128 w-full border border-neutral-200 bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width:1024px) 100vw, 520px"
          className="object-contain p-6"
          {...cmsImageProps(src)}
        />
        {items.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute top-1/2 left-2 z-2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-white/90 p-0 text-neutral-600 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute top-1/2 right-2 z-2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-white/90 p-0 text-neutral-600 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => go(1)}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
