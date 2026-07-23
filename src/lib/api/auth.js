import { commerceFetch } from "./client.js";

export function getPasswordPolicy() {
  return commerceFetch("auth/password/policy", { method: "GET" });
}

export function submitIdentifier(body) {
  return commerceFetch("auth/identifier", { method: "POST", json: body });
}

export function registerWithPassword(body) {
  return commerceFetch("auth/register", { method: "POST", json: body });
}

export function loginWithPassword(body) {
  return commerceFetch("auth/login", { method: "POST", json: body });
}

export function sendOtp(body) {
  return commerceFetch("auth/otp/send", { method: "POST", json: body });
}

export function resendOtp(body) {
  return commerceFetch("auth/otp/resend", { method: "POST", json: body });
}

export function verifyOtp(body) {
  return commerceFetch("auth/otp/verify", { method: "POST", json: body });
}

export function forgotPassword(body) {
  return commerceFetch("auth/password/forgot", { method: "POST", json: body });
}

export function validateResetToken(token) {
  const q = new URLSearchParams({ token }).toString();
  return commerceFetch(`auth/password/reset/validate?${q}`, { method: "GET" });
}

export function resetPassword(body) {
  return commerceFetch("auth/password/reset", { method: "POST", json: body });
}

export function refreshTokens(body) {
  return commerceFetch("auth/refresh", { method: "POST", json: body });
}

export function logout() {
  return commerceFetch("auth/logout", { method: "POST" });
}
