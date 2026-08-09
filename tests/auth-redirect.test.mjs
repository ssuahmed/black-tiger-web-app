import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeReturnPath } from "../src/lib/auth/authRedirect.mjs";

describe("safeReturnPath", () => {
  it("returns fallback for empty or external paths", () => {
    assert.equal(safeReturnPath(null), "/account/orders");
    assert.equal(safeReturnPath("https://evil.test"), "/account/orders");
    assert.equal(safeReturnPath("//evil.test"), "/account/orders");
  });

  it("blocks redirect loops through sign-in", () => {
    assert.equal(safeReturnPath("/sign-in"), "/account/orders");
    assert.equal(safeReturnPath("/sign-in?intent=login"), "/account/orders");
  });

  it("preserves valid internal paths", () => {
    assert.equal(safeReturnPath("/cart/address"), "/cart/address");
    assert.equal(safeReturnPath("/account/orders"), "/account/orders");
  });
});
