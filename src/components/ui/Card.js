export default function Card({ as: Comp = "div", className = "", padded = true, ...props }) {
  const base = padded ? "card card--padded" : "card";
  return <Comp className={[base, className].filter(Boolean).join(" ")} {...props} />;
}
