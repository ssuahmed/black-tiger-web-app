"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useId, useState } from "react";
import CategoryApplicationIcon from "@/components/home/CategoryApplicationIcon";
import { HOME_APPLICATION_ACCORDIONS, applicationHref } from "@/data/homeApplicationCategories";
import { cmsImageProps } from "@/lib/cmsImage";
import { cn } from "@/lib/cn";

/** @param {{ app: { slug: string; label: string; icon?: string; imageUrl?: string } }} props */
function ApplicationTileIcon({ app }) {
  const imageUrl = typeof app.imageUrl === "string" ? app.imageUrl.trim() : "";
  if (imageUrl) {
    return (
      <span className="home-v2-segments__tile-icon">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="52px"
          className="object-contain"
          {...cmsImageProps(imageUrl)}
        />
      </span>
    );
  }
  return (
    <CategoryApplicationIcon
      name={app.icon || "gear"}
      className="home-v2-segments__tile-fallback"
    />
  );
}

/** Thin stroke chevron matching the 1440 segments mock. */
function SegmentChevron({ open }) {
  return (
    <svg
      className={cn("home-v2-segments__chevron", open && "is-open")}
      viewBox="0 0 18 10"
      width="18"
      height="10"
      aria-hidden
      focusable="false"
    >
      <path
        d="M1 1.25 9 8.75 17 1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * homev2 segments accordion — 1440 mock: gray field, red bars, Magistral titles, chevrons.
 * @param {{ categories?: typeof HOME_APPLICATION_ACCORDIONS }} props
 */
export default function HomeV2Accordion({ categories = HOME_APPLICATION_ACCORDIONS }) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <section className="home-v2-segments" aria-label="Browse by segment">
      <div className="home-v2-segments__list">
        {categories.map((category) => {
          const isOpen = openIds.has(category.id);
          const panelId = `${baseId}-panel-${category.id}`;
          const triggerId = `${baseId}-trigger-${category.id}`;

          return (
            <article
              key={category.id}
              className={cn("home-v2-segments__item", isOpen && "is-open")}
            >
              <h2 className="home-v2-segments__heading">
                <button
                  type="button"
                  id={triggerId}
                  className="home-v2-segments__trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(category.id)}
                >
                  <span className="home-v2-segments__bar" aria-hidden />
                  <span className="home-v2-segments__title">{category.title}</span>
                  <SegmentChevron open={isOpen} />
                </button>
              </h2>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                hidden={!isOpen}
                className="home-v2-segments__panel"
              >
                <ul className="home-v2-segments__apps">
                  {category.applications.map((app) => (
                    <li key={app.slug}>
                      <Link href={applicationHref(category, app)} className="home-v2-segments__tile">
                        <ApplicationTileIcon app={app} />
                        <span className="home-v2-segments__tile-label">{app.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
