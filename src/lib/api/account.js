import { buildQueryString, commerceFetch } from "./client.js";

export function getAccountSummary() {
  return commerceFetch("account/summary", { method: "GET" });
}

export function getAccountProfile() {
  return commerceFetch("account/profile", { method: "GET" });
}

export function updateAccountProfile(body) {
  return commerceFetch("account/profile", { method: "PATCH", json: body });
}

/** @param {{ tab?: string, status?: string, page?: number, pageSize?: number }} [params] */
export function getAccountCredits(params) {
  return commerceFetch(`account/credits${buildQueryString(params || {})}`, { method: "GET" });
}

export function withdrawCredits(body) {
  return commerceFetch("account/credits/withdraw", { method: "POST", json: body });
}

/** @param {{ usage?: string, defaultsOnly?: boolean }} [params] */
export function listAccountAddresses(params) {
  return commerceFetch(`account/addresses${buildQueryString(params || {})}`, { method: "GET" });
}

export function createAccountAddress(body) {
  return commerceFetch("account/addresses", { method: "POST", json: body });
}

export function setDefaultAddress(addressId, type) {
  const qs = buildQueryString({ type });
  return commerceFetch(`account/addresses/${encodeURIComponent(addressId)}/set-default${qs}`, {
    method: "POST",
  });
}

export function updateAccountAddress(addressId, body) {
  return commerceFetch(`account/addresses/${encodeURIComponent(addressId)}`, { method: "PATCH", json: body });
}

export function deleteAccountAddress(addressId) {
  return commerceFetch(`account/addresses/${encodeURIComponent(addressId)}`, { method: "DELETE" });
}

export function listAccountContacts() {
  return commerceFetch("account/contacts", { method: "GET" });
}

export function getAccountContact(contactId) {
  return commerceFetch(`account/contacts/${encodeURIComponent(contactId)}`, { method: "GET" });
}

export function createAccountContact(body) {
  return commerceFetch("account/contacts", { method: "POST", json: body });
}

export function setDefaultContact(contactId, type) {
  const qs = buildQueryString({ type });
  return commerceFetch(`account/contacts/${encodeURIComponent(contactId)}/set-default${qs}`, {
    method: "POST",
  });
}

export function updateAccountContact(contactId, body) {
  return commerceFetch(`account/contacts/${encodeURIComponent(contactId)}`, { method: "PATCH", json: body });
}

export function deleteAccountContact(contactId) {
  return commerceFetch(`account/contacts/${encodeURIComponent(contactId)}`, { method: "DELETE" });
}

export function listPaymentMethods() {
  return commerceFetch("account/payment-methods", { method: "GET" });
}

export function getNotificationPreferences() {
  return commerceFetch("account/notifications", { method: "GET" });
}

export function updateNotificationPreferences(body) {
  return commerceFetch("account/notifications", { method: "PATCH", json: body });
}

export function getSecuritySettings() {
  return commerceFetch("account/security", { method: "GET" });
}

/** @param {{ page?: number, pageSize?: number }} [params] */
export function listAccountOrders(params) {
  return commerceFetch(`account/orders${buildQueryString(params || {})}`, { method: "GET" });
}

/** @param {{ page?: number }} [params] */
export function listAccountReturns(params) {
  return commerceFetch(`account/returns${buildQueryString(params || {})}`, { method: "GET" });
}

export function getBusinessAccount() {
  return commerceFetch("account/business", { method: "GET" });
}

export function getBusinessApplicationStatus() {
  return commerceFetch("account/business/status", { method: "GET" });
}

export function submitCreditApplication(body) {
  return commerceFetch("account/business/credit-application", { method: "POST", json: body });
}

/** @param {{ applicationId: string, documentType: string, file: File | Blob }} input */
export function uploadCreditApplicationDocument({ applicationId, documentType, file }) {
  const fd = new FormData();
  fd.set("documentType", documentType);
  fd.set("file", file);
  return commerceFetch(`account/business/credit-application/${encodeURIComponent(applicationId)}/documents`, {
    method: "POST",
    body: fd,
  });
}
