"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

const FIELD_CLASS = "co-field";
const OTHER_PLACEHOLDER = "Someone else will be at the door";

/** @param {{ open: boolean; onClose: () => void; initialValue?: { name?: string; phone?: string; email?: string; phoneCountry?: string }; onSave?: (value: { name: string; phone: string; phoneCountry: string; email: string }) => void }} props */
export default function AlternateRecipientModal({ open, onClose, initialValue, onSave }) {
  const [name, setName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("+966");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      const rawName = String(initialValue?.name || "").trim();
      setName(rawName === OTHER_PLACEHOLDER ? "" : rawName);
      const parsed = splitPhone(initialValue?.phone, initialValue?.phoneCountry);
      setPhoneCountry(parsed.phoneCountry);
      setPhone(parsed.phone);
      setEmail(String(initialValue?.email || "").trim());
      setError("");
    });
    return () => {
      alive = false;
    };
  }, [open, initialValue]);

  function submit(event) {
    event.preventDefault();
    const nextName = name.trim();
    const nextPhone = phone.trim();
    if (!nextName) {
      setError("Name is required.");
      return;
    }
    if (!nextPhone) {
      setError("Phone is required.");
      return;
    }
    onSave?.({
      name: nextName,
      phone: nextPhone,
      phoneCountry: phoneCountry.trim() || "+966",
      email: email.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Someone else will be at the door"
      dialogClassName="modal-dialog--address-form"
    >
      <form onSubmit={submit}>
        {error ? (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="grid gap-3">
          <label className="text-sm font-semibold">
            Name
            <input
              className={`${FIELD_CLASS} mt-1`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
              placeholder="Full name"
            />
          </label>
          <label className="text-sm font-semibold">
            Phone
            <span className="co-phone-field mt-1">
              <input
                className="co-phone-field__dial"
                value={phoneCountry}
                onChange={(event) => setPhoneCountry(event.target.value)}
                aria-label="Phone country code"
                inputMode="tel"
              />
              <span className="co-phone-field__sep" aria-hidden />
              <input
                className="co-phone-field__number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                type="tel"
                inputMode="tel"
                placeholder="5X XXX XXXX"
                aria-label="Phone number"
              />
            </span>
          </label>
          <label className="text-sm font-semibold">
            Email <span className="font-normal text-neutral-500">(optional)</span>
            <input
              className={`${FIELD_CLASS} mt-1`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
            />
          </label>
        </div>
        <button type="submit" className="co-cta co-cta--blue mt-5 w-full">
          Save contact
        </button>
      </form>
    </Modal>
  );
}

export { OTHER_PLACEHOLDER };

function splitPhone(phone, fallbackCountry = "+966") {
  const raw = String(phone || "").trim();
  const country = String(fallbackCountry || "+966").trim() || "+966";
  if (!raw) {
    return { phoneCountry: country, phone: "" };
  }
  if (raw.startsWith("+") && raw.length > country.length && raw.startsWith(country)) {
    return { phoneCountry: country, phone: raw.slice(country.length) };
  }
  if (raw.startsWith("+")) {
    const match = raw.match(/^(\+\d{1,3})(.*)$/);
    if (match) {
      return { phoneCountry: match[1], phone: match[2].trim() };
    }
  }
  return { phoneCountry: country, phone: raw.replace(/^0+/, "") };
}
