const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
export const DEMO_EMAIL = process.env.AUTH_DEMO_EMAIL || "demo@blacktiger.com.sa";
export const DEMO_PASSWORD = process.env.AUTH_DEMO_PASSWORD || "Password1!";

/**
 * Sign in via Commerce API and seed localStorage before the app bootstraps auth.
 * @param {import("@playwright/test").Page} page
 */
export async function loginViaApi(page) {
  const res = await page.request.post(`${API_BASE}/auth/login`, {
    data: { identifier: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  if (!res.ok()) {
    throw new Error(`auth login HTTP ${res.status()}: ${await res.text()}`);
  }
  const body = await res.json();
  const tokens = body?.data ?? body;
  if (!tokens?.accessToken || !tokens?.refreshToken || !tokens?.user) {
    throw new Error(`auth login missing tokens: ${JSON.stringify(body)}`);
  }

  await page.addInitScript((session) => {
    window.localStorage.setItem("bt_access_token", session.accessToken);
    window.localStorage.setItem("bt_refresh_token", session.refreshToken);
    window.localStorage.setItem("bt_user", JSON.stringify(session.user));
  }, tokens);

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.localStorage.getItem("bt_access_token")));
}
