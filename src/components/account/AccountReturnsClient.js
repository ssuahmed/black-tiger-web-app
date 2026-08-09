"use client";

import { useEffect, useMemo, useState } from "react";
import AccountListFilters, {
  matchesPeriod,
  matchesQuery,
} from "@/components/account/AccountListFilters";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import { Alert, EmptyState, LoadingCenter } from "@/components/ui";
import { listAccountReturns } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";

export default function AccountReturnsClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("3m");

  useEffect(() => {
    let alive = true;
    listAccountReturns({ page: 1 })
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load returns."));
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
          matchesPeriod(row.createdAt ?? row.date, period) &&
          matchesQuery([row.id, row.status, row.orderNumber, row.reason], query),
      ),
    [items, query, period],
  );

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader
        title="Returns"
        description="Track return requests and refunds."
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
      {filtered.length === 0 && !error ? (
        <EmptyState
          title={items.length ? "No matching returns" : "No returns"}
          description={
            items.length
              ? "Try a different search or time period."
              : "Return requests will appear here when available."
          }
        />
      ) : null}
    </>
  );
}
