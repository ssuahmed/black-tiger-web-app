import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapApiCartLine, mapApiCartTotals } from "../src/lib/cart/mapApiCart.mjs";

describe("mapApiCartLine", () => {
  it("maps API line fields and pallet price note", () => {
    const line = mapApiCartLine({
      id: "line-1",
      productSlug: "tiger-10w30-sl-fully-synthetic",
      productName: "TIGER 10W30 SL Fully Synthetic",
      packagingLabel: "Box 1LX12",
      quantity: 3,
      palletType: "partial",
      unitPrice: 85,
      totalPrice: 255,
      imageUrl: "https://cdn.example.com/tiger.jpg",
    });
    assert.equal(line.id, "line-1");
    assert.equal(line.productSlug, "tiger-10w30-sl-fully-synthetic");
    assert.equal(line.name, "TIGER 10W30 SL Fully Synthetic");
    assert.equal(line.packagingLabel, "Box 1LX12");
    assert.equal(line.quantity, 3);
    assert.equal(line.unitPrice, 85);
    assert.equal(line.lineTotal, 255);
    assert.equal(line.priceNote, "Based on Partial Pallet Price");
    assert.equal(line.image.url, "https://cdn.example.com/tiger.jpg");
  });

  it("falls back to placeholder image when imageUrl missing", () => {
    const line = mapApiCartLine({ id: "x", productName: "Test" });
    assert.match(line.image.url, /placehold\.co/);
  });
});

describe("mapApiCartTotals", () => {
  it("sums quantities for itemCount and uses API subtotal", () => {
    const totals = mapApiCartTotals({
      items: [
        { id: "a", quantity: 2, unitPrice: 10, totalPrice: 20 },
        { id: "b", quantity: 5, unitPrice: 8, totalPrice: 40 },
      ],
      totals: { subtotal: 60 },
    });
    assert.equal(totals.subtotal, 60);
    assert.equal(totals.itemCount, 7);
    assert.equal(totals.totalInclVat, 60);
  });
});
