import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  checkoutStepAllowed,
  normalizeCheckoutTotals,
  normalizeShippingOption,
  unwrapShippingOptionsPayload,
} from "../src/lib/checkout/mapCheckout.mjs";

describe("normalizeShippingOption", () => {
  it("maps shipping option price fields", () => {
    const row = normalizeShippingOption({
      id: "pallet-standard",
      label: "Standard pallet freight",
      etaDays: 5,
      price: { amount: 450, formatted: "450 SAR" },
      recommended: true,
    });
    assert.equal(row.id, "pallet-standard");
    assert.equal(row.priceAmount, 450);
    assert.equal(row.priceFormatted, "450 SAR");
    assert.equal(row.recommended, true);
  });
});

describe("unwrapShippingOptionsPayload", () => {
  it("reads options + recommendation envelope", () => {
    const payload = unwrapShippingOptionsPayload({
      options: [{ id: "a" }],
      recommendation: { message: "hi", efficiency: { score: 50 } },
    });
    assert.equal(payload.options.length, 1);
    assert.equal(payload.recommendation?.message, "hi");
  });
});

describe("normalizeCheckoutTotals", () => {
  it("reads summary totals", () => {
    const totals = normalizeCheckoutTotals({
      totals: {
        subtotal: 177,
        shipping: 450,
        grandTotal: 627,
        formattedGrandTotal: "627 SAR",
      },
    });
    assert.equal(totals.grandTotal, 627);
    assert.equal(totals.shipping, 450);
  });
});

describe("checkoutStepAllowed", () => {
  it("requires address before shipping and shipping before payment", () => {
    assert.equal(checkoutStepAllowed({ addressComplete: false }, "shipping"), false);
    assert.equal(checkoutStepAllowed({ addressComplete: true }, "shipping"), true);
    assert.equal(
      checkoutStepAllowed({ addressComplete: true, shippingComplete: false }, "payment"),
      false,
    );
    assert.equal(
      checkoutStepAllowed({ addressComplete: true, shippingComplete: true }, "payment"),
      true,
    );
  });
});
