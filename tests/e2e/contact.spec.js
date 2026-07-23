import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("submits inquiry to commerce API", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });
    await page.getByLabel(/^name$/i).fill("E2E Contact");
    await page.getByLabel(/^company$/i).fill("Black Tiger QA");
    await page.getByLabel(/^email$/i).fill(`e2e-contact-${Date.now()}@example.com`);
    await page.getByLabel(/^phone number$/i).fill("+966500000001");
    await page.getByLabel(/^address$/i).fill("3462 Old Al-Kharj Road");
    await page.getByLabel(/^city$/i).fill("Riyadh");
    await page.locator('select[name="country"]').selectOption("SA");
    await page.getByLabel(/^message$/i).fill("Playwright contact smoke");
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText(/inquiry has been received/i)).toBeVisible({ timeout: 15_000 });
  });
});
