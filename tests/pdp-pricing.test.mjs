import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scopePalletTables } from "../src/lib/catalog/pdpPricing.mjs";

const templatePricing = {
  partialPallet: { title: "Price Per Partial Pallet", rows: [{ boxQty: 2, unitPrice: "88.50 SAR" }] },
  fullPallet: { title: "Price Per Full Pallet", rows: [{ totalBoxQty: 48, unitPrice: "83.26 SAR" }] },
};

describe("scopePalletTables", () => {
  it("uses the selected variant tables", () => {
    const variant = {
      partialPallet: { rows: [{ boxQty: 2, unitPrice: "418.00 SAR" }] },
      fullPallet: { rows: [{ totalBoxQty: 24, unitPrice: "398.50 SAR" }] },
    };
    const out = scopePalletTables(variant, templatePricing);
    assert.equal(out.fullPallet.rows[0].unitPrice, "398.50 SAR");
    assert.equal(out.partialPallet.rows[0].unitPrice, "418.00 SAR");
  });

  it("drops a tier the selected variant does not have", () => {
    const variant = { partialPallet: { rows: [{ boxQty: 1, unitPrice: "2,650.00 SAR" }] } };
    const out = scopePalletTables(variant, templatePricing);
    assert.equal(out.fullPallet, null);
    assert.equal(out.partialPallet.rows[0].unitPrice, "2,650.00 SAR");
  });

  it("falls back to quote pricing when the variant carries no pricing", () => {
    const out = scopePalletTables(null, templatePricing);
    assert.equal(out.fullPallet.rows[0].unitPrice, "83.26 SAR");
    assert.equal(out.partialPallet.rows[0].boxQty, 2);
  });

  it("returns empty tiers when nothing is priced", () => {
    assert.deepEqual(scopePalletTables(null, null), { partialPallet: null, fullPallet: null });
  });
});
