export default function Badge({
  variant = "neutral",
  className = "",
  children,
  ...rest
}) {
  const v = variant === "primary" ? "badge--primary" : variant === "outline" ? "badge--outline" : "badge--neutral";
  return (
    <span className={["badge", v, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </span>
  );
}
