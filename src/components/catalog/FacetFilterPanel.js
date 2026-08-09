"use client";

import { useCallback, useId, useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import ChevronIcon from "@/components/ui/ChevronIcon";
import { cn } from "@/lib/cn";

const VISIBLE_OPTIONS = 5;

const FLAT_SIDEBAR_CLASS =
  "card card--padded text-sm text-neutral-900 [&_.checkbox-field__label]:text-neutral-700";

const ACCORDION_SIDEBAR_CLASS =
  "text-sm text-neutral-900 [&_.checkbox-field__label]:text-neutral-700 [&_.checkbox-field:hover_.checkbox-field__label]:text-neutral-900";

/**
 * @typedef {{
 *   key?: string;
 *   value: string;
 *   label: string;
 *   count: number;
 *   children?: Array<{ key?: string; value: string; label: string; count: number }>;
 * }} FacetOption
 */

/**
 * @typedef {{
 *   key: string;
 *   label: string;
 *   collapsed: boolean;
 *   showMore: boolean;
 *   options: FacetOption[];
 * }} FacetGroup
 */

/** @param {unknown[]} facets @returns {FacetGroup[]} */
function normalizeFacets(facets) {
  if (!Array.isArray(facets)) return [];
  return facets.map((raw) => {
    const g = raw && typeof raw === "object" ? /** @type {Record<string, unknown>} */ (raw) : {};
    const key = String(g.key ?? "");
    const label = String(g.label ?? key);
    const opts = Array.isArray(g.options) ? g.options : [];
    const options = opts.map((o) => normalizeOption(o));
    return {
      key,
      label,
      collapsed: Boolean(g.collapsed),
      showMore: Boolean(g.showMore),
      options,
    };
  });
}

/** @param {unknown} raw @returns {FacetOption} */
function normalizeOption(raw) {
  const opt = raw && typeof raw === "object" ? /** @type {Record<string, unknown>} */ (raw) : {};
  const childrenRaw = Array.isArray(opt.children) ? opt.children : [];
  return {
    key: typeof opt.key === "string" ? opt.key : undefined,
    value: String(opt.value ?? ""),
    label: String(opt.label ?? opt.value ?? ""),
    count: typeof opt.count === "number" ? opt.count : 0,
    children: childrenRaw.map((child) => normalizeOption(child)),
  };
}

/**
 * Flatten nested application children for chip label lookup.
 * @param {FacetGroup[]} groups
 * @returns {FacetGroup[]}
 */
export function flattenFacetsForChips(groups) {
  /** @type {FacetGroup[]} */
  const out = [];
  /** @type {Map<string, FacetOption[]>} */
  const byKey = new Map();

  for (const group of groups) {
    const opts = [...group.options];
    byKey.set(group.key, opts);
    out.push({ ...group, options: opts });
    for (const opt of group.options) {
      for (const child of opt.children ?? []) {
        const childKey = child.key || "application";
        if (!byKey.has(childKey)) {
          byKey.set(childKey, []);
          out.push({
            key: childKey,
            label: childKey,
            collapsed: false,
            showMore: false,
            options: byKey.get(childKey),
          });
        }
        const list = byKey.get(childKey);
        if (list && !list.some((o) => o.value === child.value)) {
          list.push(child);
        }
      }
    }
  }
  return out;
}

/**
 * @param {{
 *   groupKey: string;
 *   options: FacetOption[];
 *   selection: Record<string, Set<string>>;
 *   onToggle: (facetKey: string, value: string, checked: boolean, meta?: { parentSegment?: string }) => void;
 *   depth?: number;
 * }} props
 */
function FacetOptions({ groupKey, options, selection, onToggle, depth = 0 }) {
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-2 p-0", depth > 0 && "mt-2 ms-4 border-s border-neutral-200 ps-3")}>
      {options.map((opt) => {
        const childKey = opt.key || groupKey;
        const checked = selection[childKey]?.has(opt.value) ?? false;
        const id = `facet-${childKey}-${opt.value}-${depth}`;
        const children = opt.children ?? [];

        return (
          <li key={`${childKey}:${opt.value}`}>
            <Checkbox
              id={id}
              checked={checked}
              label={`${opt.label} (${opt.count})`}
              onChange={(e) => onToggle(childKey, opt.value, e.target.checked)}
            />
            {children.length > 0 ? (
              <FacetOptions
                groupKey="application"
                options={children.map((c) => ({ ...c, key: c.key || "application" }))}
                selection={selection}
                onToggle={(facetKey, value, isChecked) =>
                  onToggle(facetKey, value, isChecked, { parentSegment: opt.value })
                }
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * @param {{
 *   facets?: unknown[];
 *   selection: Record<string, Set<string>>;
 *   onToggle: (facetKey: string, value: string, checked: boolean, meta?: { parentSegment?: string }) => void;
 *   collapsible?: boolean;
 *   className?: string;
 * }} props
 */
export default function FacetFilterPanel({ facets = [], selection, onToggle, collapsible = false, className = "" }) {
  const groups = normalizeFacets(facets);

  if (!collapsible) {
    if (!groups.length) {
      return (
        <aside className={cn(FLAT_SIDEBAR_CLASS, className)}>
          <p className="m-0 text-sm text-neutral-600">No filters available.</p>
        </aside>
      );
    }

    return (
      <aside className={cn(FLAT_SIDEBAR_CLASS, className)}>
        <p className="mb-3 text-xs font-bold tracking-wide text-neutral-900 uppercase">
          Filters
        </p>
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-[clamp(0.8125rem,calc(100vw*16/1440),1rem)] font-semibold tracking-wide text-neutral-500 uppercase">{group.label}</p>
              <FacetOptions
                groupKey={group.key}
                options={group.options}
                selection={selection}
                onToggle={onToggle}
              />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return <CollapsibleFacetPanel groups={groups} selection={selection} onToggle={onToggle} className={className} />;
}

/** @param {{ groups: FacetGroup[]; selection: Record<string, Set<string>>; onToggle: Function; className?: string }} props */
function CollapsibleFacetPanel({ groups, selection, onToggle, className = "" }) {
  const baseId = useId();
  const [openKeys, setOpenKeys] = useState(() => new Set(groups.filter((f) => !f.collapsed).map((f) => f.key)));
  const [expandedMore, setExpandedMore] = useState(() => new Set());

  const toggleGroup = useCallback((key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (!groups.length) {
    return (
      <aside className={cn(ACCORDION_SIDEBAR_CLASS, className)}>
        <p className="m-0 text-sm text-neutral-600">No filters available.</p>
      </aside>
    );
  }

  return (
    <aside className={cn(ACCORDION_SIDEBAR_CLASS, className)}>
      {groups.map((group) => {
        const isOpen = openKeys.has(group.key);
        const panelId = `${baseId}-${group.key}-panel`;
        const triggerId = `${baseId}-${group.key}-trigger`;
        const showAll = expandedMore.has(group.key);
        const visibleOptions = showAll || !group.showMore ? group.options : group.options.slice(0, VISIBLE_OPTIONS);
        const hasHidden = group.showMore && group.options.length > VISIBLE_OPTIONS && !showAll;

        return (
          <div key={group.key} className="border-b border-neutral-300 first:border-t">
            <button
              type="button"
              id={triggerId}
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent py-3.5 text-left text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleGroup(group.key)}
            >
              <span className="text-[clamp(0.8125rem,calc(100vw*16/1440),1rem)] font-bold tracking-wide text-neutral-900 uppercase">
                {group.label}
              </span>
              <ChevronIcon open={isOpen} />
            </button>
            <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen} className="pb-3.5">
              {group.options.length > 0 ? (
                <>
                  <FacetOptions
                    groupKey={group.key}
                    options={visibleOptions}
                    selection={selection}
                    onToggle={onToggle}
                  />
                  {hasHidden ? (
                    <button
                      type="button"
                      className="mt-2 cursor-pointer border-none bg-transparent p-0 text-xs font-bold tracking-wide text-primary uppercase hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      onClick={() => setExpandedMore((p) => new Set(p).add(group.key))}
                    >
                      + SHOW MORE
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
