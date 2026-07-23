import { test, expect } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD, loginViaApi } from "./helpers/auth.js";

test.describe("Auth UI", () => {
  test("redirects protected account route to sign-in", async ({ page }) => {
    await page.goto("/account/orders", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("password login reaches account and can sign out", async ({ page }) => {
    await page.goto("/sign-in", { waitUntil: "networkidle" });

    await page.getByLabel(/email or mobile/i).fill(DEMO_EMAIL);
    await page.getByRole("button", { name: /^continue$/i }).click();

    await page.getByRole("button", { name: /^password$/i }).click({ timeout: 15_000 });
    await page.locator("#pw").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page).toHaveURL(/\/account/, { timeout: 30_000 });
    await expect(page.getByText(DEMO_EMAIL)).toBeVisible();

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15_000 });
  });

  test("checkout address requires sign-in", async ({ page }) => {
    await page.goto("/cart/address", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 20_000 });
    expect(page.url()).toContain("returnTo");
  });

  test("API session reaches account lists", async ({ page }) => {
    await loginViaApi(page);
    await page.goto("/account/lists", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /^lists$/i })).toBeVisible({ timeout: 20_000 });
  });
});
