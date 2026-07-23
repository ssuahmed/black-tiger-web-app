import { test, expect } from "@playwright/test";

const PLP_PATH = process.env.PLP_PATH || "/products/commercial";

test.describe("Category PLP UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PLP_PATH, { waitUntil: "networkidle" });
  });

  test("renders category heading and product cards from live API", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    const productLinks = page.locator('a[href*="/products/tiger"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 20_000 });
    const count = await productLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    await expect(page.getByText(/SAR|From/i).first()).toBeVisible();
  });

  test("shows breadcrumbs and facet sidebar", async ({ page }) => {
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    const facetPanel = page.locator("aside, [class*='sidebar']").first();
    await expect(facetPanel).toBeVisible();
  });

  test("facet filter shows active chip", async ({ page }) => {
    const checkbox = page.getByRole("checkbox").first();
    const visible = await checkbox.isVisible().catch(() => false);
    if (!visible) test.skip();

    await checkbox.check();
    await expect(page.getByText("Clear all filters")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("no horizontal page overflow", async ({ page }) => {
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });

  test("responsive layout keeps product links visible", async ({ page, viewport }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const productLink = page.locator('a[href*="/products/tiger"]').first();
    await expect(productLink).toBeVisible();

    if (viewport && viewport.width < 500) {
      const box = await productLink.boundingBox();
      expect(box?.width).toBeGreaterThan(20);
    }
  });
});
