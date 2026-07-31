"use client";

import { useCallback, useId, useState } from "react";
import ChevronIcon from "@/components/ui/ChevronIcon";

const SECTIONS = [
  { key: "description", label: "Description", Icon: DocIcon },
  { key: "benefits", label: "Benefits", Icon: ListIcon },
  { key: "specifications", label: "Specifications", Icon: CheckIcon },
  { key: "typicals", label: "Typicals", Icon: TableIcon },
  { key: "oem", label: "OEM Cross Reference", Icon: SwapIcon },
];

/** @param {{ product: Record<string, unknown> }} props */
export default function ProductDetailSections({ product }) {
  const baseId = useId();

  const descriptionHtml = product?.descriptionHtml ? String(product.descriptionHtml) : "";
  const footnote = product?.descriptionFootnote ? String(product.descriptionFootnote) : "";
  const benefits = Array.isArray(product?.benefits) ? product.benefits : [];
  const specifications = Array.isArray(product?.specifications) ? product.specifications : [];
  const typicals = Array.isArray(product?.typicals) ? product.typicals : [];
  const oem = Array.isArray(product?.oemCrossReference) ? product.oemCrossReference : [];

  const available = {
    description: Boolean(descriptionHtml),
    benefits: benefits.length > 0,
    specifications: specifications.length > 0,
    typicals: typicals.length > 0,
    oem: oem.length > 0,
  };

  const visibleSections = SECTIONS.filter((s) => available[s.key]);

  // The mock shows every section expanded; collapsing stays available.
  const [openKeys, setOpenKeys] = useState(() => new Set(visibleSections.map((s) => s.key)));

  const toggle = useCallback((key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (!visibleSections.length) return null;

  function renderPanel(key) {
    if (key === "description") {
      return (
        <>
          <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          {footnote ? <p className="pdp-footnote">{footnote}</p> : null}
        </>
      );
    }
    if (key === "benefits") {
      return (
        <ul className="pdp-list">
          {benefits.map((b) => (
            <li key={String(b)}>{String(b)}</li>
          ))}
        </ul>
      );
    }
    if (key === "specifications") {
      return (
        <ul className="pdp-list">
          {specifications.map((s) => (
            <li key={String(s)}>{String(s)}</li>
          ))}
        </ul>
      );
    }
    if (key === "typicals") {
      return (
        <div className="pdp-table-wrap">
          <table className="pdp-table">
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Method</th>
                <th scope="col">Unit</th>
                <th scope="col">Average Results</th>
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
        </div>
      );
    }
    if (key === "oem") {
      return (
        <ul className="pdp-list">
          {oem.map((row, i) => {
            const r = row && typeof row === "object" ? row : {};
            return (
              <li key={i}>
                <strong>{String(r.brand ?? "")}</strong>
                {r.productName ? ` ${String(r.productName)}` : null}
              </li>
            );
          })}
        </ul>
      );
    }
    return null;
  }

  return (
    <div className="pdp-sections">
      {visibleSections.map(({ key, label, Icon }) => {
        const isOpen = openKeys.has(key);
        const panelId = `${baseId}-${key}`;
        return (
          <div key={key} className="pdp-section">
            <button
              type="button"
              className="pdp-section__toggle"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(key)}
            >
              <span className="pdp-section__icon" aria-hidden>
                <Icon />
              </span>
              <span>{label}</span>
              <ChevronIcon open={isOpen} className="h-2 w-4" />
            </button>
            {isOpen ? (
              <div id={panelId} className="pdp-section__panel">
                {renderPanel(key)}
              </div>
            ) : null}
          </div>
        );
      })}

      <ShareRow />
    </div>
  );
}

function ShareRow() {
  const [copied, setCopied] = useState(false);

  function pageUrl() {
    return typeof window === "undefined" ? "" : window.location.href;
  }

  async function copyLink() {
    const url = pageUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the other share links still work */
    }
  }

  function share(target) {
    const url = encodeURIComponent(pageUrl());
    const href =
      target === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : target === "x"
          ? `https://x.com/intent/post?url=${url}`
          : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  return (
    <div className="pdp-share">
      <div className="pdp-share__list">
        <button
          type="button"
          className="pdp-share__link"
          onClick={() => void copyLink()}
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Link copied" : "Copy link"}
        >
          <LinkIcon />
        </button>
        <button type="button" className="pdp-share__link" onClick={() => share("facebook")} aria-label="Share on Facebook">
          <FacebookIcon />
        </button>
        <button type="button" className="pdp-share__link" onClick={() => share("x")} aria-label="Share on X">
          <XIcon />
        </button>
        <button type="button" className="pdp-share__link" onClick={() => share("linkedin")} aria-label="Share on LinkedIn">
          <LinkedInIcon />
        </button>
      </div>
      <a href="/contact" className="pdp-share__help">
        <ChatIcon /> Need help?
      </a>
    </div>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 16 16" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3.5 1.5h6L13 5v9.5h-9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 1.5h10v13H3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 8.3 7.1 10.4 11 6.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg viewBox="0 0 16 16" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="1.5" y="2.5" width="13" height="11" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 6.2h13M6.2 6.2v7.3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 16 16" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M2 5.5h11L10.5 3M14 10.5H3l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8.2 11.8 11.8 8.2M7.5 5.6l1.2-1.2a3.4 3.4 0 0 1 4.9 4.9l-1.2 1.2M12.5 14.4l-1.2 1.2a3.4 3.4 0 0 1-4.9-4.9l1.2-1.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 20 20" width="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12.6 10.5h-2v7h-2.6v-7H6.4V8.3h1.6V6.9C8 5.2 8.8 3.9 11 3.9h1.9v2.2h-1.2c-.8 0-1.1.4-1.1 1.1v1.1h2.3z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" width="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M13.9 3.5h2.4l-5.2 6 5.6 7h-4.3l-3.1-4-3.6 4H3.3l5.5-6.3L3.4 3.5h4.4l2.9 3.7zm-.8 11.6h1.3L7 4.8H5.6z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 20 20" width="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6.3 7.6v8.3H3.8V7.6zM5 3.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM16.2 11.2v4.7h-2.5v-4.3c0-1.1-.4-1.8-1.4-1.8-.7 0-1.2.5-1.4 1.1v5H8.4s0-6.9 0-8.3h2.5v1.2c.4-.6 1.1-1.4 2.6-1.4 1.7 0 2.7 1.1 2.7 3.8z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3.5 5.5A2 2 0 0 1 5.5 3.5h9a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H8l-4.5 3z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
