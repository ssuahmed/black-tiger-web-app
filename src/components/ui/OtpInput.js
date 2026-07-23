"use client";

import { useCallback, useRef } from "react";

/** @param {{ value: string; onChange: (code: string) => void; length?: number; disabled?: boolean }} props */
export default function OtpInput({ value = "", onChange, length = 6, disabled, className = "" }) {
  const refs = useRef([]);
  /** @type {string[]} */
  const digits = [...String(value || "").padEnd(length, "").slice(0, length)];

  const focusAt = useCallback((i) => {
    const el = refs.current[i];
    el?.focus();
    el?.select?.();
  }, []);

  const commit = useCallback(
    /** @type {(nextDigits: string[]) => void} */ (nextDigits) => {
      onChange?.(nextDigits.join("").slice(0, length));
    },
    [length, onChange],
  );

  return (
    <div className={["otp-row", className].filter(Boolean).join(" ")} role="group" aria-label="One-time code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="otp-digit"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={d.trim() === "" ? "" : d}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            const next = [...digits];
            next[i] = v;
            commit(next);
            if (v && i < length - 1) focusAt(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              focusAt(i - 1);
            }
            if (e.key === "ArrowLeft" && i > 0) focusAt(i - 1);
            if (e.key === "ArrowRight" && i < length - 1) focusAt(i + 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!text) return;
            const next = [...digits];
            for (let j = 0; j < text.length && i + j < length; j += 1) {
              next[i + j] = text[j];
            }
            commit(next);
            focusAt(Math.min(i + text.length - 1, length - 1));
          }}
        />
      ))}
    </div>
  );
}
