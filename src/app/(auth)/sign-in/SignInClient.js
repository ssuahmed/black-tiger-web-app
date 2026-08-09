"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthIdentifierField, {
  resolveAuthIdentifier,
} from "@/components/auth/AuthIdentifierField";
import AuthOtpForm from "@/components/auth/AuthOtpForm";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import { Alert, Button, Checkbox, FormField, Input, PasswordInput, SegmentedControl, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { usePasswordPolicy } from "@/hooks/usePasswordPolicy";
import { safeReturnPath } from "@/lib/auth/authRedirect.mjs";
import { DEFAULT_DIAL_CODE, isPhoneIdentifierMode } from "@/lib/auth/phoneIdentifier";
import { looksLikePhoneSignupAttempt, validateLoginIdentifier, validateSignupEmail } from "@/lib/auth/email";
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
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
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
  const [fieldError, setFieldError] = useState("");
  const [otpResendKey, setOtpResendKey] = useState(0);
  /** @type {'whatsapp' | 'sms'} */
  const [otpVia, setOtpVia] = useState("whatsapp");

  const registerReady = useMemo(() => {
    return (
      passwordMeetsPolicy(password, policy.rules) &&
      password === confirmPassword &&
      confirmPassword.length > 0 &&
      acceptTerms
    );
  }, [password, confirmPassword, acceptTerms, policy.rules]);

  const identifierReady = useMemo(() => {
    if (intent === "register") {
      return Boolean(identifier.trim()) && !validateSignupEmail(identifier);
    }
    return Boolean(identifier.trim()) && !validateLoginIdentifier(identifier, dialCode);
  }, [intent, identifier, dialCode]);

  function onRegisterIdentifierChange(next) {
    setIdentifier(next);
    setError("");
    if (looksLikePhoneSignupAttempt(next)) {
      setFieldError("You can only sign up with an email address.");
    } else {
      setFieldError("");
    }
  }

  function onLoginIdentifierChange({ value, dialCode: nextDial }) {
    setIdentifier(value);
    setDialCode(nextDial);
    setError("");
    setFieldError("");
  }

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
    const phone = isPhoneIdentifierMode(identifier);
    const channel = phone ? "whatsapp" : "email";
    await sendOtp({ challengeId, purpose, channel });
    stashOtpSession(challengeId, purpose, resolvedIdentifier() || identifier);
    setOtpCode("");
    if (phone) setOtpVia("whatsapp");
    setOtpResendKey((k) => k + 1);
    setStep("otp");
  }

  function resolvedIdentifier() {
    if (intent === "register") return identifier.trim();
    return resolveAuthIdentifier(identifier, dialCode);
  }

  async function onContinueIdentifier(e) {
    e.preventDefault();
    setError("");
    const trimmed = resolvedIdentifier();
    if (intent === "register") {
      const signupError = trimmed
        ? validateSignupEmail(trimmed)
        : "Enter your email address.";
      if (signupError) {
        setFieldError(signupError);
        return;
      }
      setFieldError("");
    } else {
      const loginError = validateLoginIdentifier(identifier, dialCode);
      if (loginError) {
        setFieldError(loginError);
        return;
      }
      setFieldError("");
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
      // Drive the wizard from API nextStep (not client intent alone).
      // Register + existing account → API returns login_method.
      if (next === "login_method") {
        if (intent === "register") {
          setIntent("login");
          setError("An account already exists for this email. Sign in to continue.");
        }
        setLoginMethod(null);
        setStep("login_method");
        return;
      }
      if (next === "register_form") {
        setStep("register_form");
        return;
      }
      if (next === "otp") {
        await goSendOtp(intent === "register" ? "register" : "login");
        return;
      }
      if (next === "password") {
        setIntent("login");
        setStep("password");
        return;
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
        identifier: resolvedIdentifier(),
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

  async function onResendOtp(via) {
    if (!challengeId) return;
    setError("");
    setResendBusy(true);
    try {
      const channel =
        via === "sms" || via === "whatsapp" || via === "email"
          ? via
          : isPhoneIdentifierMode(identifier)
            ? otpVia
            : "email";
      await resendOtp({ challengeId, channel });
      if (channel === "sms" || channel === "whatsapp") setOtpVia(channel);
      setOtpResendKey((k) => k + 1);
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
    setFieldError("");
    setOtpVia("whatsapp");
    clearOtpSession();
  }

  const otpChannel = isPhoneIdentifierMode(identifier) ? "phone" : "email";
  const otpDestination =
    otpChannel === "phone"
      ? `${dialCode}${String(identifier || "").replace(/\D/g, "")}`
      : maskedDestination || identifier;

  const title =
    step === "otp"
      ? "Enter the 6-digit OTP sent to"
      : intent === "login"
        ? "Sign In"
        : "Sign Up";

  return (
    <AuthCard title={title} className={step === "otp" ? "auth-shell--otp" : undefined}>
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
                const next = v === "register" ? "register" : "login";
                setIntent(next);
                setError("");
                setFieldError("");
                // Signup is email-only — drop any phone number typed on Log in.
                if (next === "register" && isPhoneIdentifierMode(identifier)) {
                  setIdentifier("");
                  setDialCode(DEFAULT_DIAL_CODE);
                }
              }}
            />
            <form onSubmit={onContinueIdentifier} className="form-stack">
              {intent === "register" ? (
                <FormField
                  id="identifier"
                  label="Email address"
                  required
                  variant="outlined"
                  error={fieldError || undefined}
                >
                  <Input
                    id="identifier"
                    type="email"
                    autoComplete="email"
                    value={identifier}
                    onChange={(e) => onRegisterIdentifierChange(e.target.value)}
                    onBlur={() => {
                      if (identifier.trim()) setFieldError(validateSignupEmail(identifier));
                    }}
                    placeholder="Email address"
                    disabled={busy}
                  />
                </FormField>
              ) : (
                <AuthIdentifierField
                  id="identifier"
                  value={identifier}
                  dialCode={dialCode}
                  onChange={onLoginIdentifierChange}
                  onBlur={() => {
                    if (identifier.trim()) {
                      setFieldError(validateLoginIdentifier(identifier, dialCode));
                    }
                  }}
                  error={fieldError || undefined}
                  required
                  disabled={busy}
                />
              )}
              {error ? (
                <Alert variant="error" className="form-global-error">
                  {error}
                </Alert>
              ) : null}
              <Button type="submit" className="btn-auth" disabled={busy || !identifierReady}>
                {busy ? <Spinner size="sm" /> : "Continue"}
              </Button>
            </form>
          </>
        ) : null}

        {step === "login_method" && intent === "login" ? (
          <div className="form-stack">
            <p className="auth-meta">
              Signing in as <strong>{maskedDestination || identifier}</strong>{" "}
              <button type="button" onClick={restartIdentifier}>
                Change
              </button>
            </p>
            <p className="auth-meta auth-meta--prompt">Choose how you would like to sign in</p>
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
          <AuthOtpForm
            destination={otpDestination}
            channel={otpChannel}
            activeVia={otpVia}
            value={otpCode}
            onChange={setOtpCode}
            onSubmit={onVerifyOtp}
            onChangeDestination={restartIdentifier}
            onResend={onResendOtp}
            onViaChange={setOtpVia}
            busy={busy}
            resendBusy={resendBusy}
            error={error}
            resendKey={otpResendKey}
          />
        ) : null}
      </div>
    </AuthCard>
  );
}
