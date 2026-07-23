"use client";

import Alert from "@/components/ui/Alert";

export default function Form({ error, globalError: globalErrorAlt, children, className = "", ...props }) {
  const globalError = error ?? globalErrorAlt;
  return (
    <form className={["form-stack", className].filter(Boolean).join(" ")} {...props}>
      {globalError ? (
        <Alert variant="error" className="form-global-error">
          {globalError}
        </Alert>
      ) : null}
      {children}
    </form>
  );
}
