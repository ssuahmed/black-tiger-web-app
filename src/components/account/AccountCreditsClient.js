"use client";

import { useEffect, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, LoadingCenter } from "@/components/ui";
import { useAccountSummary } from "@/contexts/AccountSummaryContext";
import { getAccountCredits } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";
import { formatAccountDate } from "@/lib/account/mapAccount.mjs";

const tableClass =
  "w-full border-collapse text-sm [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2.5";

export default function AccountCreditsClient() {
  const { summary } = useAccountSummary();
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getAccountCredits({ tab: "credits", status: "all", page: 1, pageSize: 20 })
      .then((data) => {
        if (!alive) return;
        setLedger(data && typeof data === "object" ? data : null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load credits."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const balance = ledger?.balance?.formatted ?? "0.00 SAR";
  const transactions = Array.isArray(ledger?.transactions) ? ledger.transactions : [];
  const withdrawEnabled = summary?.capabilities?.creditsWithdrawEnabled === true;

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader
        title="Credits"
        description="Store credit balance and transaction history."
        action={
          withdrawEnabled ? (
            <button
              type="button"
              className="min-h-10 px-4 text-sm font-semibold text-white bg-neutral-900 border-0 cursor-not-allowed opacity-60"
              disabled
              title="Withdrawals are enabled for approved B2B accounts"
            >
              Withdraw
            </button>
          ) : null
        }
      />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      <Card className="mb-6">
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-neutral-500">Total credits</p>
        <p className="mt-1 mb-0 text-3xl font-bold text-neutral-900">{balance}</p>
      </Card>
      <Card className="overflow-x-auto p-0">
        <table className={tableClass}>
          <thead>
            <tr>
              <th>Created</th>
              <th>Type</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={String(tx.id ?? tx.reference ?? tx.details)}>
                <td>{formatAccountDate(tx.createdAt ? String(tx.createdAt) : null)}</td>
                <td>{String(tx.typeLabel ?? tx.type ?? "—")}</td>
                <td>{String(tx.details ?? "—")}</td>
                <td className="whitespace-nowrap">{String(tx.amount?.formatted ?? "—")}</td>
                <td className="whitespace-nowrap">{String(tx.runningBalance?.formatted ?? "—")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
