"use client";

import { useCallback, useId, useState } from "react";
import ChevronIcon from "@/components/ui/ChevronIcon";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { key: "description", label: "Description", icon: "§" },
  { key: "specifications", label: "Specifications", icon: "✓" },
  { key: "typicals", label: "Typicals", icon: "◆" },
  { key: "oem", label: "OEM Cross Reference", icon: "↔" },
];

/** @param {{ product: Record<string, unknown> }} props */
export default function ProductDetailSections({ product }) {
  const baseId = useId();
  const [openKeys, setOpenKeys] = useState(() => new Set(["description"]));

  const toggle = useCallback((key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const descriptionHtml = product?.descriptionHtml ? String(product.descriptionHtml) : "";
  const benefits = Array.isArray(product?.benefits) ? product.benefits : [];
  const specifications = Array.isArray(product?.specifications) ? product.specifications : [];
  const typicals = Array.isArray(product?.typicals) ? product.typicals : [];
  const oem = Array.isArray(product?.oemCrossReference) ? product.oemCrossReference : [];

  const hasDescription = Boolean(descriptionHtml || benefits.length);
  const hasSpecs = specifications.length > 0;
  const hasTypicals = typicals.length > 0;
  const hasOem = oem.length > 0;

  if (!hasDescription && !hasSpecs && !hasTypicals && !hasOem) return null;

  function renderPanel(key) {
    if (key === "description" && hasDescription) {
      return (
        <>
          {descriptionHtml ? <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} /> : null}
          {benefits.length > 0 ? (
            <ul className="mt-3 mb-0 pl-[1.125rem] [&_li]:mb-1.5">
              {benefits.map((b) => (
                <li key={String(b)}>{String(b)}</li>
              ))}
            </ul>
          ) : null}
        </>
      );
    }
    if (key === "specifications" && hasSpecs) {
      return (
        <ul className="m-0 pl-[1.125rem] [&_li]:mb-1.5">
          {specifications.map((s) => (
            <li key={String(s)}>{String(s)}</li>
          ))}
        </ul>
      );
    }
    if (key === "typicals" && hasTypicals) {
      return (
        <table className="w-full border-collapse text-xs [&_td]:border [&_td]:border-neutral-200 [&_td]:px-2.5 [&_td]:py-2 [&_td]:text-left [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-100 [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-neutral-600">
          <thead>
            <tr>
              <th>Test</th>
              <th>Method</th>
              <th>Unit</th>
              <th>Average Results</th>
            </tr>
          </thead>
          <tbody>
            {typicals.map((row, i) => {
              const r = row && typeof row === "object" ? row : {};
              return (
                <tr key={i}>
                  <td>{String(r.test ?? "")}</td>
                  <td>{String(r.method ?? "")}</td>
                  <td>{String(r.unit ?? "")}</td>
                  <td>{String(r.value ?? "")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    if (key === "oem" && hasOem) {
      return (
        <ul className="m-0 list-none p-0 [&_li]:mb-2">
          {oem.map((row, i) => {
            const r = row && typeof row === "object" ? row : {};
            return (
              <li key={i}>
                <span className="font-semibold text-neutral-900">{String(r.brand ?? "")}</span>
                {r.productName ? ` — ${String(r.productName)}` : null}
              </li>
            );
          })}
        </ul>
      );
    }
    return null;
  }

  function isVisible(key) {
    if (key === "description") return hasDescription;
    if (key === "specifications") return hasSpecs;
    if (key === "typicals") return hasTypicals;
    if (key === "oem") return hasOem;
    return false;
  }

  return (
    <div className="mt-10 border-t border-neutral-300 text-neutral-900">
      {SECTIONS.filter((s) => isVisible(s.key)).map((section) => {
        const isOpen = openKeys.has(section.key);
        const panelId = `${baseId}-${section.key}`;
        return (
          <div key={section.key} className="border-b border-neutral-300">
            <button
              type="button"
              className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 border-none bg-transparent py-4 text-left text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(section.key)}
            >
              <span className="inline-flex size-6 items-center justify-center text-xs text-primary" aria-hidden>
                {section.icon}
              </span>
              <span className="text-sm font-bold tracking-widest uppercase">{section.label}</span>
              <ChevronIcon open={isOpen} className="h-2 w-4" />
            </button>
            {isOpen ? (
              <div id={panelId} className="pb-5 pl-9 text-sm leading-relaxed text-neutral-600 [&_p]:mb-3 [&_p:last-child]:mb-0">
                {renderPanel(section.key)}
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4">
        <div className="flex gap-3" aria-label="Share">
          <a
            href="#"
            className="inline-flex size-8 items-center justify-center rounded-full border border-neutral-300 text-xs font-bold text-neutral-600 no-underline hover:border-primary hover:text-primary"
            aria-label="Share on X"
          >
            X
          </a>
          <a
            href="#"
            className="inline-flex size-8 items-center justify-center rounded-full border border-neutral-300 text-xs font-bold text-neutral-600 no-underline hover:border-primary hover:text-primary"
            aria-label="Share on Facebook"
          >
            f
          </a>
          <a
            href="#"
            className="inline-flex size-8 items-center justify-center rounded-full border border-neutral-300 text-xs font-bold text-neutral-600 no-underline hover:border-primary hover:text-primary"
            aria-label="Share on LinkedIn"
          >
            in
          </a>
        </div>
        <a
          href="/contact"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 no-underline hover:text-primary"
        >
          <span aria-hidden>💬</span> Need help?
        </a>
      </div>
    </div>
  );
}
