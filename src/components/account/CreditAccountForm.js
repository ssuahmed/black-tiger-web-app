"use client";

import { useState } from "react";
import { Alert, Button, Checkbox, FormField, Input, Spinner, Textarea } from "@/components/ui";
import { CommerceApiError } from "@/lib/api/client";
import * as accountApi from "@/lib/api/account";

/**
 * Open Credit Account application form (1440 mock sections).
 * @param {{
 *   onSuccess?: (data: Record<string, unknown>) => void;
 *   className?: string;
 *   requireAuthNote?: boolean;
 * }} props
 */
export default function CreditAccountForm({ onSuccess, className = "", requireAuthNote = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const [billingCountry, setBillingCountry] = useState("SA");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingMailStop, setBillingMailStop] = useState("");
  const [billingLine1, setBillingLine1] = useState("");
  const [billingLine2, setBillingLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostal, setBillingPostal] = useState("");
  const [billingPostalExt, setBillingPostalExt] = useState("");

  const [yearFounded, setYearFounded] = useState("");
  const [companyClass, setCompanyClass] = useState("Unclassed");
  const [dunsNumber, setDunsNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubsidiary, setIsSubsidiary] = useState(false);

  const [apPhone, setApPhone] = useState("");
  const [apEmail, setApEmail] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [creditLimitDesired, setCreditLimitDesired] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceInstructions, setInvoiceInstructions] = useState("");

  const [submitterName, setSubmitterName] = useState("");
  const [submitterTitle, setSubmitterTitle] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setBusy(true);
    try {
      const payload = {
        billing: {
          countryCode: billingCountry.trim(),
          companyName: billingCompany.trim(),
          mailStop: billingMailStop.trim() || undefined,
          addressLine1: billingLine1.trim(),
          addressLine2: billingLine2.trim() || undefined,
          city: billingCity.trim(),
          stateCode: billingState.trim(),
          postalCode: billingPostal.trim(),
          postalCodeExt: billingPostalExt.trim() || undefined,
        },
        company: {
          yearFounded: yearFounded.trim() ? Number(yearFounded) : undefined,
          companyClass: companyClass.trim(),
          dunsNumber: dunsNumber.trim() || undefined,
          website: website.trim() || undefined,
          isSubsidiary,
        },
        preferences: {
          accountsPayablePhone: apPhone.trim(),
          accountsPayableEmail: apEmail.trim(),
          currency: currency.trim() || "SAR",
          creditLimitDesired: Number(creditLimitDesired),
          preferredLanguage: preferredLanguage.trim() || undefined,
        },
        invoiceDelivery: {
          email: invoiceEmail.trim(),
          instructions: invoiceInstructions.trim() || undefined,
        },
        submitter: {
          name: submitterName.trim(),
          title: submitterTitle.trim() || "—",
          phone: submitterPhone.trim(),
          email: submitterEmail.trim(),
        },
      };

      if (!payload.preferences.creditLimitDesired || Number.isNaN(payload.preferences.creditLimitDesired)) {
        setError("Credit limit desired must be a number.");
        return;
      }

      const data = await accountApi.submitCreditApplication(payload);
      setSuccess(data);
      onSuccess?.(data && typeof data === "object" ? data : {});
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Submission failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={["acc-credit-form font-sf-pro", className].filter(Boolean).join(" ")}>
      <header className="acc-card acc-credit-form__panel">
        <h2 className="acc-credit-form__title">Open a Credit Account</h2>
        <p className="acc-credit-form__lead">
          Opening a credit account allows you to pay for all of your Black Tiger orders with a single
          payment. Once your account is open, you can place as many orders as you need within your
          payment terms and make one payment.
        </p>
        <p className="acc-credit-form__lead acc-credit-form__lead--last">
          Completing the Account Application form below takes just a few minutes. We will review your
          application and respond within approximately 5 days. If you have any questions, please email{" "}
          <a href="mailto:accounting@blacktiger.com.sa">accounting@blacktiger.com.sa</a>.
        </p>
      </header>

      {requireAuthNote ? (
        <Alert variant="info">
          Sign in is required so we can save this application to your customer account.
        </Alert>
      ) : null}

      <p className="acc-credit-form__section-label">Account Application</p>

      <section className="acc-card acc-credit-form__panel">
        <h3 className="acc-credit-form__group-title">Billing Address</h3>
        <div className="acc-credit-form__grid">
          <FormField id="b-country" label="Country/Region" required>
            <select
              id="b-country"
              className="acc-credit-form__select"
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
              disabled={busy}
            >
              <option value="SA">Saudi Arabia</option>
              <option value="AE">United Arab Emirates</option>
              <option value="US">United States</option>
            </select>
          </FormField>
          <FormField id="b-co" label="Company Name" required>
            <Input id="b-co" value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="b-ms" label="Mail Stop">
            <Input id="b-ms" value={billingMailStop} onChange={(e) => setBillingMailStop(e.target.value)} disabled={busy} />
          </FormField>
          <FormField id="b-a1" label="Address Line 1" required>
            <Input id="b-a1" value={billingLine1} onChange={(e) => setBillingLine1(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="b-a2" label="Address Line 2" className="acc-credit-form__span-2">
            <Input id="b-a2" value={billingLine2} onChange={(e) => setBillingLine2(e.target.value)} disabled={busy} />
          </FormField>
          <FormField id="b-city" label="City" required>
            <Input id="b-city" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="b-state" label="State" required>
            <Input id="b-state" value={billingState} onChange={(e) => setBillingState(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="b-zip" label="Postal Code" required>
            <div className="acc-credit-form__postal">
              <Input id="b-zip" value={billingPostal} onChange={(e) => setBillingPostal(e.target.value)} disabled={busy} required />
              <span aria-hidden>-</span>
              <Input
                id="b-zipe"
                value={billingPostalExt}
                onChange={(e) => setBillingPostalExt(e.target.value)}
                disabled={busy}
                aria-label="Postal code extension"
              />
            </div>
          </FormField>
        </div>
      </section>

      <section className="acc-card acc-credit-form__panel">
        <h3 className="acc-credit-form__group-title">Company Information</h3>
        <div className="acc-credit-form__grid">
          <FormField id="yf" label="Year Founded" required>
            <Input id="yf" inputMode="numeric" value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="cc" label="Company Class" required>
            <select
              id="cc"
              className="acc-credit-form__select"
              value={companyClass}
              onChange={(e) => setCompanyClass(e.target.value)}
              disabled={busy}
            >
              <option value="Unclassed">Unclassed</option>
              <option value="Distributor">Distributor</option>
              <option value="Fleet">Fleet</option>
              <option value="Workshop">Workshop</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField id="duns" label="Dun & Bradstreet Number">
            <Input id="duns" value={dunsNumber} onChange={(e) => setDunsNumber(e.target.value)} disabled={busy} />
          </FormField>
          <FormField id="web" label="Website">
            <Input id="web" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={busy} />
          </FormField>
        </div>
        <div className="acc-credit-form__checkbox">
          <Checkbox
            checked={isSubsidiary}
            onChange={(e) => setIsSubsidiary(e.target.checked)}
            label="My company is a subsidiary of another company"
          />
        </div>
      </section>

      <section className="acc-card acc-credit-form__panel">
        <h3 className="acc-credit-form__group-title">Contact and Account Preferences</h3>
        <div className="acc-credit-form__grid">
          <FormField id="ap-phone" label="Accounts Payable Phone" required>
            <Input id="ap-phone" value={apPhone} onChange={(e) => setApPhone(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="ap-email" label="Accounts Payable Email" required>
            <Input id="ap-email" type="email" value={apEmail} onChange={(e) => setApEmail(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="cur" label="Currency" required>
            <select
              id="cur"
              className="acc-credit-form__select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={busy}
            >
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
            </select>
          </FormField>
          <FormField id="cl" label="Credit Limit Desired">
            <Input id="cl" inputMode="decimal" value={creditLimitDesired} onChange={(e) => setCreditLimitDesired(e.target.value)} disabled={busy} />
          </FormField>
          <FormField id="plang" label="Preferred language">
            <Input id="plang" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} disabled={busy} />
          </FormField>
        </div>
      </section>

      <section className="acc-card acc-credit-form__panel">
        <h3 className="acc-credit-form__group-title">Invoice Delivery</h3>
        <p className="acc-credit-form__hint">
          Please enter the email address where you would like invoices sent.
        </p>
        <div className="acc-credit-form__grid">
          <FormField id="inv-email" label="Email" required className="acc-credit-form__span-2">
            <Input id="inv-email" type="email" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="inv-ins" label="Other Billing Instructions" className="acc-credit-form__span-2">
            <Textarea id="inv-ins" value={invoiceInstructions} onChange={(e) => setInvoiceInstructions(e.target.value)} disabled={busy} rows={5} />
          </FormField>
        </div>
      </section>

      <section className="acc-card acc-credit-form__panel">
        <h3 className="acc-credit-form__group-title">Submitted by</h3>
        <p className="acc-credit-form__hint">In case we need to contact you regarding this application</p>
        <div className="acc-credit-form__grid">
          <FormField id="sn" label="Name" required>
            <Input id="sn" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="st" label="Title">
            <Input id="st" value={submitterTitle} onChange={(e) => setSubmitterTitle(e.target.value)} disabled={busy} />
          </FormField>
          <FormField id="sp" label="Telephone" required>
            <Input id="sp" value={submitterPhone} onChange={(e) => setSubmitterPhone(e.target.value)} disabled={busy} required />
          </FormField>
          <FormField id="se" label="Email" required>
            <Input id="se" type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} disabled={busy} required />
          </FormField>
        </div>
      </section>

      {success ? (
        <Alert variant="success" role="status">
          Application received. We will review it within approximately 5 days.
          {success.applicationId ? ` Reference: ${String(success.applicationId)}` : ""}
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="error">
          {error}
        </Alert>
      ) : null}

      <div className="acc-credit-form__actions">
        <Button type="submit" className="btn-primary acc-credit-form__submit" disabled={busy || Boolean(success)}>
          {busy ? <Spinner size="sm" /> : success ? "Submitted" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
