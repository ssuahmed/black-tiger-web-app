"use client";

import { useEffect, useState } from "react";
import { Alert, Button, OtpInput, Spinner } from "@/components/ui";

const RESEND_COOLDOWN_SEC = 12;

function EnvelopeIcon() {
  return (
    <svg className="auth-otp__envelope" width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="20" height="16" rx="2" fill="#F5C518" stroke="#111" strokeWidth="1.4" />
      <path d="M2 3.5 11 10l9-6.5" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function SmsBubbleIcon({ className = "", color = "#2F80ED" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 2.75h11a1.25 1.25 0 0 1 1.25 1.25v6a1.25 1.25 0 0 1-1.25 1.25H7.1L4 14.25V11.25H2.5A1.25 1.25 0 0 1 1.25 10V4A1.25 1.25 0 0 1 2.5 2.75Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = "", color = "#25D366" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.4A6.55 6.55 0 0 0 2.2 11.3L1.5 14.5l3.3-.86A6.55 6.55 0 1 0 8 1.4Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M5.7 6.2c.2-.4.4-.4.6-.4h.4c.15 0 .3.05.4.35l.45 1.05c.08.2.03.35-.1.5l-.3.35c-.1.1-.1.2 0 .35.2.35.7.95 1.35 1.35.3.2.5.25.65.15l.45-.3c.15-.1.3-.08.45.05l.95.55c.2.12.3.28.2.5-.15.4-.7.9-1.15 1-.3.08-.7 0-1.2-.18-1.15-.4-2.15-1.2-2.9-2.25-.35-.5-.65-1.15-.7-1.7-.05-.45.1-.85.4-1.17Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * OTP verify UI — email layout vs phone (WhatsApp-first) layout.
 *
 * @param {{
 *   destination: string;
 *   channel?: 'email' | 'phone';
 *   activeVia?: 'whatsapp' | 'sms';
 *   value: string;
 *   onChange: (code: string) => void;
 *   onSubmit: (e: import('react').FormEvent) => void;
 *   onChangeDestination: () => void;
 *   onResend: (via?: 'sms' | 'whatsapp' | 'email') => void | Promise<void>;
 *   onViaChange?: (via: 'whatsapp' | 'sms') => void;
 *   busy?: boolean;
 *   resendBusy?: boolean;
 *   error?: string;
 *   resendKey?: string | number;
 * }} props
 */
export default function AuthOtpForm({
  destination,
  channel = "email",
  activeVia = "whatsapp",
  value,
  onChange,
  onSubmit,
  onChangeDestination,
  onResend,
  onViaChange,
  busy = false,
  resendBusy = false,
  error = "",
  resendKey = "",
}) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SEC);
  const isPhone = channel === "phone";
  const via = activeVia === "sms" ? "sms" : "whatsapp";
  const viaLabel = via === "sms" ? "SMS" : "WhatsApp";

  useEffect(() => {
    setSecondsLeft(RESEND_COOLDOWN_SEC);
  }, [resendKey]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const canResend = secondsLeft <= 0 && !busy && !resendBusy;

  async function handleResend(nextVia) {
    if (!canResend) return;
    if (nextVia === "whatsapp" || nextVia === "sms") {
      onViaChange?.(nextVia);
    }
    await onResend(nextVia);
    setSecondsLeft(RESEND_COOLDOWN_SEC);
  }

  return (
    <form onSubmit={onSubmit} className={isPhone ? "auth-otp auth-otp--phone" : "auth-otp"}>
      {destination && !isPhone ? (
        <div className="auth-otp__dest">
          <EnvelopeIcon />
          <span className="auth-otp__dest-value">{destination}</span>
          <button type="button" className="auth-otp__change" onClick={onChangeDestination} disabled={busy}>
            Change
          </button>
        </div>
      ) : null}

      {destination && isPhone ? (
        <div className="auth-otp__phone-dest">
          <p className="auth-otp__phone-number">{destination}</p>
          <p className="auth-otp__via">
            <span>via</span>
            {via === "whatsapp" ? (
              <WhatsAppIcon className="auth-otp__via-icon" />
            ) : (
              <SmsBubbleIcon className="auth-otp__via-icon" />
            )}
            <strong className={via === "whatsapp" ? "auth-otp__via-whatsapp" : undefined}>{viaLabel}</strong>
            <button
              type="button"
              className="auth-otp__change auth-otp__change--inline"
              onClick={onChangeDestination}
              disabled={busy}
            >
              Change
            </button>
          </p>
        </div>
      ) : null}

      <OtpInput value={value} onChange={onChange} disabled={busy} className="auth-otp__digits" />

      <div className="auth-otp__resend">
        <p className="auth-otp__resend-prompt">Didn&apos;t get the OTP?</p>
        {secondsLeft > 0 ? (
          <p className="auth-otp__resend-wait">
            Resend OTP on {isPhone ? viaLabel : "email"} in <strong>{secondsLeft}s</strong>
          </p>
        ) : !isPhone ? (
          <button
            type="button"
            className="auth-otp__resend-action"
            disabled={!canResend}
            onClick={() => void handleResend("email")}
          >
            {resendBusy ? "Sending…" : "Resend OTP on email"}
          </button>
        ) : null}

        {isPhone ? (
          <div className="auth-otp__channels">
            <button
              type="button"
              className={
                via === "whatsapp"
                  ? "auth-otp__channel auth-otp__channel--active"
                  : "auth-otp__channel"
              }
              disabled={!canResend}
              onClick={() => void handleResend("whatsapp")}
            >
              <WhatsAppIcon color="currentColor" />
              <span>Whatsapp</span>
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <Alert variant="error" className="form-global-error">
          {error}
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="btn-auth auth-otp__submit"
        disabled={busy || value.replace(/\D/g, "").length !== 6}
      >
        {busy ? <Spinner size="sm" /> : "Submit"}
      </Button>
    </form>
  );
}
