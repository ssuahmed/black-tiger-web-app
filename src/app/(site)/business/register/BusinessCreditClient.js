"use client";

import Link from "next/link";
import { useState } from "react";
import SiteContainer from "@/components/layout/SiteContainer";
import { Alert, Button, Checkbox, FormField, Input, Spinner, Textarea } from "@/components/ui";
import { CommerceApiError } from "@/lib/api/client";
import * as accountApi from "@/lib/api/account";
import { useAuth } from "@/contexts/AuthContext";

export default function BusinessCreditClient() {
  const { isAuthenticated, ready } = useAuth();
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
  const [companyClass, setCompanyClass] = useState("");
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
          title: submitterTitle.trim(),
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
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Submission failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16">
      <SiteContainer>
        <h1 className="font-magistral text-2xl font-bold md:text-3xl">Open a credit account</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          B2B credit application mapped to <code className="text-xs">POST /account/business/credit-application</code>. Sign in is recommended so we can
          associate your company profile.
        </p>
        {!isAuthenticated ? (
          <Alert variant="info" className="mt-6 max-w-3xl">
            You can draft this form without signing in, but some tenants require authentication.{" "}
            <Link href="/sign-in" className="font-semibold text-primary underline">
              Sign in
            </Link>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="form-stack mt-8 max-w-3xl card card--padded">
          <h2 className="font-magistral text-lg font-bold">Billing address</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="b-country" label="Country / Region" required>
              <Input id="b-country" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-co" label="Company name" required>
              <Input id="b-co" value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-ms" label="Mail stop">
              <Input id="b-ms" value={billingMailStop} onChange={(e) => setBillingMailStop(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-a1" label="Address line 1" required>
              <Input id="b-a1" value={billingLine1} onChange={(e) => setBillingLine1(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-a2" label="Address line 2" className="md:col-span-2">
              <Input id="b-a2" value={billingLine2} onChange={(e) => setBillingLine2(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-city" label="City" required>
              <Input id="b-city" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-state" label="State" required>
              <Input id="b-state" value={billingState} onChange={(e) => setBillingState(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-zip" label="Postal code" required>
              <Input id="b-zip" value={billingPostal} onChange={(e) => setBillingPostal(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="b-zipe" label="Postal ext">
              <Input id="b-zipe" value={billingPostalExt} onChange={(e) => setBillingPostalExt(e.target.value)} disabled={busy} />
            </FormField>
          </div>

          <h2 className="font-magistral mt-6 text-lg font-bold">Company information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="yf" label="Year founded">
              <Input id="yf" inputMode="numeric" value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="cc" label="Company class" required>
              <Input id="cc" value={companyClass} onChange={(e) => setCompanyClass(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="duns" label="D&B number">
              <Input id="duns" value={dunsNumber} onChange={(e) => setDunsNumber(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="web" label="Website">
              <Input id="web" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={busy} />
            </FormField>
          </div>
          <Checkbox checked={isSubsidiary} onChange={(e) => setIsSubsidiary(e.target.checked)} label="Subsidiary" />

          <h2 className="font-magistral mt-6 text-lg font-bold">Contact & preferences</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="ap-phone" label="Accounts payable phone" required>
              <Input id="ap-phone" value={apPhone} onChange={(e) => setApPhone(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="ap-email" label="Accounts payable email" required>
              <Input id="ap-email" type="email" value={apEmail} onChange={(e) => setApEmail(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="cur" label="Currency" required>
              <Input id="cur" value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="cl" label="Credit limit desired" required>
              <Input id="cl" inputMode="decimal" value={creditLimitDesired} onChange={(e) => setCreditLimitDesired(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="plang" label="Preferred language">
              <Input id="plang" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} disabled={busy} />
            </FormField>
          </div>

          <h2 className="font-magistral mt-6 text-lg font-bold">Invoice delivery</h2>
          <FormField id="inv-email" label="Invoice email" required>
            <Input id="inv-email" type="email" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} disabled={busy} />
          </FormField>
          <FormField id="inv-ins" label="Other billing instructions">
            <Textarea id="inv-ins" value={invoiceInstructions} onChange={(e) => setInvoiceInstructions(e.target.value)} disabled={busy} />
          </FormField>

          <h2 className="font-magistral mt-6 text-lg font-bold">Submitted by</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="sn" label="Name" required>
              <Input id="sn" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="st" label="Title" required>
              <Input id="st" value={submitterTitle} onChange={(e) => setSubmitterTitle(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="sp" label="Telephone" required>
              <Input id="sp" value={submitterPhone} onChange={(e) => setSubmitterPhone(e.target.value)} disabled={busy} />
            </FormField>
            <FormField id="se" label="Email" required>
              <Input id="se" type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} disabled={busy} />
            </FormField>
          </div>

          {success ? (
            <Alert variant="success" role="status">
              Application received. Reference: {String(success.applicationId ?? success.status ?? "")}
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="error" className="form-global-error">
              {error}
            </Alert>
          ) : null}

          <Button type="submit" className="btn-primary max-w-xs" disabled={busy}>
            {busy ? <Spinner size="sm" /> : "Submit application"}
          </Button>
        </form>
      </SiteContainer>
    </div>
  );
}
