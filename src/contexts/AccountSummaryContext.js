"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAccountSummary } from "@/lib/api/account";

/** @typedef {Record<string, unknown> | null} AccountSummary */

const AccountSummaryContext = createContext(
  /** @type {{ summary: AccountSummary; loading: boolean; error: string; refresh: () => Promise<void> } | null} */ (null),
);

export function AccountSummaryProvider({ children }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAccountSummary();
      setSummary(data && typeof data === "object" ? data : null);
    } catch (err) {
      setSummary(null);
      setError(err instanceof Error ? err.message : "Unable to load account summary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ summary, loading, error, refresh }),
    [summary, loading, error, refresh],
  );

  return <AccountSummaryContext.Provider value={value}>{children}</AccountSummaryContext.Provider>;
}

export function useAccountSummary() {
  const ctx = useContext(AccountSummaryContext);
  if (!ctx) {
    throw new Error("useAccountSummary requires AccountSummaryProvider");
  }
  return ctx;
}
