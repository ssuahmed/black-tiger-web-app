"use client";

import { forwardRef, useState } from "react";

const PasswordInput = forwardRef(function PasswordInput(
  { className = "", invalid, disabled, id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const classes = ["input-field", invalid ? "input-field--invalid" : "", className].filter(Boolean).join(" ");

  return (
    <div className="password-field">
      <input
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        className={classes}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <EyeOffGlyph /> : <EyeGlyph />}
      </button>
    </div>
  );
});

export default PasswordInput;

function EyeGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden width="20" height="20">
      <path
        d="M2.5 12C4.2 8.5 7.6 6 12 6s7.8 2.5 9.5 6c-1.7 3.5-5.1 6-9.5 6s-7.8-2.5-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden width="20" height="20">
      <path
        d="M3 3l18 18M9.9 9.9A2.75 2.75 0 0 0 14.1 14.1M7.1 7.3C5.1 8.4 3.6 10.1 2.5 12c1.7 3.5 5.1 6 9.5 6 1.6 0 3.1-.3 4.4-.9M10.6 6.2C11 6.1 11.5 6 12 6c4.4 0 7.8 2.5 9.5 6-.5 1-.1 2.1-1.6 3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
