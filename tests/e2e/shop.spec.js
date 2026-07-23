import { test, expect } from "@playwright/test";

test.describe("Shop page UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shop", { waitUntil: "networkidle" });
  });

  test("renders hero, categories, and products from live API", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Product categories" })).toBeVisible();
    await expect(page.getByRole("button", { name: "All products" })).toBeVisible();

    const productLinks = page.getByRole("link", { name: "View" });
    await expect(productLinks.first()).toBeVisible({ timeout: 20_000 });
    const count = await productLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const firstCard = productLinks.first().locator("xpath=ancestor::article");
    await expect(firstCard.getByText(/SAR|From/i)).toBeVisible();
  });

  test("category filter updates product list", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Product categories" });
    const categoryButtons = nav.getByRole("button").filter({ hasNotText: "All products" });
    const n = await categoryButtons.count();
    if (n < 1) test.skip();

    const first = categoryButtons.first();
    const label = (await first.textContent())?.trim() ?? "";
    await first.click();

    await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "View" }).first()).toBeVisible({ timeout: 15_000 });
  });

  test("no horizontal page overflow", async ({ page }) => {
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });

  test("responsive layout keeps primary actions visible", async ({ page, viewport }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Product categories" })).toBeVisible();

    const viewLink = page.getByRole("link", { name: "View" }).first();
    await expect(viewLink).toBeVisible();

    if (viewport && viewport.width < 500) {
      const box = await viewLink.boundingBox();
      expect(box?.width).toBeGreaterThan(20);
    }
  });
});
