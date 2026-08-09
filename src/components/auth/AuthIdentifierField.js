"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronIcon, FormField, Input } from "@/components/ui";
import {
  AUTH_DIAL_CODES,
  DEFAULT_DIAL_CODE,
  composePhoneIdentifier,
  isPhoneIdentifierMode,
  sanitizeNationalNumber,
  splitInternationalPhone,
} from "@/lib/auth/phoneIdentifier";

/**
 * Email / mobile identifier that switches to a noon-style phone field when the
 * value starts with a digit (e.g. Saudi local `0…`).
 * The trigger digit is not carried into the phone field; Backspace on an empty
 * phone field returns to email mode.
 *
 * @param {{
 *   id: string;
 *   value: string;
 *   dialCode?: string;
 *   onChange: (next: { value: string; dialCode: string; mode: 'email' | 'phone' }) => void;
 *   emailLabel?: string;
 *   phoneLabel?: string;
 *   placeholder?: string;
 *   required?: boolean;
 *   disabled?: boolean;
 *   autoComplete?: string;
 *   error?: string;
 *   onBlur?: () => void;
 * }} props
 */
export default function AuthIdentifierField({
  id,
  value,
  dialCode = DEFAULT_DIAL_CODE,
  onChange,
  emailLabel = "Email or mobile",
  phoneLabel = "Phone Number",
  placeholder = "you@company.com",
  required = false,
  disabled = false,
  autoComplete = "username",
  error,
  onBlur,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const phoneInputRef = useRef(null);
  const [dialOpen, setDialOpen] = useState(false);
  /** Sticky phone UI even when national number is empty (after trigger digit). */
  const [phoneUi, setPhoneUi] = useState(false);
  const phoneMode = phoneUi || isPhoneIdentifierMode(value);

  useEffect(() => {
    if (!dialOpen) return undefined;
    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setDialOpen(false);
      }
    }
    function onKey(event) {
      if (event.key === "Escape") setDialOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [dialOpen]);

  useEffect(() => {
    if (!phoneMode) return;
    phoneInputRef.current?.focus();
  }, [phoneMode]);

  function emit(nextValue, nextDial = dialCode, modeOverride) {
    const mode =
      modeOverride ?? (isPhoneIdentifierMode(nextValue) || phoneUi ? "phone" : "email");
    onChange({ value: nextValue, dialCode: nextDial, mode });
  }

  function onEmailOrMixedChange(event) {
    const next = event.target.value;
    const split = splitInternationalPhone(next);
    if (split) {
      setPhoneUi(true);
      emit(split.national, split.dialCode, "phone");
      return;
    }
    if (isPhoneIdentifierMode(next)) {
      const digits = sanitizeNationalNumber(next);
      setPhoneUi(true);
      // Single trigger digit (e.g. "0") opens phone UI but is not carried over.
      // Multi-digit paste keeps the national number.
      emit(digits.length <= 1 ? "" : digits, dialCode, "phone");
      return;
    }
    setPhoneUi(false);
    emit(next, dialCode, "email");
  }

  function onNationalChange(event) {
    const raw = event.target.value;
    if (raw.includes("@")) {
      setPhoneUi(false);
      emit(raw, dialCode, "email");
      return;
    }
    emit(sanitizeNationalNumber(raw), dialCode, "phone");
  }

  function onNationalKeyDown(event) {
    if (event.key !== "Backspace") return;
    if (String(value ?? "").length > 0) return;
    // Empty phone field + Backspace → return to email
    event.preventDefault();
    setPhoneUi(false);
    setDialOpen(false);
    emit("", dialCode, "email");
  }

  function pickDial(nextDial) {
    emit(value, nextDial, "phone");
    setDialOpen(false);
  }

  if (!phoneMode) {
    return (
      <FormField id={id} label={emailLabel} required={required} variant="outlined" error={error}>
        <Input
          id={id}
          autoComplete={autoComplete}
          value={value}
          onChange={onEmailOrMixedChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="email"
        />
      </FormField>
    );
  }

  return (
    <div ref={rootRef} className="auth-identifier-phone">
      <FormField id={id} label={phoneLabel} required={required} variant="outlined" error={error}>
        <div className="phone-identifier">
          <button
            type="button"
            className="phone-identifier__dial"
            aria-haspopup="listbox"
            aria-expanded={dialOpen}
            aria-controls={listId}
            disabled={disabled}
            onClick={() => setDialOpen((open) => !open)}
          >
            <span className="phone-identifier__dial-code">{dialCode}</span>
            <ChevronIcon open={dialOpen} className="phone-identifier__chevron" />
          </button>
          <span className="phone-identifier__sep" aria-hidden />
          <input
            ref={phoneInputRef}
            id={id}
            className="input-field phone-identifier__input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={value}
            onChange={onNationalChange}
            onKeyDown={onNationalKeyDown}
            onBlur={onBlur}
            disabled={disabled}
            aria-label={phoneLabel}
            aria-invalid={error ? true : undefined}
          />
        </div>
      </FormField>
      {dialOpen ? (
        <ul id={listId} className="phone-identifier__menu" role="listbox" aria-label="Country code">
          {AUTH_DIAL_CODES.map((item) => {
            const selected = item.dial === dialCode;
            return (
              <li key={item.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={
                    selected
                      ? "phone-identifier__option phone-identifier__option--selected"
                      : "phone-identifier__option"
                  }
                  onClick={() => pickDial(item.dial)}
                >
                  <span>{item.label}</span>
                  <span className="phone-identifier__option-dial">{item.dial}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Resolve the identifier string sent to the auth API. */
export function resolveAuthIdentifier(value, dialCode) {
  if (isPhoneIdentifierMode(value)) {
    return composePhoneIdentifier(dialCode, value);
  }
  return String(value ?? "").trim();
}
