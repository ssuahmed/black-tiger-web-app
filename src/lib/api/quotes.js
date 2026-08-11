/**
 * Quote creation and PDF download against the Commerce API (`/v1/quotes/*`).
 * PDF binary download uses raw `fetch` (not commerceFetch) because the response is a blob, not a JSON envelope.
 */

import { commerceFetch, getCommerceApiBaseUrl } from "./client.js";
import { readAccessToken } from "../authStorage.js";
import { downloadBase64Pdf } from "../downloadPdf.js";

/** @param {{ cartId: string; notes?: string; purchaseOrderNumber?: string }} body */
export function createQuote(body) {
  return commerceFetch("quotes", { method: "POST", json: body });
}

export function getQuote(quoteId) {
  return commerceFetch(`quotes/${encodeURIComponent(quoteId)}`, { method: "GET" });
}

/**
 * Create a quote from the cart and download the PDF.
 * Prefers pdfBase64 from the create response; falls back to GET /quotes/:id/pdf.
 * @param {{ cartId: string; notes?: string; purchaseOrderNumber?: string }} body
 */
export async function createQuoteAndDownloadPdf(body) {
  const result = await createQuote(body);
  const fileName = String(result?.fileName || `black-tiger-quote-${result?.quoteId || "quote"}.pdf`);
  if (result?.pdfBase64) {
    downloadBase64Pdf(String(result.pdfBase64), fileName);
    return result;
  }
  if (result?.quoteId) {
    await downloadQuotePdf(String(result.quoteId), fileName);
  }
  return result;
}

/**
 * @param {string} quoteId
 * @param {string} [fileName]
 */
export async function downloadQuotePdf(quoteId, fileName) {
  const base = getCommerceApiBaseUrl();
  const token = typeof window !== "undefined" ? readAccessToken() : null;
  const res = await fetch(`${base}/quotes/${encodeURIComponent(quoteId)}/pdf`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Could not download quote PDF (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || `black-tiger-quote-${quoteId}.pdf`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
