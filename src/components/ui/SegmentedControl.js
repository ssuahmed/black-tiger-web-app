"use client";

export default function SegmentedControl({ options = [], value, onChange, className = "" }) {
  return (
    <div className={["segmented", className].filter(Boolean).join(" ")} role="tablist" aria-orientation="horizontal">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={selected ? "segmented__pill segmented__pill--active" : "segmented__pill"}
            onClick={() => onChange?.(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
