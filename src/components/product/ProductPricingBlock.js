import PalletFigure from "@/components/product/PalletFigure";

/**
 * Bulk pricing table: banded title, an illustration cell spanning all rows,
 * and the numeric columns to its right.
 */
function PricingTable({ title, columns, rows, rowKeys, figure }) {
  if (!rows?.length) return null;

  return (
    <div className="pdp-table-wrap">
      <table className="pdp-table">
        <caption className="pdp-table__band">{title}</caption>
        <thead>
          <tr>
            <th className="pdp-table__figure-head" scope="col">
              <span className="sr-only">Packaging illustration</span>
            </th>
            {columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {i === 0 ? (
                <td className="pdp-table__figure" rowSpan={rows.length}>
                  <PalletFigure variant={figure} />
                </td>
              ) : null}
              {rowKeys.map((key) => (
                <td key={key}>{String(row[key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentLink({ title, url }) {
  return (
    <a className="pdp-doc" href={url} target="_blank" rel="noopener noreferrer">
      <svg className="pdp-doc__icon" viewBox="0 0 30 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M1 1h18l10 10v22H1z" fill="#fff" stroke="#c9ced6" strokeWidth="1.2" />
        <path d="M19 1v10h10" fill="#f1f3f5" stroke="#c9ced6" strokeWidth="1.2" />
        <rect x="1" y="18" width="22" height="11" rx="1.5" fill="var(--primary)" />
        <text
          x="12"
          y="26"
          textAnchor="middle"
          fill="#fff"
          fontSize="7.5"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          PDF
        </text>
      </svg>
      {title}
    </a>
  );
}

/** @param {{ product: Record<string, unknown> }} props */
export default function ProductPricingBlock({ product }) {
  const pricing = product?.pricing && typeof product.pricing === "object" ? product.pricing : {};
  const partial = pricing.partialPallet && typeof pricing.partialPallet === "object" ? pricing.partialPallet : null;
  const full = pricing.fullPallet && typeof pricing.fullPallet === "object" ? pricing.fullPallet : null;
  const documents = Array.isArray(product?.documents) ? product.documents : [];

  return (
    <div className="pdp-pricing">
      {partial ? (
        <>
          <PricingTable
            title={String(partial.title ?? "Price per Partial Pallet")}
            columns={partial.columns ?? ["Box QTY", "Unit Price", "EXT Price"]}
            rows={Array.isArray(partial.rows) ? partial.rows : []}
            rowKeys={["boxQty", "unitPrice", "extPrice"]}
            figure="boxes"
          />
          {partial.notice ? <p className="pdp-notice">{String(partial.notice)}</p> : null}
        </>
      ) : null}

      {full ? (
        <>
          <PricingTable
            title={String(full.title ?? "Price per Full Pallet")}
            columns={full.columns ?? ["Pallet QTY", "Box Per Pallet", "Total Box QTY", "Unit Price", "EXT Price"]}
            rows={Array.isArray(full.rows) ? full.rows : []}
            rowKeys={["palletQty", "boxPerPallet", "totalBoxQty", "unitPrice", "extPrice"]}
            figure="pallet"
          />
          {full.notice ? <p className="pdp-notice">{String(full.notice)}</p> : null}
        </>
      ) : null}

      {documents.length > 0 ? (
        <div className="pdp-docs">
          {documents.map((doc) => {
            const d = doc && typeof doc === "object" ? doc : {};
            return (
              <DocumentLink
                key={String(d.title ?? d.url)}
                title={String(d.title ?? "Download")}
                url={String(d.url ?? "#")}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
