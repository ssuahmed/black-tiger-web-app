import { commerceFetch } from "./client.js";

/** @param {Record<string, unknown>} body */
export function submitContactInquiry(body) {
  return commerceFetch("contact/inquiries", { method: "POST", json: body });
}
