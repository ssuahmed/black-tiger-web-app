const CHALLENGE_KEY = "bt_otp_challenge_id";
const PURPOSE_KEY = "bt_otp_purpose";
const IDENTIFIER_KEY = "bt_auth_identifier";

export function stashOtpSession(challengeId, purpose, identifier) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHALLENGE_KEY, challengeId);
  sessionStorage.setItem(PURPOSE_KEY, purpose);
  sessionStorage.setItem(IDENTIFIER_KEY, identifier.trim());
}

export function readOtpSession() {
  if (typeof window === "undefined") {
    return { challengeId: "", purpose: "", identifier: "" };
  }
  return {
    challengeId: sessionStorage.getItem(CHALLENGE_KEY) ?? "",
    purpose: sessionStorage.getItem(PURPOSE_KEY) ?? "",
    identifier: sessionStorage.getItem(IDENTIFIER_KEY) ?? "",
  };
}

export function clearOtpSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHALLENGE_KEY);
  sessionStorage.removeItem(PURPOSE_KEY);
  sessionStorage.removeItem(IDENTIFIER_KEY);
}
