"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, LoadingCenter } from "@/components/ui";
import { getSecuritySettings } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";
import { routes } from "@/lib/routes";

export default function AccountSecurityClient() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getSecuritySettings()
      .then((data) => {
        if (!alive) return;
        setSettings(data && typeof data === "object" ? data : null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load security settings."));
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
      <AccountPageHeader title="Security" description="Password and sign-in options." />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      <Card className="form-stack max-w-xl">
        <p className="m-0 text-sm text-neutral-700">
          Password login: <strong>{settings?.hasPassword ? "Enabled" : "Not set"}</strong>
        </p>
        <p className="m-0 text-sm text-neutral-700">
          One-time code login: <strong>{settings?.otpLoginEnabled ? "Enabled" : "Disabled"}</strong>
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={routes.forgotPassword} className="text-sm font-semibold text-primary underline">
            Forgot password
          </Link>
          <Link href={routes.resetPassword} className="text-sm font-semibold text-primary underline">
            Reset password
          </Link>
        </div>
      </Card>
    </>
  );
}
