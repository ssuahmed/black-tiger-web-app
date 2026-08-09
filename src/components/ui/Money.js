import RiyalSymbol from "@/components/ui/RiyalSymbol";
import { cn } from "@/lib/cn";
import { formatSarAmount, stripSarCurrencyLabel } from "@/lib/format/money";

/**
 * Normalize an API/display money string to always include two decimal places.
 * @param {string} value
 */
function normalizeMoneyText(value) {
  const stripped = stripSarCurrencyLabel(String(value));
  const n = Number(stripped.replace(/,/g, ""));
  if (Number.isFinite(n)) return formatSarAmount(n);
  return stripped;
}

/**
 * Render a SAR amount with the official Riyal symbol.
 *
 * Prefer `amount` (number). `value` accepts API strings like "1,234.00 SAR" or "﷼ 12.50".
 * Both paths always render two decimal places (e.g. `88.50`).
 *
 * @param {{
 *   amount?: number | null;
 *   value?: string | null;
 *   className?: string;
 *   symbolClassName?: string;
 *   prefix?: string;
 * }} props
 */
export default function Money({ amount, value, className, symbolClassName, prefix = "" }) {
  let text = "";
  if (typeof amount === "number" && Number.isFinite(amount)) {
    text = formatSarAmount(amount);
  } else if (value != null && String(value).trim()) {
    text = normalizeMoneyText(String(value));
  }

  if (!text) return null;

  return (
    <span className={cn("money", className)}>
      {prefix}
      <RiyalSymbol className={cn("money__symbol", symbolClassName)} />
      <span className="money__amount">{text}</span>
    </span>
  );
}
