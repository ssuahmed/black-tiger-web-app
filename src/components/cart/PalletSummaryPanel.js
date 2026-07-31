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
    <div className="mb-4 overflow-x-auto">
      <table className="co-table">
        <thead>
          <tr>
            <th>Pallet Type</th>
            <th>Pallets Qty</th>
            <th>AI Partial Pallet Optimizer</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{value}</td>
              <td className="text-neutral-500">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
