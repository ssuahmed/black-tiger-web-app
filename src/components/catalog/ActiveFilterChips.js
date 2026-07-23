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
    <div className={["mt-3 flex flex-wrap items-center gap-x-3 gap-y-2", className].filter(Boolean).join(" ")}>
      {filters.map((f) => (
        <span
          key={`${f.key}-${f.value}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium tracking-wide text-neutral-900"
        >
          {f.label}
          <button
            type="button"
            className="inline-flex cursor-pointer border-none bg-transparent p-0 text-sm leading-none text-neutral-500 hover:text-primary"
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
          className="cursor-pointer border-none bg-transparent p-0 text-xs text-[#6b8fa3] hover:text-primary hover:underline"
          onClick={onClearAll}
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
