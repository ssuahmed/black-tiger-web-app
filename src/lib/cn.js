/** @param {import('react').ClassValue[]} classes */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
