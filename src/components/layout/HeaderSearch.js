"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { routes } from "@/lib/routes";

/** Single search icon; click expands the input beside it. */
export default function HeaderSearch() {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const urlQ =
    pathname.startsWith("/shop") || pathname.startsWith("/products")
      ? searchParams.get("q") || ""
      : "";
  const [q, setQ] = useState(urlQ);
  const [open, setOpen] = useState(Boolean(urlQ));
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const inputId = useId();

  useEffect(() => {
    setQ(urlQ);
    if (urlQ) setOpen(true);
  }, [urlQ]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setQ(urlQ);
      }
    }
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target) && !q.trim()) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, q, urlQ]);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      if (!next) setQ(urlQ);
      return next;
    });
  }

  return (
    <form
      ref={rootRef}
      action={routes.shop}
      method="get"
      className={["site-header__search", open ? "is-open" : ""].filter(Boolean).join(" ")}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        Search products
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name="q"
        type="search"
        placeholder="Search products…"
        className="site-header__search-input"
        autoComplete="off"
        value={q}
        tabIndex={open ? 0 : -1}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        type={open && q.trim() ? "submit" : "button"}
        className="site-header__search-toggle icon-btn"
        aria-label={open ? (q.trim() ? "Submit search" : "Close search") : "Open search"}
        aria-expanded={open}
        onClick={(e) => {
          if (open && q.trim()) return;
          e.preventDefault();
          toggle();
        }}
      >
        <Icon name="search" className="header-icon text-white" />
      </button>
    </form>
  );
}
