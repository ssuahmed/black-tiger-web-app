import ProductCard from "@/components/catalog/ProductCard";

/** @param {{ products?: Array<Record<string, unknown>>; title?: string; headingId?: string; className?: string }} props */
export default function RelatedProductsStrip({
  products = [],
  title = "You may also like",
  headingId = "related-heading",
  className = "",
}) {
  if (!products.length) return null;

  return (
    <section
      className={["mt-14 border-t border-neutral-300 pt-8 text-neutral-900", className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="font-magistral mb-6 text-xl font-light tracking-wide text-neutral-400"
      >
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
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