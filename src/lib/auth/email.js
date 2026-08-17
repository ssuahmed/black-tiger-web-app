/**
 * Auth identifier validation for sign-in / sign-up forms (email vs GCC mobile dial rules).
 * Kept client-side for immediate UX; the Commerce API still validates on submit.
 */

/** Practical email check aligned with common HTML5 / signup expectations. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/** National length after stripping a leading trunk `0` (E.164 subscriber number). */
const DIAL_NATIONAL_LENGTH = {
  "+966": 9, // SA mobile 5xxxxxxxx
  "+971": 9, // AE
  "+965": 8, // KW
  "+973": 8, // BH
  "+974": 8, // QA
  "+968": 8, // OM
  "+20": 10, // EG
  "+92": 10, // PK mobile 3xxxxxxxxx
};

/**
 * @param {string} value
 */
export function isValidEmail(value) {
  const email = String(value ?? "").trim();
  if (!email || email.length > 254) return false;
  if (email.includes("..")) return false;
  return EMAIL_PATTERN.test(email);
}

/**
 * Signup is email-only — treat digit-led values (e.g. Saudi `0…`) as phone attempts.
 * @param {string} value
 */
export function looksLikePhoneSignupAttempt(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed.includes("@")) return false;
  return /^[0-9+]/.test(trimmed);
}

/**
 * @param {string} value
 * @returns {string} Empty string when valid / still empty; otherwise an error message.
 */
export function validateSignupEmail(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  if (looksLikePhoneSignupAttempt(trimmed)) {
    return "You can only sign up with an email address.";
  }
  if (!isValidEmail(trimmed)) {
    return "Enter a valid email address.";
  }
  return "";
}

/**
 * @param {string} dialCode
 * @param {string} national
 * @returns {string} Empty when valid; otherwise an error message.
 */
export function validateLoginPhone(dialCode, national) {
  const digits = String(national ?? "").replace(/\D/g, "");
  if (!digits) return "Enter your mobile number.";

  const rest = digits.replace(/^0+/, "");
  if (!rest) return "Enter a valid mobile number.";

  const dial = String(dialCode || "+966").trim() || "+966";
  const expected = DIAL_NATIONAL_LENGTH[dial];

  if (expected != null && rest.length !== expected) {
    return `Enter a valid ${expected}-digit mobile number.`;
  }
  if (expected == null && (rest.length < 8 || rest.length > 12)) {
    return "Enter a valid mobile number.";
  }

  // Saudi mobiles start with 5
  if (dial === "+966" && !rest.startsWith("5")) {
    return "Enter a valid Saudi mobile number.";
  }

  return "";
}

/**
 * Login accepts email or mobile.
 * @param {string} value
 * @param {string} [dialCode]
 * @returns {string} Empty when valid; otherwise an error message.
 */
export function validateLoginIdentifier(value, dialCode = "+966") {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "Enter your email or mobile number.";

  if (looksLikePhoneSignupAttempt(trimmed)) {
    return validateLoginPhone(dialCode, trimmed);
  }

  if (!isValidEmail(trimmed)) {
    return "Enter a valid email address.";
  }
  return "";
}
