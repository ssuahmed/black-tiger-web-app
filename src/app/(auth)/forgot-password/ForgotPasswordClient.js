"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { Alert, Button, FormField, Input, Spinner } from "@/components/ui";
import * as authApi from "@/lib/api/auth";
import { stashOtpSession } from "@/lib/authSession";
import { formatApiError } from "@/lib/formatApiError";
import { routes } from "@/lib/routes";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Enter your email or mobile number.");
      return;
    }
    setBusy(true);
    try {
      const data = await authApi.forgotPassword({ identifier: trimmed, preferredMethod: "auto" });
      const msg = data?.message ?? "If an account exists, instructions have been sent.";
      setInfo(msg);
      if (data?.deliveryMethod === "otp" && data?.challengeId) {
        await authApi.sendOtp({ challengeId: data.challengeId, purpose: "reset_password" });
        stashOtpSession(data.challengeId, "reset_password", trimmed);
        router.push(routes.verifyOtp);
        return;
      }
      if (data?.deliveryMethod === "email_link") {
        setInfo(
          `${msg} Check your inbox for a reset link. The link opens this site to set a new password.`,
        );
      }
    } catch (err) {
      setError(formatApiError(err, "Request failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Forgot password" footer={<Link href={routes.signIn}>Back to sign in</Link>}>
      <form onSubmit={onSubmit} className="form-stack">
        <FormField id="fp-id" label="Email or mobile" required variant="outlined">
          <Input
            id="fp-id"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            placeholder="Email or mobile"
            disabled={busy}
          />
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
        <Button type="submit" className="btn-auth" disabled={busy || !identifier.trim()}>
          {busy ? <Spinner size="sm" /> : "Send instructions"}
        </Button>
      </form>
    </AuthCard>
  );
}
