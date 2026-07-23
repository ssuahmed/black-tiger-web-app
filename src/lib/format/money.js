/** @param {number} amount */
export function formatSarSymbol(amount) {
  return `\uFDFC ${amount.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** @param {number} amount */
export function formatSar(amount) {
  return `${amount.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}
