import ProductCard from "@/components/catalog/ProductCard";

/**
 * @param {{
 *   products?: Array<Record<string, unknown>>;
 *   title?: string;
 *   headingId?: string;
 *   flush?: boolean;
 *   className?: string;
 * }} props
 */
export default function RelatedProductsStrip({
  products = [],
  title = "You may also like",
  headingId = "related-heading",
  flush = false,
  className = "",
}) {
  if (!products.length) return null;

  return (
    <section
      className={["pdp-related", flush ? "pdp-related--flush" : "", className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="pdp-related__title">
        {title}
      </h2>
      <div className="pdp-related__grid">
        {products.map((raw) => {
          const p = raw && typeof raw === "object" ? raw : {};
          return (
            <ProductCard
              key={String(p.id ?? p.slug ?? p.name ?? "")}
              product={/** @type {Record<string, unknown>} */ (p)}
              variant="compact"
            />
          );
        })}
      </div>
    </section>
  );
}
