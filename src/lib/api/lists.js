import { buildQueryString, commerceFetch } from "./client.js";

/** @param {{ page?: number, pageSize?: number, sort?: string }} [params] */
export function listSavedLists(params) {
  return commerceFetch(`lists${buildQueryString(params || {})}`, { method: "GET" });
}

export function createSavedList(body) {
  return commerceFetch("lists", { method: "POST", json: body });
}

/** @param {string} listId @param {{ includeItems?: boolean }} [params] */
export function getSavedList(listId, params) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}${buildQueryString(params || {})}`, {
    method: "GET",
  });
}

export function updateSavedList(listId, body) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}`, { method: "PATCH", json: body });
}

export function deleteSavedList(listId) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}`, { method: "DELETE" });
}

/** @param {string} listId @param {{ page?: number, pageSize?: number }} [params] */
export function listSavedListItems(listId, params) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}/items${buildQueryString(params || {})}`, {
    method: "GET",
  });
}

export function addSavedListItem(listId, body) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}/items`, { method: "POST", json: body });
}

export function clearSavedListItems(listId) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}/items`, { method: "DELETE" });
}

export function bulkAddSavedListItems(listId, body) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}/items/bulk`, { method: "POST", json: body });
}

export function updateSavedListItem(listId, itemId, body) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    json: body,
  });
}

export function removeSavedListItem(listId, itemId) {
  return commerceFetch(`lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });
}

/** @param {string} listId @param {object} body @param {{ idempotencyKey?: string }} [opts] */
export function addListToCart(listId, body, opts = {}) {
  /** @type {RequestInit & { json?: unknown }} */
  const init = { method: "POST", json: body };
  if (opts.idempotencyKey) {
    init.headers = { "Idempotency-Key": opts.idempotencyKey };
  }
  return commerceFetch(`lists/${encodeURIComponent(listId)}/add-to-cart`, init);
}
