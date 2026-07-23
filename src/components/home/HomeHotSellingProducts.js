import SiteContainer from "@/components/layout/SiteContainer";
import RelatedProductsStrip from "@/components/product/RelatedProductsStrip";

/** Homepage product strip before footer — reuses PDP RelatedProductsStrip */
export default function HomeHotSellingProducts({ title = "Hot Selling Products", products = [] }) {
  if (!products.length) return null;

  return (
    <section className="w-full border-t border-neutral-300 bg-white" aria-label="Hot selling products">
      <SiteContainer className="py-[clamp(2rem,4vw,3rem)]">
        <RelatedProductsStrip
          products={products}
          title={title}
          headingId="hot-selling-heading"
          className="mt-0 border-t-0 pt-0"
        />
      </SiteContainer>
    </section>
  );
}
