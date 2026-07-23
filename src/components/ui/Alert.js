export default function Alert({ variant = "info", role = "alert", className = "", children, ...rest }) {
  const v =
    variant === "error" ? "alert--error" : variant === "success" ? "alert--success" : "alert--info";
  return (
    <div className={["alert", v, className].filter(Boolean).join(" ")} role={role} {...rest}>
      {children}
    </div>
  );
}
