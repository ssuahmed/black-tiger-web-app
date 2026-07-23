"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { Alert, Button, FormField, Input, OtpInput, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { readOtpSession, stashOtpSession } from "@/lib/authSession";
import { formatApiError } from "@/lib/formatApiError";
import { routes } from "@/lib/routes";

export default function VerifyOtpClient() {
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();
  const [ready, setReady] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  /** @type {'login' | 'register' | 'reset_password'} */
  const [purpose, setPurpose] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = readOtpSession();
    setChallengeId(session.challengeId);
    const p = session.purpose || "login";
    if (p === "register" || p === "reset_password" || p === "login") setPurpose(p);
    setIdentifier(session.identifier);
    setReady(true);
  }, []);

  async function onManualChallenge(e) {
    e.preventDefault();
    if (!challengeId.trim()) {
      setError("Paste or enter the challenge id from your session.");
      return;
    }
    stashOtpSession(challengeId.trim(), purpose, identifier);
    setError("");
  }

  async function onResend() {
    const cid = challengeId.trim();
    if (!cid) {
      setError("Missing challenge. Return to sign-in first.");
      return;
    }
    setError("");
    setResendBusy(true);
    try {
      await resendOtp({ challengeId: cid });
    } catch (err) {
      setError(formatApiError(err, "Could not resend code."));
    } finally {
      setResendBusy(false);
    }
  }

  async function onVerify(e) {
    e.preventDefault();
    setError("");
    const cid = challengeId.trim();
    if (!cid) {
      setError("Missing challenge. Return to sign-in or paste challenge id below.");
      return;
    }
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    try {
      const data = await verifyOtp({ challengeId: cid, code: digits, purpose });
      if (purpose === "reset_password" && data?.resetSessionToken) {
        sessionStorage.setItem("bt_reset_session_token", data.resetSessionToken);
        sessionStorage.removeItem("bt_otp_challenge_id");
        sessionStorage.removeItem("bt_otp_purpose");
        router.push("/reset-password");
        return;
      }
      sessionStorage.removeItem("bt_otp_challenge_id");
      sessionStorage.removeItem("bt_otp_purpose");
      router.push("/account");
    } catch (err) {
      setError(formatApiError(err, "Verification failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Verify code"
      subtitle={identifier ? `We sent a code for ${identifier}` : "Enter the one-time code you received."}
      footer={
        <span>
          <Link href={routes.signIn} className="text-primary hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      {!ready ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={onVerify} className="form-stack">
          {!challengeId ? (
            <Alert variant="info">
              No challenge id in session storage. Complete the previous step or paste values saved during sign-in / reset.
            </Alert>
          ) : null}
          <FormField id="cid" label="Challenge id (optional override)" hint="Filled from sessionStorage when available.">
            <Input id="cid" value={challengeId} onChange={(e) => setChallengeId(e.target.value)} autoComplete="off" />
          </FormField>
          <Button type="button" variant="outline" className="w-full" onClick={onManualChallenge}>
            Save challenge to session
          </Button>
          <FormField id="purpose" label="Purpose">
            <select
              id="purpose"
              className="select-field"
              value={purpose}
              onChange={(e) => setPurpose(/** @type {'login' | 'register' | 'reset_password'} */ (e.target.value))}
            >
              <option value="login">Login</option>
              <option value="register">Register</option>
              <option value="reset_password">Reset password</option>
            </select>
          </FormField>
          <FormField id="code" label="One-time code">
            <OtpInput value={code} onChange={setCode} disabled={busy} />
          </FormField>
          {error ? (
            <Alert variant="error" className="form-global-error">
              {error}
            </Alert>
          ) : null}
          <Button type="submit" className="w-full btn-primary" disabled={busy}>
            {busy ? <Spinner size="sm" /> : "Verify"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy || resendBusy || !challengeId.trim()}
            onClick={() => void onResend()}
          >
            {resendBusy ? <Spinner size="sm" /> : "Resend code"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
