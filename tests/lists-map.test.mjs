import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeListItem, normalizeListSummary } from "../src/lib/lists/mapLists.mjs";

describe("normalizeListSummary", () => {
  it("maps list summary fields", () => {
    const row = normalizeListSummary({
      id: "list-1",
      name: "Favorites",
      description: "Oil picks",
      listType: "wishlist",
      itemCount: 3,
      previewImages: ["https://cdn.example.com/a.jpg"],
      isDefault: true,
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
    assert.equal(row.id, "list-1");
    assert.equal(row.name, "Favorites");
    assert.equal(row.itemCount, 3);
    assert.equal(row.previewImages.length, 1);
    assert.equal(row.isDefault, true);
  });
});

describe("normalizeListItem", () => {
  it("maps list item with product snapshot", () => {
    const row = normalizeListItem({
      id: "item-1",
      productSlug: "tiger-10w30-sl-fully-synthetic",
      packagingOptionId: "pkg-5",
      quantity: 2,
      productSnapshot: { name: "TIGER 10W30", imageUrl: "https://cdn.example.com/t.jpg" },
      availability: { inStock: true },
    });
    assert.equal(row.productSlug, "tiger-10w30-sl-fully-synthetic");
    assert.equal(row.productName, "TIGER 10W30");
    assert.equal(row.inStock, true);
  });
});
