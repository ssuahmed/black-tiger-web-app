import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea({ className = "", invalid, ...props }, ref) {
  const classes = ["textarea-field", invalid ? "input-field--invalid" : "", className].filter(Boolean).join(" ");
  return <textarea ref={ref} className={classes} {...props} />;
});

export default Textarea;
