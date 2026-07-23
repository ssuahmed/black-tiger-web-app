import { describe, it } from "node:test";
import assert from "node:assert/strict";

/** Mirrors src/lib/cart/cartErrors.js for node:test (Next bundles the source file separately). */
function isCartNotFoundError(err) {
  if (!err || typeof err !== "object") return false;
  const e = /** @type {{ name?: string; status?: number; message?: string }} */ (err);
  if (e.name !== "CommerceApiError") return false;
  if (e.status === 404) return true;
  const msg = String(e.message ?? "").toLowerCase();
  return msg.includes("cart not found");
}

function apiError(message, status) {
  const err = new Error(message);
  err.name = "CommerceApiError";
  err.status = status;
  return err;
}

describe("isCartNotFoundError", () => {
  it("detects 404 cart errors", () => {
    assert.equal(isCartNotFoundError(apiError("Cart not found", 404)), true);
    assert.equal(isCartNotFoundError(apiError("Not found", 404)), true);
  });

  it("ignores other errors", () => {
    assert.equal(isCartNotFoundError(apiError("Forbidden", 403)), false);
    assert.equal(isCartNotFoundError(new Error("Cart not found")), false);
    assert.equal(isCartNotFoundError(null), false);
  });
});
