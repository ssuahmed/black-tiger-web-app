import { test, expect } from "@playwright/test";
import { loginViaApi } from "./helpers/auth.js";

test.describe("Account lists", () => {
  test("creates and shows a saved list", async ({ page }) => {
    await loginViaApi(page);
    await page.goto("/account/lists", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /^lists$/i })).toBeVisible();
    const listName = `E2E List ${Date.now()}`;
    await page.getByPlaceholder("List name").fill(listName);
    await page.getByRole("button", { name: /create list/i }).click();
    await expect(page.getByRole("heading", { name: listName, level: 3 })).toBeVisible({ timeout: 15_000 });
  });
});
