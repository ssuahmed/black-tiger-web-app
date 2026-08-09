"use client";

const PERIOD_OPTIONS = [
  { value: "3m", label: "Last 3 months" },
  { value: "30d", label: "Last 30 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
];

/**
 * Search + date-range filters for account list pages.
 * @param {{
 *   query: string;
 *   period: string;
 *   onQueryChange: (value: string) => void;
 *   onPeriodChange: (value: string) => void;
 *   searchPlaceholder?: string;
 * }} props
 */
export default function AccountListFilters({
  query,
  period,
  onQueryChange,
  onPeriodChange,
  searchPlaceholder = "Find items",
}) {
  return (
    <div className="acc-list-filters" role="search">
      <div className="acc-list-filters__search">
        <SearchIcon className="acc-list-filters__search-icon" />
        <input
          type="search"
          className="acc-list-filters__search-input"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
          aria-label={searchPlaceholder}
        />
      </div>
      <div className="acc-list-filters__period">
        <select
          className="acc-list-filters__period-select"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          aria-label="Time period"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronIcon className="acc-list-filters__period-chevron" />
      </div>
    </div>
  );
}

export { PERIOD_OPTIONS };

/** @param {string} period @param {Date} [now] */
export function periodStartDate(period, now = new Date()) {
  if (period === "all") return null;
  const start = new Date(now);
  if (period === "30d") {
    start.setDate(start.getDate() - 30);
    return start;
  }
  if (period === "6m") {
    start.setMonth(start.getMonth() - 6);
    return start;
  }
  if (period === "1y") {
    start.setFullYear(start.getFullYear() - 1);
    return start;
  }
  start.setMonth(start.getMonth() - 3);
  return start;
}

/**
 * @param {unknown} value
 * @param {string} period
 */
export function matchesPeriod(value, period) {
  const start = periodStartDate(period);
  if (!start) return true;
  if (value == null || value === "") return true;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return true;
  return date >= start;
}

/** @param {unknown[]} haystacks @param {string} query */
export function matchesQuery(haystacks, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((part) => String(part ?? "").toLowerCase().includes(q));
}

function SearchIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
