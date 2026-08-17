/**
 * Phone identifier helpers for the auth UI: dial-code list, national sanitization,
 * and E.164 composition before calling `/v1/auth/*`.
 */

/** Dial codes shown in the sign-in phone field (noon-style). */
export const AUTH_DIAL_CODES = [
  { code: "SA", dial: "+966", label: "Saudi Arabia" },
  { code: "AE", dial: "+971", label: "United Arab Emirates" },
  { code: "KW", dial: "+965", label: "Kuwait" },
  { code: "BH", dial: "+973", label: "Bahrain" },
  { code: "QA", dial: "+974", label: "Qatar" },
  { code: "OM", dial: "+968", label: "Oman" },
  { code: "EG", dial: "+20", label: "Egypt" },
  { code: "PK", dial: "+92", label: "Pakistan" },
];

export const DEFAULT_DIAL_CODE = "+966";

/**
 * Phone UI when the value starts with a digit (e.g. Saudi local `0…`) and is not an email.
 * @param {string} value
 */
export function isPhoneIdentifierMode(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed.includes("@")) return false;
  return /^[0-9+]/.test(trimmed);
}

/**
 * Keep national digits (and a leading + only while parsing); strip other chars.
 * @param {string} value
 */
export function sanitizeNationalNumber(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

/**
 * Compose E.164-style identifier for the auth API.
 * Local numbers starting with 0 drop the trunk prefix (e.g. 05… → +9665…).
 * @param {string} dialCode
 * @param {string} national
 */
export function composePhoneIdentifier(dialCode, national) {
  const digits = sanitizeNationalNumber(national);
  if (!digits) return "";
  if (String(national ?? "").trim().startsWith("+")) {
    return `+${digits}`;
  }
  const rest = digits.replace(/^0+/, "");
  // Incomplete local entry (e.g. only "0") — not a submitable number yet
  if (!rest) return "";
  const dial = String(dialCode || DEFAULT_DIAL_CODE).trim() || DEFAULT_DIAL_CODE;
  return `${dial}${rest}`;
}

/**
 * If the user pastes a full international number, split into dial + national when possible.
 * @param {string} raw
 * @returns {{ dialCode: string, national: string } | null}
 */
export function splitInternationalPhone(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed.startsWith("+")) return null;
  const digits = trimmed.slice(1).replace(/\D/g, "");
  if (!digits) return null;

  const sorted = [...AUTH_DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const item of sorted) {
    const dialDigits = item.dial.replace(/\D/g, "");
    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length) {
      return { dialCode: item.dial, national: digits.slice(dialDigits.length) };
    }
  }
  return { dialCode: DEFAULT_DIAL_CODE, national: digits };
}
