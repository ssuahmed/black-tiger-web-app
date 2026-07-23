/**
 * @param {string} apiBase
 */
export function createApiJson(apiBase) {
  const base = apiBase.replace(/\/$/, "");

  return async function apiJson(path, opts = {}) {
    const { headers: hdrs, ...rest } = opts;
    const res = await fetch(`${base}${path}`, {
      ...rest,
      headers: { "Content-Type": "application/json", ...(hdrs ?? {}) },
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    return { ok: res.ok, status: res.status, json };
  };
}

/** @param {unknown} body */
export function data(body) {
  return /** @type {Record<string, unknown>} */ (body)?.data ?? body;
}
