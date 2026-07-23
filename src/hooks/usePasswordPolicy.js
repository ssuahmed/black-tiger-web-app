"use client";

import { useEffect, useState } from "react";
import * as authApi from "@/lib/api/auth";

const FALLBACK = {
  rules: [{ code: "MIN_LENGTH", label: "At least 8 characters", required: true }],
  hint: "At least 8 characters",
};

/**
 * @returns {{ policy: { rules: Array<{ code: string; label: string; required?: boolean }>; hint: string }; loading: boolean }}
 */
export function usePasswordPolicy() {
  const [policy, setPolicy] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    authApi
      .getPasswordPolicy()
      .then((data) => {
        if (!alive || !data?.rules?.length) return;
        const hint = data.rules
          .filter((r) => r.required !== false)
          .map((r) => r.label)
          .join(" · ");
        setPolicy({ rules: data.rules, hint });
      })
      .catch(() => {
        /* keep fallback */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { policy, loading };
}
