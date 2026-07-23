"use client";

import ProductCard from "@/components/catalog/ProductCard";

/**
 * @param {{
 *   recommendation: {
 *     score: number;
 *     message: string;
 *     hints: string[];
 *     lines: Array<Record<string, unknown>>;
 *     suggestedProducts: Array<Record<string, unknown>>;
 *   } | null;
 * }} props
 */
export default function ShippingRecommendationPanel({ recommendation }) {
  if (!recommendation) return null;

  const score = Math.max(0, Math.min(100, Number(recommendation.score) || 0));

  return (
    <section className="mb-6 border border-neutral-300 bg-neutral-50 p-4" aria-label="Shipping efficiency">
      <h2 className="font-magistral m-0 mb-3 text-base font-bold">AI Partial Pallet Optimizer</h2>
      <div className="mb-3">
        <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold text-neutral-800">Shipping efficiency</span>
          <span className="font-mono font-bold text-neutral-900">{score}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden bg-neutral-200" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-neutral-900 transition-[width] duration-300" style={{ width: `${score}%` }} />
        </div>
      </div>
      {recommendation.message ? (
        <p className="m-0 mb-3 text-sm text-neutral-700">
          <span className="font-semibold">AI Shipping Recommendation: </span>
          {recommendation.message}
        </p>
      ) : null}
      {recommendation.hints?.length ? (
        <ul className="m-0 mb-4 list-disc space-y-1 pl-5 text-sm text-neutral-600">
          {recommendation.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      ) : null}
      {recommendation.lines?.length ? (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-300 text-neutral-500">
                <th className="py-2 pr-2 font-semibold">Product</th>
                <th className="py-2 pr-2 font-semibold">Type</th>
                <th className="py-2 pr-2 font-semibold">Qty</th>
                <th className="py-2 font-semibold">Fill</th>
              </tr>
            </thead>
            <tbody>
              {recommendation.lines.map((line) => (
                <tr key={String(line.lineId)} className="border-b border-neutral-200">
                  <td className="py-2 pr-2 text-neutral-900">{String(line.productName ?? line.productSlug)}</td>
                  <td className="py-2 pr-2 capitalize text-neutral-600">{String(line.palletType ?? "")}</td>
                  <td className="py-2 pr-2 text-neutral-600">{String(line.quantity ?? "")}</td>
                  <td className="py-2 font-mono text-neutral-900">{String(line.utilizationPct ?? 0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {recommendation.suggestedProducts?.length ? (
        <div>
          <h3 className="m-0 mb-2 text-sm font-semibold text-neutral-800">Suggested to improve fill</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recommendation.suggestedProducts.map((product) => (
              <ProductCard key={String(product.slug)} product={product} variant="compact" />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
