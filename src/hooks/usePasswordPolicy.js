"use client";

/**
 * Loads password policy rules from `/v1/auth/password/policy`, falling back to a local
 * default set when the API is unavailable so signup/reset UIs still show checklist items.
 */

import { useEffect, useState } from "react";
import * as authApi from "@/lib/api/auth";

const FALLBACK = {
  rules: [
    { code: "MIN_LENGTH", label: "8 characters", required: true },
    { code: "SPECIAL_CHAR", label: "1 special character (Example: # $ @ & ? )", required: true },
    { code: "MIXED_CASE", label: "1 uppercase and 1 lowercase letter", required: true },
    { code: "DIGIT", label: "1 numerical digit", required: true },
  ],
  hint: "At least 8 characters, mixed case, a number, and a special character",
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
