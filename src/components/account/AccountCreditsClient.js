"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AccountListFilters, {
  matchesPeriod,
  matchesQuery,
} from "@/components/account/AccountListFilters";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import CreditAccountForm from "@/components/account/CreditAccountForm";
import { Alert, Button, LoadingCenter, Money } from "@/components/ui";
import { useAccountSummary } from "@/contexts/AccountSummaryContext";
import { getAccountCredits } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";
import { formatAccountDate } from "@/lib/account/mapAccount.mjs";

const tableClass =
  "w-full border-collapse text-sm [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2.5";

function infoValue(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function ApplicationDetails({ accountInfo }) {
  if (!accountInfo || typeof accountInfo !== "object") return null;
  const billing = accountInfo.billing && typeof accountInfo.billing === "object" ? accountInfo.billing : {};
  const company = accountInfo.company && typeof accountInfo.company === "object" ? accountInfo.company : {};
  const preferences =
    accountInfo.preferences && typeof accountInfo.preferences === "object" ? accountInfo.preferences : {};
  const invoice =
    accountInfo.invoiceDelivery && typeof accountInfo.invoiceDelivery === "object"
      ? accountInfo.invoiceDelivery
      : {};
  const submitter =
    accountInfo.submitter && typeof accountInfo.submitter === "object" ? accountInfo.submitter : {};

  const rows = [
    ["Company", billing.companyName],
    ["Billing address", [billing.addressLine1, billing.addressLine2, billing.city, billing.stateCode, billing.postalCode, billing.countryCode].filter(Boolean).join(", ")],
    ["Year founded", company.yearFounded],
    ["Company class", company.companyClass],
    ["Website", company.website],
    ["AP phone", preferences.accountsPayablePhone],
    ["AP email", preferences.accountsPayableEmail],
    ["Currency", preferences.currency],
    ["Credit limit desired", preferences.creditLimitDesired],
    ["Invoice email", invoice.email],
    ["Submitted by", [submitter.name, submitter.title].filter(Boolean).join(" · ")],
    ["Contact", [submitter.phone, submitter.email].filter(Boolean).join(" · ")],
  ];

  return (
    <div className="acc-card acc-credit-form__panel mb-0">
      <p className="acc-credit-form__group-title mb-3">Application details</p>
      <dl className="acc-credits-details mt-0 mb-0">
        {rows.map(([label, value]) => (
          <div key={label} className="acc-credits-details__row">
            <dt>{label}</dt>
            <dd>{infoValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function AccountCreditsClient() {
  const { summary, refresh: refreshSummary } = useAccountSummary();
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("3m");
  const [showForm, setShowForm] = useState(false);

  const loadCredits = useCallback(async () => {
    setError("");
    const data = await getAccountCredits({ tab: "credits", status: "all", page: 1, pageSize: 20 });
    setLedger(data && typeof data === "object" ? data : null);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadCredits()
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
  }, [loadCredits]);

  const hasCreditAccount = ledger?.hasCreditAccount === true;
  const creditAccountApproved = ledger?.creditAccountApproved === true;
  const balance = ledger?.balance?.formatted ?? "0.00";
  const approvedLimit = ledger?.creditLimitApproved?.formatted ?? balance;
  const transactions = Array.isArray(ledger?.transactions) ? ledger.transactions : [];
  const filtered = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          matchesPeriod(tx.createdAt, period) &&
          matchesQuery([tx.typeLabel, tx.type, tx.details, tx.reference], query),
      ),
    [transactions, query, period],
  );
  const withdrawEnabled = summary?.capabilities?.creditsWithdrawEnabled === true;

  async function onApplicationSuccess() {
    setShowForm(false);
    setLoading(true);
    try {
      await Promise.all([loadCredits(), refreshSummary()]);
    } catch (err) {
      setError(formatApiError(err, "Could not refresh credits."));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  if (!hasCreditAccount) {
    return (
      <>
        <AccountPageHeader
          title="Credits"
          description="Open a credit account to pay for Black Tiger orders on payment terms."
        />
        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}
        {showForm ? (
          <CreditAccountForm onSuccess={onApplicationSuccess} />
        ) : (
          <div className="acc-card acc-credit-form__panel">
            <p className="m-0 text-sm leading-relaxed text-neutral-600">
              You do not have a credit account yet. Open one to place orders within your payment terms
              and settle with a single payment.
            </p>
            <div className="mt-4">
              <Button type="button" onClick={() => setShowForm(true)}>
                Open credit account
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <AccountPageHeader
        title="Credits"
        description={
          creditAccountApproved
            ? "Approved credit limit and application details."
            : "Your credit account application is under review."
        }
        filters={
          <AccountListFilters
            query={query}
            period={period}
            onQueryChange={setQuery}
            onPeriodChange={setPeriod}
          />
        }
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

      {!creditAccountApproved ? (
        <Alert variant="info" className="mb-4" role="status">
          Application received. We typically respond within approximately 5 days.
        </Alert>
      ) : null}

      <div className="acc-card acc-credit-form__panel mb-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {creditAccountApproved ? "Approved credit limit" : "Requested / approved limit"}
        </p>
        <p className="mt-1 mb-0 text-2xl font-bold text-neutral-900">
          <Money value={String(approvedLimit)} />
        </p>
        <p className="mt-2 mb-0 text-sm text-neutral-600">
          Status: {creditAccountApproved ? "Approved" : "Pending review"}
        </p>
      </div>

      <div className="mb-4">
        <ApplicationDetails accountInfo={ledger?.accountInfo} />
      </div>

      <div className="acc-card overflow-hidden p-0">
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>No credit activity yet.</td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={String(tx.id ?? tx.reference ?? tx.details)}>
                  <td>{formatAccountDate(tx.createdAt ? String(tx.createdAt) : null)}</td>
                  <td>{String(tx.typeLabel ?? tx.type ?? "—")}</td>
                  <td>{String(tx.details ?? "—")}</td>
                  <td className="whitespace-nowrap">
                    {tx.amount?.formatted ? <Money value={String(tx.amount.formatted)} /> : "—"}
                  </td>
                  <td className="whitespace-nowrap">
                    {tx.runningBalance?.formatted ? (
                      <Money value={String(tx.runningBalance.formatted)} />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
