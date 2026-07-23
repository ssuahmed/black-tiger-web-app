"use client";

import { useEffect, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, EmptyState, LoadingCenter } from "@/components/ui";
import { listPaymentMethods } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";

export default function AccountPaymentsClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    listPaymentMethods()
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load payment methods."));
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
      <AccountPageHeader title="Payment methods" description="Saved cards and payment options." />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {!items.length && !error ? (
        <EmptyState
          title="No saved payment methods"
          description="Payment methods will be available when the gateway integration is enabled."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((row) => (
            <Card key={String(row.id)}>
              <p className="m-0 font-semibold capitalize">{String(row.type ?? "card")}</p>
              <p className="mt-1 mb-0 text-sm text-neutral-600">•••• {String(row.last4 ?? "----")}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
