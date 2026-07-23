"use client";

export default function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div className={["tabs", className].filter(Boolean).join(" ")} role="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={selected ? "tabs__trigger tabs__trigger--active" : "tabs__trigger"}
            onClick={() => onChange?.(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
