/**
 * @param {{
 *   filters: Array<{ key: string; value: string; label: string }>;
 *   onRemove: (key: string, value: string) => void;
 *   onClearAll?: () => void;
 *   className?: string;
 * }} props
 */
export default function ActiveFilterChips({ filters, onRemove, onClearAll, className = "" }) {
  if (!filters.length) return null;

  return (
    <div className={["flex flex-wrap items-center gap-x-3 gap-y-2", className].filter(Boolean).join(" ")}>
      <span className="text-xs font-normal tracking-wide text-neutral-400 uppercase">Filters</span>
      {filters.map((f) => (
        <span
          key={`${f.key}-${f.value}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-bold italic text-neutral-900"
        >
          {f.label}
          <button
            type="button"
            className="inline-flex cursor-pointer border-none bg-transparent p-0 text-sm leading-none font-normal not-italic text-neutral-900 hover:text-primary"
            aria-label={`Remove ${f.label}`}
            onClick={() => onRemove(f.key, f.value)}
          >
            ×
          </button>
        </span>
      ))}
      {onClearAll ? (
        <button
          type="button"
          className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold italic text-neutral-900 underline hover:text-primary"
          onClick={onClearAll}
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
