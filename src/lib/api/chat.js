import { commerceFetch } from "./client.js";

/**
 * @param {{ message: string; sessionId?: string; locale?: string }} body
 */
export function postChatMessage(body) {
  return commerceFetch("chat/messages", {
    method: "POST",
    json: body,
  });
}

/**
 * @param {{ locale?: string }} [body]
 */
export function createChatSession(body = {}) {
  return commerceFetch("chat/sessions", {
    method: "POST",
    json: body,
  });
}
