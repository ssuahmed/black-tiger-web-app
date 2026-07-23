"use client";

import Link from "next/link";
import { useCallback, useId, useState } from "react";
import CategoryApplicationIcon from "@/components/home/CategoryApplicationIcon";
import ChevronIcon from "@/components/ui/ChevronIcon";
import { HOME_APPLICATION_ACCORDIONS, applicationHref } from "@/data/homeApplicationCategories";
import { cn } from "@/lib/cn";

/** @param {{ categories?: typeof HOME_APPLICATION_ACCORDIONS }} props */
export default function ApplicationAccordion({ categories = HOME_APPLICATION_ACCORDIONS }) {
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
    <div
      className="bg-white py-[clamp(2.5rem,calc(100vw*72/var(--design-canvas)),4.5rem)] text-[#4a4a4a]"
      aria-label="Browse by application"
    >
      <div className="m-0 p-0">
        {categories.map((category, index) => {
          const isOpen = openIds.has(category.id);
          const panelId = `${baseId}-panel-${category.id}`;
          const triggerId = `${baseId}-trigger-${category.id}`;
          const isLast = index === categories.length - 1;

          return (
            <article
              key={category.id}
              className={cn(
              "border-t border-[#e0e0e0] pe-5",
                isOpen && "bg-[#f2f2f2]",
                isLast && "border-b border-[#e0e0e0]",
              )}
            >
              <h2 className="m-0">
                <button
                  type="button"
                  id={triggerId}
                  className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-[clamp(0.75rem,calc(100vw*24/var(--design-canvas)),1.5rem)] border-0 bg-transparent px-0 py-[clamp(1rem,calc(100vw*28/var(--design-canvas)),1.75rem)] text-left text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(category.id)}
                >
                  <span className="block h-[3px] w-[clamp(2rem,calc(100vw*48/var(--design-canvas)),3rem)] shrink-0 bg-primary" aria-hidden />
                  <span
                    className={cn(
                      "font-magistral text-lg font-bold uppercase leading-[1.2] tracking-[0.06em] text-[#4a4a4a]",
                    )}
                  >
                    {category.title}
                  </span>
                  <ChevronIcon open={isOpen} className="bg-[#b3b3b3]" />
                </button>
              </h2>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                hidden={!isOpen}
                className="pb-[clamp(1.25rem,calc(100vw*40/var(--design-canvas)),2rem)] ps-20"
              >
                <ul className="m-0 flex list-none flex-wrap items-start justify-start gap-3.5 p-0">
                  {category.applications.map((app) => (
                    <li key={app.slug} className="shrink-0 grow-0 basis-auto">
                      <Link
                        href={applicationHref(category, app)}
                        className="box-border flex h-[150px] w-[150px] flex-col items-center justify-center gap-2.5 border border-[#f5c2c7] bg-white px-2 py-3 text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-[#eeb8be] hover:shadow-[0_1px_4px_rgba(233,1,6,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <CategoryApplicationIcon name={app.icon} className="h-[3.25rem] w-[3.25rem] shrink-0 text-black" />
                        <span className="block max-w-full px-0.5 text-center text-xs font-medium uppercase leading-[1.25] tracking-[0.04em] text-[#808080]">
                          {app.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
