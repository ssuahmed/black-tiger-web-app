"use client";

import { useEffect, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import { Alert, EmptyState, LoadingCenter } from "@/components/ui";
import { listAccountReturns } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";

export default function AccountReturnsClient() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    listAccountReturns({ page: 1 })
      .then((data) => {
        if (!alive) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setCount(items.length);
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

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader title="Returns" description="Track return requests and refunds." />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {count === 0 && !error ? (
        <EmptyState title="No returns" description="Return requests will appear here when available." />
      ) : null}
    </>
  );
}
