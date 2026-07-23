export default function Spinner({ className = "", label = "Loading", size = "md" }) {
  const s = size === "sm" ? "spinner spinner--sm" : "spinner";
  return (
    <span className={["inline-flex flex-col items-center gap-2", className].filter(Boolean).join(" ")}>
      <span className={s} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
