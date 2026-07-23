"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { Alert } from "@/components/ui";
import { submitContactInquiry } from "@/lib/api/contact";
import { formatApiError } from "@/lib/formatApiError";

const COUNTRIES = [
  { value: "", label: "Select country" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "TR", label: "Turkey" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "IR", label: "Iran" },
  { value: "MA", label: "Morocco" },
  { value: "DZ", label: "Algeria" },
  { value: "EG", label: "Egypt" },
  { value: "CI", label: "Ivory Coast" },
  { value: "NG", label: "Nigeria" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
];

export default function ContactForm() {
  const baseId = useId();
  const [title, setTitle] = useState("mr");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const result = await submitContactInquiry({
        title,
        name: String(data.get("name") ?? ""),
        company: String(data.get("company") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        address: String(data.get("address") ?? ""),
        city: String(data.get("city") ?? ""),
        country: String(data.get("country") ?? ""),
        message: String(data.get("message") ?? ""),
        source: "storefront-contact",
      });
      setDone(String(result?.message ?? "Thank you. Your inquiry has been received."));
      form.reset();
      setTitle("mr");
    } catch (err) {
      setError(formatApiError(err, "Could not submit your inquiry."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {done ? (
        <Alert variant="success" className="mb-4" role="status">
          {done}
        </Alert>
      ) : null}

      <fieldset className="contact-form__fieldset">
        <legend className="contact-form__legend">
          Title<span className="form-label__req" aria-hidden>*</span>
        </legend>
        <div className="contact-form__radios" role="radiogroup" aria-label="Title">
          <label className="contact-form__radio">
            <input
              type="radio"
              name={`${baseId}-title`}
              value="mr"
              checked={title === "mr"}
              onChange={() => setTitle("mr")}
            />
            <span>Mr.</span>
          </label>
          <label className="contact-form__radio">
            <input
              type="radio"
              name={`${baseId}-title`}
              value="mrs"
              checked={title === "mrs"}
              onChange={() => setTitle("mrs")}
            />
            <span>Mrs.</span>
          </label>
        </div>
      </fieldset>

      <FormField id={`${baseId}-name`} label="Name" required>
        <Input id={`${baseId}-name`} name="name" type="text" required autoComplete="name" disabled={busy} />
      </FormField>

      <FormField id={`${baseId}-company`} label="Company" required>
        <Input id={`${baseId}-company`} name="company" type="text" required autoComplete="organization" disabled={busy} />
      </FormField>

      <FormField id={`${baseId}-email`} label="Email" required>
        <Input id={`${baseId}-email`} name="email" type="email" required autoComplete="email" disabled={busy} />
      </FormField>

      <FormField id={`${baseId}-phone`} label="Phone Number" required>
        <Input id={`${baseId}-phone`} name="phone" type="tel" required autoComplete="tel" disabled={busy} />
      </FormField>

      <FormField id={`${baseId}-address`} label="Address" hint="Street Address" hintAbove required>
        <Input id={`${baseId}-address`} name="address" type="text" required autoComplete="street-address" disabled={busy} />
      </FormField>

      <div className="contact-form__grid-2">
        <FormField id={`${baseId}-city`} label="City" hint="Postal / Zip Code" hintAbove required>
          <Input id={`${baseId}-city`} name="city" type="text" required autoComplete="address-level2" disabled={busy} />
        </FormField>

        <FormField id={`${baseId}-region`} label="State / Province / Region" hint="Country" hintAbove required>
          <Select id={`${baseId}-region`} name="country" required defaultValue="" disabled={busy}>
            {COUNTRIES.map((c) => (
              <option key={c.value || "placeholder"} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id={`${baseId}-message`} label="Message" required>
        <Textarea id={`${baseId}-message`} name="message" required rows={6} disabled={busy} />
      </FormField>

      <div className="contact-form__actions">
        <Button type="submit" variant="primary" className="contact-form__submit" disabled={busy}>
          {busy ? "SUBMITTING…" : "SUBMIT"}
        </Button>
      </div>
    </form>
  );
}
