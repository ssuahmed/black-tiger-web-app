import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapApiCartTotals, mapApiLogistics, mapApiPromo, formatSarSymbol } from "../src/lib/cart/mapApiCart.mjs";
import { normalizeCheckoutTotals, normalizeShippingRecommendation } from "../src/lib/checkout/mapCheckout.mjs";

describe("mapApiCartTotals", () => {
  it("includes discount vat and grand total", () => {
    const totals = mapApiCartTotals({
      items: [{ id: "1", quantity: 2, unitPrice: 100, totalPrice: 200 }],
      totals: { subtotal: 200, discount: 20, vat: 27, shipping: 0, grandTotal: 207, itemCount: 2 },
    });
    assert.equal(totals.discount, 20);
    assert.equal(totals.vat, 27);
    assert.equal(totals.grandTotal, 207);
    assert.match(totals.formattedGrandTotal, /207/);
  });
});

describe("mapApiLogistics", () => {
  it("maps pallet breakdown", () => {
    const logistics = mapApiLogistics({
      fullPallets: 12,
      fullDrumPallets: 0,
      partialPallets: 1,
      totalPallets: 13,
      totalNetWeightKg: 10571,
      totalPalletsForShipping: 13,
    });
    assert.equal(logistics.totalPallets, 13);
    assert.equal(logistics.totalNetWeightKg, 10571);
  });
});

describe("mapApiPromo", () => {
  it("returns null without code", () => {
    assert.equal(mapApiPromo({}), null);
  });
  it("maps promo code", () => {
    const promo = mapApiPromo({ promo: { code: "WELCOME10", discount: 10, label: "Welcome" } });
    assert.equal(promo.code, "WELCOME10");
    assert.equal(promo.discount, 10);
  });
});

describe("normalizeShippingRecommendation", () => {
  it("includes palletBreakdown", () => {
    const rec = normalizeShippingRecommendation({
      efficiency: { score: 63 },
      message: "Add more",
      hints: [],
      lines: [],
      suggestedProducts: [],
      palletBreakdown: { fullPallets: 1, partialPallets: 1, totalPallets: 2 },
    });
    assert.equal(rec.score, 63);
    assert.equal(rec.palletBreakdown.totalPallets, 2);
  });
});

describe("normalizeCheckoutTotals", () => {
  it("reads discount and vat", () => {
    const totals = normalizeCheckoutTotals({
      totals: { subtotal: 100, discount: 10, vat: 13.5, shipping: 50, grandTotal: 153.5 },
    });
    assert.equal(totals.discount, 10);
    assert.equal(totals.vat, 13.5);
    assert.equal(totals.grandTotal, 153.5);
  });
});

describe("formatSarSymbol", () => {
  it("uses riyal symbol", () => {
    assert.match(formatSarSymbol(12.5), /\uFDFC/);
  });
});
