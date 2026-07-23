#!/usr/bin/env node
import assert from "node:assert/strict";
import { createApiJson, data } from "./helpers/api.mjs";

const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");

const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const apiJson = createApiJson(API_BASE);

async function testContactInquiry() {
  const res = await apiJson("/contact/inquiries", {
    method: "POST",
    body: JSON.stringify({
      title: "mr",
      name: "M3 Smoke",
      company: "Devtude QA",
      email: `contact-${Date.now()}@example.com`,
      phone: "+966500000001",
      address: "3462 Old Al-Kharj Road",
      city: "Riyadh",
      country: "SA",
      message: "Milestone 3 contact contract test",
      source: "contract-test",
    }),
  });
  assert.ok(res.ok, `HTTP ${res.status}`);
  const payload = data(res.json);
  assert.ok(typeof payload.inquiryId === "string", "inquiryId");
  record("POST /contact/inquiries", true, payload.inquiryId);
}

async function main() {
  try {
    await testContactInquiry();
  } catch (err) {
    record("POST /contact/inquiries", false, err instanceof Error ? err.message : String(err));
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`\n${failed.length} contact contract check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} contact contract checks passed.`);
}

main();
