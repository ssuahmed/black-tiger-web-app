export default function FormField({
  id: idProp,
  label,
  hint,
  hintAbove = false,
  error,
  required,
  children,
  className = "",
}) {
  const cid = idProp;
  const describedBy = [];
  if (hint) describedBy.push(`${cid}-hint`);
  if (error) describedBy.push(`${cid}-error`);
  const hintEl =
    hint && !error ? (
      <p id={`${cid}-hint`} className="form-hint">
        {hint}
      </p>
    ) : null;

  return (
    <div className={["form-field", className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={cid} className="form-label">
          {label}
          {required ? <span aria-hidden className="form-label__req">*</span> : null}
        </label>
      ) : null}
      {hintAbove ? hintEl : null}
      {children}
      {!hintAbove ? hintEl : null}
      {error ? (
        <p id={`${cid}-error`} className="form-error-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
