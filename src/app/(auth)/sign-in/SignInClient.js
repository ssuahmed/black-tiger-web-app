"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import { Alert, Button, Checkbox, FormField, Input, OtpInput, PasswordInput, SegmentedControl, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { usePasswordPolicy } from "@/hooks/usePasswordPolicy";
import { safeReturnPath } from "@/lib/auth/authRedirect.mjs";
import { clearOtpSession, stashOtpSession } from "@/lib/authSession";
import { formatApiError } from "@/lib/formatApiError";
import { passwordMeetsPolicy } from "@/lib/passwordRules";
import { routes } from "@/lib/routes";

/** @param {{ initialIntent?: 'login' | 'register' }} props */
export default function SignInClient({ initialIntent = "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { submitIdentifier, sendOtp, resendOtp, verifyOtp, loginWithPassword, registerWithPassword } = useAuth();
  const { policy } = usePasswordPolicy();

  const [intent, setIntent] = useState(initialIntent);
  /** @type {'identifier' | 'login_method' | 'password' | 'otp' | 'register_form'} */
  const [step, setStep] = useState("identifier");
  const [identifier, setIdentifier] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [maskedDestination, setMaskedDestination] = useState("");
  /** @type {'otp' | 'password' | null} */
  const [loginMethod, setLoginMethod] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState("");

  const registerReady = useMemo(() => {
    return (
      passwordMeetsPolicy(password, policy.rules) &&
      password === confirmPassword &&
      confirmPassword.length > 0 &&
      acceptTerms
    );
  }, [password, confirmPassword, acceptTerms, policy.rules]);

  function afterAuth() {
    clearOtpSession();
    router.push(safeReturnPath(searchParams.get("returnTo")));
  }

  useEffect(() => {
    setIntent(initialIntent);
  }, [initialIntent]);

  function flowError(e) {
    return formatApiError(e, "Something went wrong. Try again.");
  }

  async function goSendOtp(purpose) {
    if (!challengeId) throw new Error("Missing challenge");
    await sendOtp({ challengeId, purpose });
    stashOtpSession(challengeId, purpose, identifier);
    setOtpCode("");
    setStep("otp");
  }

  async function onContinueIdentifier(e) {
    e.preventDefault();
    setError("");
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Enter your email or mobile number.");
      return;
    }
    setBusy(true);
    try {
      const data = await submitIdentifier({ identifier: trimmed, intent });
      if (!data?.challengeId) {
        setError("Unexpected response from server.");
        return;
      }
      setChallengeId(data.challengeId);
      if (data.maskedDestination) setMaskedDestination(String(data.maskedDestination));

      const next = data.nextStep;
      if (intent === "login") {
        if (next === "login_method") {
          setLoginMethod(null);
          setStep("login_method");
          return;
        }
        if (next === "otp") {
          await goSendOtp("login");
          return;
        }
        if (next === "password") {
          setStep("password");
          return;
        }
      } else {
        if (next === "register_form") {
          setStep("register_form");
          return;
        }
        if (next === "otp") {
          await goSendOtp("register");
          return;
        }
      }
      setError("This account flow is not supported yet. Try another method.");
    } catch (err) {
      setError(flowError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onPickLoginMethod(method) {
    setLoginMethod(method);
    setError("");
    if (method === "otp") {
      setBusy(true);
      try {
        await goSendOtp("login");
      } catch (err) {
        setError(flowError(err));
      } finally {
        setBusy(false);
      }
    } else {
      setStep("password");
    }
  }

  async function onPasswordLogin(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await loginWithPassword({
        identifier: identifier.trim(),
        password,
        challengeId,
      });
      afterAuth();
    } catch (err) {
      setError(flowError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onRegisterSubmit(e) {
    e.preventDefault();
    setError("");
    if (!passwordMeetsPolicy(password, policy.rules)) {
      setError(policy.hint || "Password does not meet the requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await registerWithPassword({
        email: identifier.trim(),
        password,
        confirmPassword,
        acceptTerms,
      });
      afterAuth();
    } catch (err) {
      setError(flowError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    setError("");
    if (otpCode.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    const purpose =
      intent === "login"
        ? "login"
        : step === "otp" && intent === "register"
          ? "register"
          : "login";
    setBusy(true);
    try {
      await verifyOtp({
        challengeId,
        code: otpCode.replace(/\D/g, ""),
        purpose,
      });
      afterAuth();
    } catch (err) {
      setError(flowError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onResendOtp() {
    if (!challengeId) return;
    setError("");
    setResendBusy(true);
    try {
      await resendOtp({ challengeId });
    } catch (err) {
      setError(flowError(err));
    } finally {
      setResendBusy(false);
    }
  }

  function restartIdentifier() {
    setStep("identifier");
    setChallengeId("");
    setLoginMethod(null);
    setPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setMaskedDestination("");
    setError("");
    clearOtpSession();
  }

  const title =
    intent === "login"
      ? step === "otp"
        ? "Verify sign-in"
        : "Sign In"
      : step === "otp"
        ? "Verify your email"
        : "Sign Up";

  const subtitle =
    step === "otp"
      ? maskedDestination
        ? `Code sent to ${maskedDestination}`
        : "Enter the code we sent to your email or phone."
      : null;

  return (
    <AuthCard title={title} subtitle={subtitle}>
      <div className="form-stack">
        {step === "identifier" ? (
          <>
            <SegmentedControl
              options={[
                { value: "login", label: "Log in" },
                { value: "register", label: "Sign up" },
              ]}
              value={intent}
              onChange={(v) => {
                setIntent(v === "register" ? "register" : "login");
                setError("");
              }}
            />
            <form onSubmit={onContinueIdentifier} className="form-stack">
              <FormField
                id="identifier"
                label={intent === "register" ? "Email address" : "Email or mobile"}
                required
                variant="outlined"
              >
                <Input
                  id="identifier"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={intent === "register" ? "Email address" : "you@company.com"}
                  disabled={busy}
                />
              </FormField>
              {error ? (
                <Alert variant="error" className="form-global-error">
                  {error}
                </Alert>
              ) : null}
              <Button type="submit" className="btn-auth" disabled={busy || !identifier.trim()}>
                {busy ? <Spinner size="sm" /> : "Continue"}
              </Button>
            </form>
          </>
        ) : null}

        {step === "login_method" && intent === "login" ? (
          <div className="form-stack">
            <p className="auth-meta">
              Signed in as <strong>{maskedDestination || identifier}</strong>{" "}
              <button type="button" onClick={restartIdentifier}>
                Change
              </button>
            </p>
            <Button type="button" className="btn-auth" disabled={busy} onClick={() => void onPickLoginMethod("otp")}>
              {busy && loginMethod === "otp" ? <Spinner size="sm" /> : "One-time code (OTP)"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={() => void onPickLoginMethod("password")}
            >
              Password
            </Button>
            {error ? (
              <Alert variant="error" className="form-global-error">
                {error}
              </Alert>
            ) : null}
          </div>
        ) : null}

        {step === "password" && intent === "login" ? (
          <form onSubmit={onPasswordLogin} className="form-stack">
            <p className="auth-meta">
              <strong>{maskedDestination || identifier}</strong>{" "}
              <button type="button" onClick={restartIdentifier}>
                Change
              </button>
            </p>
            <FormField id="pw" label="Password" required variant="outlined">
              <PasswordInput
                id="pw"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={busy}
              />
            </FormField>
            <div className="text-right text-sm">
              <Link href={routes.forgotPassword} className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            {error ? (
              <Alert variant="error" className="form-global-error">
                {error}
              </Alert>
            ) : null}
            <Button type="submit" className="btn-auth" disabled={busy || !password}>
              {busy ? <Spinner size="sm" /> : "Sign in"}
            </Button>
          </form>
        ) : null}

        {step === "register_form" ? (
          <form onSubmit={onRegisterSubmit} className="form-stack">
            <FormField id="reg-email" label="Email address" required variant="outlined">
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={maskedDestination || identifier}
                readOnly
              />
            </FormField>
            <p className="auth-meta">
              <button type="button" onClick={restartIdentifier}>
                Change email
              </button>
            </p>
            <FormField id="reg-pw" label="New Password" required variant="outlined">
              <PasswordInput
                id="reg-pw"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                disabled={busy}
              />
            </FormField>
            <FormField id="reg-pw2" label="Confirm new password" required variant="outlined">
              <PasswordInput
                id="reg-pw2"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={busy}
              />
            </FormField>
            <PasswordRequirements password={password} rules={policy.rules} />
            <Checkbox
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              label={
                <>
                  I accept the{" "}
                  <Link href={routes.terms} className="text-primary underline">
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href={routes.privacy} className="text-primary underline">
                    privacy policy
                  </Link>
                  .
                </>
              }
            />
            {error ? (
              <Alert variant="error" className="form-global-error">
                {error}
              </Alert>
            ) : null}
            <Button type="submit" className="btn-auth" disabled={busy || !registerReady}>
              {busy ? <Spinner size="sm" /> : "Sign up"}
            </Button>
          </form>
        ) : null}

        {step === "otp" ? (
          <form onSubmit={onVerifyOtp} className="form-stack">
            <p className="auth-meta">
              Not you?{" "}
              <button type="button" onClick={restartIdentifier}>
                Start over
              </button>
            </p>
            <FormField id="otp" label="One-time code">
              <OtpInput value={otpCode} onChange={setOtpCode} disabled={busy} />
            </FormField>
            {error ? (
              <Alert variant="error" className="form-global-error">
                {error}
              </Alert>
            ) : null}
            <Button type="submit" className="btn-auth" disabled={busy || otpCode.replace(/\D/g, "").length !== 6}>
              {busy ? <Spinner size="sm" /> : "Verify & continue"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy || resendBusy || !challengeId}
              onClick={() => void onResendOtp()}
            >
              {resendBusy ? <Spinner size="sm" /> : "Resend code"}
            </Button>
          </form>
        ) : null}
      </div>
    </AuthCard>
  );
}
