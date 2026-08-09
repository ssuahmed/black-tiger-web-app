"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AccountListFilters, {
  matchesPeriod,
  matchesQuery,
} from "@/components/account/AccountListFilters";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, LoadingCenter, Money } from "@/components/ui";
import { listAccountPayments } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";

const tableClass =
  "w-full border-collapse text-sm [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2.5";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AccountPaymentsClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("3m");

  useEffect(() => {
    let alive = true;
    listAccountPayments({ page: 1, pageSize: 50 })
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load payments."));
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
      items.filter(
        (row) =>
          matchesPeriod(row.createdAt, period) &&
          matchesQuery(
            [
              row.orderNumber,
              row.methodLabel,
              row.method,
              row.statusLabel,
              row.status,
              row.tranRef,
              row.wireTransferDate,
            ],
            query,
          ),
      ),
    [items, query, period],
  );

  const hasRows = filtered.length > 0;

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader
        title="Payments"
        description="Payment history for your storefront orders."
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
          title={items.length ? "No matching payments" : "No payments yet"}
          description={
            items.length
              ? "Try a different search or time period."
              : "When you pay for an order, the payment will appear here."
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
                <th>Method</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={String(row.id)}>
                  <td className="font-semibold">{row.orderNumber || "—"}</td>
                  <td>{formatDate(row.createdAt)}</td>
                  <td>{row.methodLabel || row.method || "—"}</td>
                  <td>
                    <span className="capitalize">{row.statusLabel || row.status || "—"}</span>
                    {row.method === "wire" && row.status === "pending" ? (
                      <>
                        {" "}
                        <Link
                          href={`/account/wire-transfer?orderId=${encodeURIComponent(String(row.orderId || ""))}&orderNumber=${encodeURIComponent(String(row.orderNumber || ""))}`}
                          className="text-[var(--bt-blue,#0b5fff)] underline"
                        >
                          Upload receipt
                        </Link>
                      </>
                    ) : null}
                  </td>
                  <td className="font-mono text-xs">
                    {row.tranRef || (row.wireTransferDate ? `Wire ${row.wireTransferDate}` : "—")}
                  </td>
                  <td className="whitespace-nowrap font-semibold">
                    {row.formattedAmount ? <Money value={row.formattedAmount} /> : "—"}
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
