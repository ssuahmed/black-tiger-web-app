import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  catalogDataSource,
  flattenCategorySlugs,
  normalizeBreadcrumbs,
  normalizeCategoryTree,
  normalizeProductList,
  plpHeroFromCategory,
} from "../src/lib/catalog/shopData.mjs";

describe("normalizeCategoryTree", () => {
  it("extracts categories and ignores dataSource", () => {
    const out = normalizeCategoryTree({
      dataSource: "odoo",
      categories: [{ slug: "products", name: "PRODUCTS", children: [] }],
    });
    assert.deepEqual(out, {
      categories: [{ slug: "products", name: "PRODUCTS", children: [] }],
    });
  });

  it("returns null for invalid payload", () => {
    assert.equal(normalizeCategoryTree(null), null);
    assert.equal(normalizeCategoryTree({}), null);
  });
});

describe("catalogDataSource", () => {
  it("reads odoo or mock", () => {
    assert.equal(catalogDataSource({ dataSource: "odoo" }), "odoo");
    assert.equal(catalogDataSource({ dataSource: "mock" }), "mock");
    assert.equal(catalogDataSource({ dataSource: "other" }), null);
  });
});

describe("normalizeProductList", () => {
  it("normalizes PLP payload shape", () => {
    const out = normalizeProductList({
      items: [{ slug: "tiger-x", name: "Tiger X" }],
      facets: [{ key: "viscosity", options: [] }],
      pagination: { total: 1, loaded: 1, hasMore: false, pageSize: 10, nextCursor: null },
    });
    assert.equal(out.items.length, 1);
    assert.equal(out.facets.length, 1);
    assert.equal(out.pagination.total, 1);
  });
});

describe("flattenCategorySlugs", () => {
  it("collects child category slugs", () => {
    const slugs = flattenCategorySlugs({
      categories: [
        {
          slug: "root",
          children: [{ slug: "commercial" }, { slug: "passenger-cars" }],
        },
      ],
    });
    assert.deepEqual(slugs, ["commercial", "passenger-cars", "root"]);
  });
});

describe("normalizeBreadcrumbs", () => {
  it("maps API breadcrumb rows", () => {
    const crumbs = normalizeBreadcrumbs([
      { label: "HOME", href: "/" },
      { label: "COMMERCIAL" },
    ]);
    assert.deepEqual(crumbs, [
      { label: "HOME", href: "/" },
      { label: "COMMERCIAL", href: undefined },
    ]);
  });
});

describe("plpHeroFromCategory", () => {
  it("builds hero props from category meta", () => {
    const hero = plpHeroFromCategory({
      name: "Commercial",
      banner: { eyebrow: "FLEET", backgroundImage: "/img.jpg" },
    });
    assert.equal(hero?.title, "Commercial");
    assert.equal(hero?.eyebrow, "FLEET");
    assert.equal(hero?.backgroundImage, "/img.jpg");
  });
});
