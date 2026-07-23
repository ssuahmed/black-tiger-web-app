import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeReturnPath } from "../src/lib/auth/authRedirect.mjs";

describe("safeReturnPath", () => {
  it("returns fallback for empty or external paths", () => {
    assert.equal(safeReturnPath(null), "/account");
    assert.equal(safeReturnPath("https://evil.test"), "/account");
    assert.equal(safeReturnPath("//evil.test"), "/account");
  });

  it("blocks redirect loops through sign-in", () => {
    assert.equal(safeReturnPath("/sign-in"), "/account");
    assert.equal(safeReturnPath("/sign-in?intent=login"), "/account");
  });

  it("preserves valid internal paths", () => {
    assert.equal(safeReturnPath("/cart/address"), "/cart/address");
    assert.equal(safeReturnPath("/account/orders"), "/account/orders");
  });
});
