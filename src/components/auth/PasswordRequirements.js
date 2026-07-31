"use client";

import { evaluatePasswordRules } from "@/lib/passwordRules";

/**
 * Live password checklist matching the auth design.
 * @param {{ password: string; rules?: Array<{ code: string; label?: string; required?: boolean }>; className?: string }} props
 */
export default function PasswordRequirements({ password = "", rules = [], className = "" }) {
  const items = evaluatePasswordRules(password, rules);

  if (!items.length) return null;

  return (
    <div className={["password-reqs", className].filter(Boolean).join(" ")}>
      <p className="password-reqs__title">Your Password must have at least:</p>
      <ul className="password-reqs__list">
        {items.map((item) => (
          <li
            key={item.code}
            className={item.met ? "password-reqs__item password-reqs__item--met" : "password-reqs__item"}
          >
            <span className="password-reqs__icon" aria-hidden>
              <CheckGlyph />
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
      <path
        d="M3.5 8.2 6.4 11l6.1-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
