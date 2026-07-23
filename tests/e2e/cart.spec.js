import { test, expect } from "@playwright/test";

const PDP_PATH = process.env.PDP_PATH || "/products/tiger-10w30-sl-fully-synthetic";

test.describe("Cart UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PDP_PATH, { waitUntil: "networkidle" });
  });

  test("adds product from PDP and shows line on cart page", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    await expect(addBtn).toBeVisible({ timeout: 20_000 });
    await addBtn.click();

    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 15_000 });

    await page.goto("/cart", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/TIGER 10W30/i).first()).toBeVisible();
    await expect(page.getByText(/subtotal/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /check out/i })).toBeVisible();
  });

  test("cart summary omits mock pallet table on cart step", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    await expect(addBtn).toBeVisible({ timeout: 20_000 });
    await addBtn.click();
    await page.goto("/cart", { waitUntil: "networkidle" });

    await expect(page.getByText("AI Partial Pallet Optimizer")).toHaveCount(0);
    await expect(page.getByText(/subtotal/i).first()).toBeVisible();
  });

  test("no horizontal page overflow on cart", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    const visible = await addBtn.isVisible().catch(() => false);
    if (visible) await addBtn.click();

    await page.goto("/cart", { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });

  test("recovers from stale cart id in localStorage", async ({ page }) => {
    await page.evaluate(() => {
      window.localStorage.setItem("bt_cart_id", "stale-cart-id-00000000");
    });
    await page.reload({ waitUntil: "networkidle" });

    const addBtn = page.getByRole("button", { name: /add to cart/i });
    await expect(addBtn).toBeVisible({ timeout: 20_000 });
    await addBtn.click();

    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/cart not found/i)).toHaveCount(0);
  });
});
