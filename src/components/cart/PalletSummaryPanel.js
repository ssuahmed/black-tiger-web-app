/** @param {{ logistics: { fullPallets: number; fullDrumPallets: number; partialPallets: number; totalPallets: number; totalNetWeightKg: number; totalPalletsForShipping: number } }} props */
export default function PalletSummaryPanel({ logistics }) {
  if (!logistics) return null;
  const rows = [
    ["Full Pallets", logistics.fullPallets],
    ["Full Drum Pallets", logistics.fullDrumPallets],
    ["Partial Pallets", logistics.partialPallets],
    ["Total Pallets", logistics.totalPallets],
    ["Total Net Weight", `${Number(logistics.totalNetWeightKg || 0).toLocaleString("en-SA")} kg`],
    ["Total Pallets for Shipping", logistics.totalPalletsForShipping],
  ];

  return (
    <div className="co-pallet-wrap">
      <table className="co-table co-table--pallet">
        <thead>
          <tr>
            <th scope="col">Pallet Type</th>
            <th scope="col">Pallets Qty</th>
            <th scope="col">AI Partial Pallet Optimizer</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{value}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
