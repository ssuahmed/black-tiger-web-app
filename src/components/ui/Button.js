export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const variants = [];
  variants.push("btn");
  if (variant === "primary") variants.push("btn-primary");
  if (variant === "outline") variants.push("btn-outline");
  if (variant === "ghost") variants.push("btn-ghost");
  return (
    <button type={type} className={[...variants, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  );
}
