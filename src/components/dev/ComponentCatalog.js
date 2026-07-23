"use client";

import { useMemo, useState } from "react";

/**
 * @param {{ groups: [string, Array<{ name: string, category: string, filePath: string, importPath: string, hasCssModule: boolean }>][] }} props
 */
export default function ComponentCatalog({ groups }) {
  const [query, setQuery] = useState("");
  const total = useMemo(() => groups.reduce((n, [, items]) => n + items.length, 0), [groups]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;

    return groups
      .map(([category, items]) => {
        const next = items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.importPath.toLowerCase().includes(q) ||
            item.filePath.toLowerCase().includes(q),
        );
        return [category, next];
      })
      .filter(([, items]) => items.length > 0);
  }, [groups, query]);

  const visibleCount = useMemo(
    () => filteredGroups.reduce((n, [, items]) => n + items.length, 0),
    [filteredGroups],
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="min-w-64 max-w-md flex-1">
          <span className="sr-only">Search components</span>
          <input
            type="search"
            className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-neutral-900 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            placeholder="Search by name, folder, or import path…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p className="m-0 text-sm text-neutral-600">
          {query ? (
            <>
              Showing <strong className="font-semibold text-neutral-900">{visibleCount}</strong> of{" "}
              {total}
            </>
          ) : (
            <>
              <strong className="font-semibold text-neutral-900">{total}</strong> components
            </>
          )}
        </p>
      </div>

      {filteredGroups.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-neutral-300 px-8 py-8 text-center text-neutral-500">
          No components match your search.
        </p>
      ) : (
        filteredGroups.map(([category, items]) => (
          <section key={category}>
            <header className="mb-4 flex items-baseline gap-3 border-b-2 border-primary pb-2">
              <h2 className="font-magistral m-0 text-xl font-bold capitalize">{category}</h2>
              <span className="text-sm font-medium text-neutral-500">{items.length}</span>
            </header>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4 p-0">
              {items.map((item) => (
                <li
                  key={item.importPath}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="m-0 text-base font-semibold">{item.name}</h3>
                    {item.hasCssModule ? (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                        CSS module
                      </span>
                    ) : null}
                  </div>
                  <p className="m-0 mb-2 break-all text-xs text-neutral-500">{item.filePath}</p>
                  <code className="block break-all rounded bg-neutral-100 px-2.5 py-2 text-xs">
                    {item.importPath}
                  </code>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}