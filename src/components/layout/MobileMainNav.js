"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";

export default function MobileMainNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="icon-btn flex-y-center"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="relative block h-5 w-6 shrink-0" aria-hidden>
          <span
            className={`absolute left-0 top-0 h-0.5 w-full rounded-full bg-white transition-all duration-200 ${open ? "top-[9px] rotate-45" : ""}`}
          />
          <span
            className={`absolute left-0 top-[9px] h-0.5 w-full rounded-full bg-white transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`absolute left-0 top-[18px] h-0.5 w-full rounded-full bg-white transition-all duration-200 ${open ? "top-[9px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] cursor-default bg-neutral-900/40 backdrop-blur-[1px]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            className="fixed inset-x-0 top-0 z-[110] max-h-[min(100dvh,100vh)] overflow-y-auto border-b border-neutral-200 bg-white px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
          >
            <div className="mx-auto flex max-w-lg items-center justify-between gap-4 pb-4">
              <p className="font-magistral text-sm font-semibold uppercase tracking-wider text-neutral-900">Menu</p>
              <button
                type="button"
                className="icon-btn rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-900"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <nav aria-label="Pages">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="font-magistral block rounded-md px-3 py-3.5 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-100 hover:text-primary active:bg-neutral-200"
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
