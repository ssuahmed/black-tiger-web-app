"use client";

import { useId } from "react";

/** @param {{ className?: string; label?: import('react').ReactNode; id?: string } & import('react').InputHTMLAttributes<HTMLInputElement>} props */
export default function Checkbox({ className = "", label, id: idProp, ...props }) {
  const gen = useId();
  const uid = typeof idProp === "string" ? idProp : `${gen}-chk`;
  return (
    <label htmlFor={uid} className={["checkbox-field", className].filter(Boolean).join(" ")}>
      <input id={uid} type="checkbox" className="checkbox-field__input" {...props} />
      {label ? <span className="checkbox-field__label">{label}</span> : null}
    </label>
  );
}
