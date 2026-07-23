import { forwardRef } from "react";

const Select = forwardRef(function Select({ className = "", invalid, children, ...props }, ref) {
  const classes = ["select-field", invalid ? "input-field--invalid" : "", className].filter(Boolean).join(" ");
  return (
    <select ref={ref} className={classes} {...props}>
      {children}
    </select>
  );
});

export default Select;
