import { commerceFetch } from "./client.js";

/** @param {{ cartId: string; notes?: string; purchaseOrderNumber?: string }} body */
export function createQuote(body) {
  return commerceFetch("quotes", { method: "POST", json: body });
}

export function getQuote(quoteId) {
  return commerceFetch(`quotes/${encodeURIComponent(quoteId)}`, { method: "GET" });
}
