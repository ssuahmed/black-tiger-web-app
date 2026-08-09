/**
 * Trigger a browser download from a base64-encoded PDF.
 * @param {string} base64
 * @param {string} [fileName]
 */
export function downloadBase64Pdf(base64, fileName = "quote.pdf") {
  const raw = String(base64 || "").replace(/^data:application\/pdf;base64,/, "");
  if (!raw) return;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "quote.pdf";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
