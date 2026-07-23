#!/usr/bin/env node
/**
 * Milestone 3 regression orchestrator — runs web contract/unit suites and writes a markdown report.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const API_BASE_RAW = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
/** Contract/e2e suites expect /v1; health/ready live on API root. */
const API_V1 = API_BASE_RAW.endsWith("/v1") ? API_BASE_RAW : `${API_BASE_RAW}/v1`;
const API_ROOT = API_V1.replace(/\/v1$/, "");
const WEB_BASE = (process.env.WEB_BASE || "http://localhost:3000").replace(/\/$/, "");
const reportPath =
  process.env.M3_REPORT_PATH ||
  join(process.cwd(), "..", "material", "delivery-docs", "milestone-3", "MILESTONE_3_REGRESSION_REPORT.md");

const suites = [
  { id: "D", name: "Web shop", cmd: "npm", args: ["run", "test:shop"] },
  { id: "E", name: "Web PLP", cmd: "npm", args: ["run", "test:plp"] },
  { id: "F", name: "Web cart", cmd: "npm", args: ["run", "test:cart"] },
  { id: "G", name: "Web auth", cmd: "npm", args: ["run", "test:auth"] },
  { id: "H", name: "Web account", cmd: "npm", args: ["run", "test:account"] },
  { id: "I", name: "Web checkout", cmd: "npm", args: ["run", "test:checkout"] },
  { id: "J", name: "Web lists", cmd: "npm", args: ["run", "test:lists"] },
  { id: "K1", name: "Contact contract", cmd: "node", args: ["tests/contact-api.contract.mjs"] },
];

/** @param {string} url */
async function probe(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

function runSuite(suite) {
  const started = Date.now();
  const result = spawnSync(suite.cmd, suite.args, {
    cwd: process.cwd(),
    shell: process.platform === "win32",
    encoding: "utf8",
    env: { ...process.env, API_BASE: API_V1, WEB_BASE },
  });
  return {
    ...suite,
    pass: result.status === 0,
    durationMs: Date.now() - started,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const apiHealthy = await probe(`${API_ROOT}/health`);
  const webHealthy = await probe(WEB_BASE);

  const results = suites.map(runSuite);
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  const lines = [
    "# Milestone 3 Regression Report",
    "",
    "## Executive summary",
    "",
    `- **Run at:** ${startedAt}`,
    `- **API health (${API_ROOT}/health):** ${apiHealthy ? "OK" : "UNREACHABLE"}`,
    `- **Web health (${WEB_BASE}):** ${webHealthy ? "OK" : "UNREACHABLE"}`,
    `- **Automated web suites:** ${passed}/${results.length} passed`,
    "",
    "## Matrix",
    "",
    "| # | Suite | Result | Duration |",
    "|---|-------|--------|----------|",
    ...results.map(
      (r) => `| ${r.id} | ${r.name} | ${r.pass ? "PASS" : "FAIL"} | ${(r.durationMs / 1000).toFixed(1)}s |`,
    ),
    "",
    "## Known deferrals",
    "",
    "- Live payment gateway credentials (HyperPay/PayTabs/Moyasar) — sandbox adapter only (Q-01).",
    "- Quotes pricing desk UI — B2B/future scope.",
    "",
  ];

  for (const r of results.filter((x) => !x.pass)) {
    lines.push(`### Failed: ${r.name}`, "", "```", r.output.slice(-2000), "```", "");
  }

  writeFileSync(reportPath, lines.join("\n"));
  console.log(`Report written to ${reportPath}`);
  console.log(`\n--- Summary: ${passed} passed, ${failed} failed ---`);
  process.exitCode = failed > 0 || !apiHealthy ? 1 : 0;
}

main();
