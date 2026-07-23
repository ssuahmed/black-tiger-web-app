import { test, expect } from "@playwright/test";
import { DEMO_EMAIL, loginViaApi } from "./helpers/auth.js";

test.describe("Account UI", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page);
  });

  test("credits page shows balance from live API", async ({ page }) => {
    await page.goto("/account/credits", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /^credits$/i })).toBeVisible();
    await expect(page.getByText(/total credits/i)).toBeVisible();
    await expect(page.getByText(/SAR/i).first()).toBeVisible();
  });

  test("orders page renders table or empty state", async ({ page }) => {
    await page.goto("/account/orders", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /^orders$/i })).toBeVisible();
    const empty = page.getByText(/no orders yet/i);
    const table = page.getByRole("table");
    await expect(empty.or(table)).toBeVisible();
  });

  test("profile page loads editable fields", async ({ page }) => {
    await page.goto("/account/profile", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /^profile$/i })).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toHaveValue(DEMO_EMAIL);
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
  });

  test("account shell shows user email in sidebar", async ({ page }) => {
    await page.goto("/account/credits", { waitUntil: "networkidle" });
    await expect(page.getByText(DEMO_EMAIL)).toBeVisible();
  });
});
