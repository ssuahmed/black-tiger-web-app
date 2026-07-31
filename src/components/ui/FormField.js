import { cloneElement, isValidElement } from "react";

export default function FormField({
  id: idProp,
  label,
  hint,
  hintAbove = false,
  error,
  required,
  variant = "default",
  children,
  className = "",
}) {
  const cid = idProp;
  const describedBy = [];
  if (hint) describedBy.push(`${cid}-hint`);
  if (error) describedBy.push(`${cid}-error`);
  const describedByValue = describedBy.length ? describedBy.join(" ") : undefined;
  const outlined = variant === "outlined";

  const hintEl =
    hint && !error ? (
      <p id={`${cid}-hint`} className="form-hint">
        {hint}
      </p>
    ) : null;

  const labelEl = label ? (
    <label htmlFor={cid} className={outlined ? "outlined-field__label" : "form-label"}>
      {label}
      {required ? (outlined ? "*" : <span aria-hidden className="form-label__req">*</span>) : null}
    </label>
  ) : null;

  const enhanced =
    isValidElement(children)
      ? cloneElement(children, {
          ...(describedByValue
            ? {
                "aria-describedby": [children.props["aria-describedby"], describedByValue]
                  .filter(Boolean)
                  .join(" "),
              }
            : null),
          ...(error ? { "aria-invalid": true, invalid: true } : null),
        })
      : children;

  return (
    <div
      className={["form-field", outlined ? "form-field--outlined" : "", className].filter(Boolean).join(" ")}
    >
      {!outlined ? labelEl : null}
      {hintAbove ? hintEl : null}
      {outlined ? (
        <div className={error ? "outlined-field outlined-field--invalid" : "outlined-field"}>
          {enhanced}
          {labelEl}
        </div>
      ) : (
        enhanced
      )}
      {!hintAbove ? hintEl : null}
      {error ? (
        <p id={`${cid}-error`} className="form-error-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
