/**
 * @param {{ stepIndex: number; labels: string[]; className?: string }} props
 */
export default function CheckoutStepper({ stepIndex, labels, className = "" }) {
  return (
    <ol
      className={[
      "mb-8 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:gap-4 md:text-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {labels.map((label, i) => (
        <li key={label} className={`flex items-center gap-2 ${i <= stepIndex ? "text-primary" : ""}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-current">{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
