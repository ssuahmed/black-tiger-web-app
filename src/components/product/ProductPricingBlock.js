function PricingTable({ title, columns, rows, rowKeys }) {
  if (!rows?.length) return null;
  return (
    <section className="mb-8">
      <h2 className="m-0 mb-4 text-base font-bold">{title}</h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="border border-neutral-200 bg-neutral-100 px-2.5 py-2 text-left font-semibold text-neutral-600">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {rowKeys.map((key) => (
                <td key={key} className="border border-neutral-200 px-2.5 py-2 text-left">
                  {String(row[key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** @param {{ product: Record<string, unknown> }} props */
export default function ProductPricingBlock({ product }) {
  const pricing = product?.pricing && typeof product.pricing === "object" ? product.pricing : {};
  const partial = pricing.partialPallet && typeof pricing.partialPallet === "object" ? pricing.partialPallet : null;
  const full = pricing.fullPallet && typeof pricing.fullPallet === "object" ? pricing.fullPallet : null;
  const documents = Array.isArray(product?.documents) ? product.documents : [];

  return (
    <div className="mt-10 text-neutral-900">
      {partial ? (
        <>
          <PricingTable
            title={String(partial.title ?? "Price Per Partial Pallet")}
            columns={partial.columns ?? ["Box QTY", "Unit Price", "EXT Price"]}
            rows={Array.isArray(partial.rows) ? partial.rows : []}
            rowKeys={["boxQty", "unitPrice", "extPrice"]}
          />
          {partial.notice ? <p className="mt-3 mb-0 text-xs leading-snug text-neutral-600">{String(partial.notice)}</p> : null}
        </>
      ) : null}

      {full ? (
        <>
          <PricingTable
            title={String(full.title ?? "Price Per Full Pallet")}
            columns={full.columns ?? ["Pallet QTY", "Box Per Pallet", "Total Box QTY", "Unit Price", "EXT Price"]}
            rows={Array.isArray(full.rows) ? full.rows : []}
            rowKeys={["palletQty", "boxPerPallet", "totalBoxQty", "unitPrice", "extPrice"]}
          />
          {full.notice ? <p className="mt-3 mb-0 text-xs leading-snug text-neutral-600">{String(full.notice)}</p> : null}
        </>
      ) : null}

      {documents.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-6">
          {documents.map((doc) => {
            const d = doc && typeof doc === "object" ? doc : {};
            return (
              <a
                key={String(d.title)}
                href={String(d.url ?? "#")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:underline"
              >
                <span className="inline-flex size-5 items-center justify-center rounded-sm bg-primary text-xs font-bold text-white" aria-hidden>
                  PDF
                </span>
                {String(d.title ?? "Download")}
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
