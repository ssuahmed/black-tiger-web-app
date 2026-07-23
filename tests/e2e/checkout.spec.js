import { test, expect } from "@playwright/test";
import { loginViaApi } from "./helpers/auth.js";
import {
  seedCartWithItemViaApi,
  seedCheckoutAddressViaApi,
  seedCheckoutShippingViaApi,
} from "./helpers/checkout.js";

const PDP_PATH = process.env.PDP_PATH || "/products/tiger-10w30-sl-fully-synthetic";

test.describe("Checkout flow", () => {
  test("completes cart checkout through payment", async ({ page }) => {
    await loginViaApi(page);
    await seedCartWithItemViaApi(page);
    await expect(page.getByText(/TIGER 10W30/i).first()).toBeVisible({ timeout: 15_000 });

    await seedCheckoutAddressViaApi(page);
    await seedCheckoutShippingViaApi(page);

    await page.goto("/cart/payment", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Payment", exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/shipping:/i)).toBeVisible();
    await page.getByRole("button", { name: /place order/i }).click();
    await expect(page.getByText(/order placed/i)).toBeVisible({ timeout: 25_000 });
  });

  test("walks shipping UI after address is saved", async ({ page }) => {
    await loginViaApi(page);
    await seedCartWithItemViaApi(page);
    await seedCheckoutAddressViaApi(page);

    await page.goto("/cart/shipping", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /^shipping method$/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("AI Partial Pallet Optimizer")).toBeVisible();
    await expect(page.getByText("Shipping efficiency", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^next$/i }).click();
    await expect(page).toHaveURL(/\/cart\/payment/, { timeout: 20_000 });
  });

  test("redirects payment step when checkout incomplete", async ({ page }) => {
    await loginViaApi(page);
    await page.goto("/cart/payment", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/cart(\/(shipping|address))?$/, { timeout: 20_000 });
  });

  test("recovers stale cart id during checkout", async ({ page }) => {
    await loginViaApi(page);

    await page.evaluate(() => {
      window.localStorage.setItem("bt_cart_id", "stale-cart-id-checkout");
    });

    await page.goto(PDP_PATH, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 15_000 });

    await page.goto("/cart", { waitUntil: "networkidle" });
    await expect(page.getByText(/TIGER 10W30/i).first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole("link", { name: /check out/i }).click();
    await expect(page).toHaveURL(/\/cart\/address/, { timeout: 15_000 });
  });
});
