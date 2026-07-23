import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatAccountDate,
  formatAddressPreview,
  formatOrderStatus,
  normalizeOrderRow,
  prefillAddressFormFromAccount,
} from "../src/lib/account/mapAccount.mjs";

describe("normalizeOrderRow", () => {
  it("maps API order fields", () => {
    const row = normalizeOrderRow({
      id: "o1",
      orderNumber: "BT-M1-1001",
      status: "draft",
      createdAt: "2026-01-15T10:00:00.000Z",
      itemCount: 2,
      formattedTotal: "1,250 SAR",
    });
    assert.equal(row.orderNumber, "BT-M1-1001");
    assert.equal(row.status, "Draft");
    assert.equal(row.itemCount, 2);
    assert.equal(row.formattedTotal, "1,250 SAR");
  });
});

describe("formatAddressPreview", () => {
  it("joins address parts", () => {
    const preview = formatAddressPreview({
      addressLine1: "1 King Fahd Road",
      city: "Riyadh",
      postalCode: "11564",
      countryCode: "SA",
    });
    assert.match(preview, /1 King Fahd Road/);
    assert.match(preview, /Riyadh/);
  });
});

describe("prefillAddressFormFromAccount", () => {
  it("maps saved address into checkout form", () => {
    const base = {
      contact: { email: "", marketingOptIn: true },
      delivery: { label: "Deliver to Home", addressPreview: "Old", recipientId: "mohammed" },
      recipients: [],
      accountType: "business",
      business: {
        country: "Saudi Arabia",
        organizationName: "",
        street: "",
        secondary: "",
        district: "",
        postalCode: "",
        city: "Riyadh",
        phone: "",
      },
    };
    const next = prefillAddressFormFromAccount(base, {
      label: "Office",
      addressLine1: "3462 Old Al-Kharj Road",
      city: "Riyadh",
      postalCode: "11564",
      countryCode: "SA",
      companyName: "Black Tiger",
      phone: "+966500000000",
    });
    assert.equal(next.delivery.label, "Office");
    assert.match(next.delivery.addressPreview, /3462 Old Al-Kharj Road/);
    assert.equal(next.business.organizationName, "Black Tiger");
    assert.equal(next.business.phone, "+966500000000");
  });
});

describe("formatOrderStatus", () => {
  it("title-cases underscored statuses", () => {
    assert.equal(formatOrderStatus("awaiting_payment"), "Awaiting Payment");
  });
});

describe("formatAccountDate", () => {
  it("returns dash for missing date", () => {
    assert.equal(formatAccountDate(null), "—");
  });
});
