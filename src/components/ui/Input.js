import { forwardRef } from "react";

const Input = forwardRef(function Input({ className = "", type = "text", invalid, ...props }, ref) {
  const classes = ["input-field", invalid ? "input-field--invalid" : "", className].filter(Boolean).join(" ");
  return <input ref={ref} type={type} className={classes} {...props} />;
});

export default Input;
