"use client";

import { useEffect, useMemo, useState } from "react";
import AccountListFilters, {
  matchesPeriod,
  matchesQuery,
} from "@/components/account/AccountListFilters";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, LoadingCenter, Money } from "@/components/ui";
import { listAccountOrders } from "@/lib/api/account";
import { normalizeOrderRow } from "@/lib/account/mapAccount.mjs";
import { formatApiError } from "@/lib/formatApiError";

const tableClass =
  "w-full border-collapse text-sm [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2.5";

export default function AccountOrdersClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("3m");

  useEffect(() => {
    let alive = true;
    listAccountOrders({ page: 1, pageSize: 50 })
      .then((data) => {
        if (!alive) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setRows(items.map((row) => normalizeOrderRow(row && typeof row === "object" ? row : {})));
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load orders."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          matchesPeriod(row.createdAtIso, period) &&
          matchesQuery([row.orderNumber, row.status, row.shippingLabel], query),
      ),
    [rows, query, period],
  );

  const hasRows = filtered.length > 0;
  const subtitle = useMemo(() => {
    if (!rows.length) return "Your order history";
    if (filtered.length === rows.length) {
      return `${rows.length} order${rows.length === 1 ? "" : "s"}`;
    }
    return `${filtered.length} of ${rows.length} order${rows.length === 1 ? "" : "s"}`;
  }, [filtered.length, rows.length]);

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader
        title="Orders"
        description={subtitle}
        filters={
          <AccountListFilters
            query={query}
            period={period}
            onQueryChange={setQuery}
            onPeriodChange={setPeriod}
          />
        }
      />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {!hasRows && !error ? (
        <EmptyState
          title={rows.length ? "No matching orders" : "No orders yet"}
          description={
            rows.length
              ? "Try a different search or time period."
              : "When you place an order, it will appear here."
          }
        />
      ) : null}
      {hasRows ? (
        <Card className="overflow-x-auto p-0">
          <table className={tableClass}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id || row.orderNumber}>
                  <td className="font-semibold">{row.orderNumber || "—"}</td>
                  <td>{row.createdAt}</td>
                  <td>{row.status}</td>
                  <td>{row.itemCount}</td>
                  <td className="whitespace-nowrap font-semibold">
                    {row.formattedTotal ? <Money value={row.formattedTotal} /> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </>
  );
}
