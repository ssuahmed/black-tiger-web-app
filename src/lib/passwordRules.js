/** Display copy aligned to auth design (API codes stay the source of truth). */
export const PASSWORD_RULE_LABELS = {
  MIN_LENGTH: "8 characters",
  SPECIAL_CHAR: "1 special character (Example: # $ @ & ? )",
  MIXED_CASE: "1 uppercase and 1 lowercase letter",
  DIGIT: "1 numerical digit",
};

/**
 * @param {string} password
 * @param {string} code
 */
export function passwordRulePasses(password, code) {
  const value = String(password ?? "");
  switch (code) {
    case "MIN_LENGTH":
      return value.length >= 8;
    case "SPECIAL_CHAR":
      return /[^A-Za-z0-9\s]/.test(value);
    case "MIXED_CASE":
      return /[A-Z]/.test(value) && /[a-z]/.test(value);
    case "DIGIT":
      return /\d/.test(value);
    default:
      return value.length >= 8;
  }
}

/**
 * @param {string} password
 * @param {Array<{ code: string; label?: string; required?: boolean }>} rules
 */
export function evaluatePasswordRules(password, rules = []) {
  return rules.map((rule) => ({
    ...rule,
    label: PASSWORD_RULE_LABELS[rule.code] || rule.label || rule.code,
    met: passwordRulePasses(password, rule.code),
  }));
}

/**
 * @param {string} password
 * @param {Array<{ code: string; required?: boolean }>} rules
 */
export function passwordMeetsPolicy(password, rules = []) {
  const required = rules.filter((r) => r.required !== false);
  if (!required.length) return String(password ?? "").length >= 8;
  return required.every((rule) => passwordRulePasses(password, rule.code));
}
