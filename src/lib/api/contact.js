/**
 * Contact form submission against the Commerce API (`/v1/contact/inquiries`).
 */

import { commerceFetch } from "./client.js";

/** @param {Record<string, unknown>} body */
export function submitContactInquiry(body) {
  return commerceFetch("contact/inquiries", { method: "POST", json: body });
}
