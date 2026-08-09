"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthIdentifierField, {
  resolveAuthIdentifier,
} from "@/components/auth/AuthIdentifierField";
import { Alert, Button, Spinner } from "@/components/ui";
import * as authApi from "@/lib/api/auth";
import { validateLoginIdentifier } from "@/lib/auth/email";
import { DEFAULT_DIAL_CODE } from "@/lib/auth/phoneIdentifier";
import { stashOtpSession } from "@/lib/authSession";
import { formatApiError } from "@/lib/formatApiError";
import { routes } from "@/lib/routes";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [info, setInfo] = useState("");

  const identifierReady = useMemo(
    () => Boolean(identifier.trim()) && !validateLoginIdentifier(identifier, dialCode),
    [identifier, dialCode],
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const loginError = validateLoginIdentifier(identifier, dialCode);
    if (loginError) {
      setFieldError(loginError);
      return;
    }
    setFieldError("");
    const trimmed = resolveAuthIdentifier(identifier, dialCode);
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
        <AuthIdentifierField
          id="fp-id"
          value={identifier}
          dialCode={dialCode}
          onChange={({ value, dialCode: nextDial }) => {
            setIdentifier(value);
            setDialCode(nextDial);
            setFieldError("");
            setError("");
          }}
          onBlur={() => {
            if (identifier.trim()) {
              setFieldError(validateLoginIdentifier(identifier, dialCode));
            }
          }}
          error={fieldError || undefined}
          required
          disabled={busy}
          placeholder="Email or mobile"
        />
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
        <Button type="submit" className="btn-auth" disabled={busy || !identifierReady}>
          {busy ? <Spinner size="sm" /> : "Send instructions"}
        </Button>
      </form>
    </AuthCard>
  );
}
