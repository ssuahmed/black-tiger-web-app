"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { Alert, Button, FormField, Input, Spinner } from "@/components/ui";
import { CommerceApiError } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePasswordPolicy } from "@/hooks/usePasswordPolicy";
import * as authApi from "@/lib/api/auth";
import { routes } from "@/lib/routes";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applyAuthPayload } = useAuth();
  const { policy } = usePasswordPolicy();
  const [resetToken, setResetToken] = useState("");
  const [resetSessionToken, setResetSessionToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const q = searchParams.get("token");
    if (q) setResetToken(q);
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem("bt_reset_session_token");
      if (s) setResetSessionToken(s);
    }
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get("token");
    if (!q) {
      setTokenValid(null);
      return;
    }
    let alive = true;
    authApi
      .validateResetToken(q)
      .then(() => {
        if (alive) setTokenValid(true);
      })
      .catch(() => {
        if (alive) setTokenValid(false);
      });
    return () => {
      alive = false;
    };
  }, [searchParams]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 8) {
      setError(policy.hint || "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!resetToken && !resetSessionToken) {
      setError("Missing reset token. Open the email link or complete OTP verification first.");
      return;
    }
    setBusy(true);
    try {
      const data = await authApi.resetPassword({
        resetToken: resetToken || undefined,
        resetSessionToken: resetSessionToken || undefined,
        password,
        confirmPassword,
        autoLogin: true,
      });
      setInfo(data?.message ?? "Password updated.");
      sessionStorage.removeItem("bt_reset_session_token");
      if (data?.tokens) {
        applyAuthPayload(data.tokens);
        router.push("/account");
      }
    } catch (err) {
      const m = err instanceof CommerceApiError ? err.message : err instanceof Error ? err.message : "Reset failed.";
      setError(m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password you have not used before on this site."
      footer={
        <Link href={routes.signIn} className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="form-stack">
        {tokenValid === false ? (
          <Alert variant="error">This reset link is invalid or expired. Request a new one from sign in.</Alert>
        ) : null}
        {!resetToken && !resetSessionToken ? (
          <Alert variant="info">Open the link from your email or complete OTP verification first.</Alert>
        ) : null}
        <FormField id="rpw" label="New password" hint={policy.hint} required>
          <Input id="rpw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
        </FormField>
        <FormField id="rpw2" label="Confirm password" required>
          <Input id="rpw2" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={busy} />
        </FormField>
        {info ? (
          <Alert variant="success" role="status">
            {info}
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="error" className="form-global-error">
            {error}
          </Alert>
        ) : null}
        <Button type="submit" className="w-full btn-primary" disabled={busy}>
          {busy ? <Spinner size="sm" /> : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
