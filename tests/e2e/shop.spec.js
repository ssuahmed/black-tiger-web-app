import { test, expect } from "@playwright/test";

test.describe("Shop → products redirect & catalog", () => {
  test("/shop redirects to /products", async ({ page }) => {
    await page.goto("/shop", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/products\/?$/);
  });

  test("/products renders products from live API", async ({ page }) => {
    await page.goto("/products", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });

    const productLinks = page.getByRole("link", { name: /^View / });
    await expect(productLinks.first()).toBeVisible({ timeout: 20_000 });
    expect(await productLinks.count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByText(/SAR|From/i).first()).toBeVisible();
  });

  test("no horizontal page overflow on /products", async ({ page }) => {
    await page.goto("/products", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });
});
