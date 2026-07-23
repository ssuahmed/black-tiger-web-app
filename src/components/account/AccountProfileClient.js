"use client";

import { useEffect, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, Button, Checkbox, FormField, Input, LoadingCenter, Spinner } from "@/components/ui";
import { getAccountProfile, updateAccountProfile } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";

export default function AccountProfileClient() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredLanguage: "en",
    marketingOptIn: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    getAccountProfile()
      .then((data) => {
        if (!alive || !data) return;
        setForm({
          firstName: String(data.firstName ?? ""),
          lastName: String(data.lastName ?? ""),
          email: String(data.email ?? ""),
          phone: String(data.phone ?? ""),
          preferredLanguage: String(data.preferredLanguage ?? "en"),
          marketingOptIn: Boolean(data.marketingOptIn),
        });
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load profile."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateAccountProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        preferredLanguage: form.preferredLanguage,
        marketingOptIn: form.marketingOptIn,
      });
      setSaved(true);
    } catch (err) {
      setError(formatApiError(err, "Could not save profile."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader title="Profile" description="Manage your personal details." />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" className="mb-4">
          Profile saved.
        </Alert>
      ) : null}
      <Card>
        <form className="form-stack max-w-xl" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="firstName" label="First name">
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                disabled={saving}
              />
            </FormField>
            <FormField id="lastName" label="Last name">
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                disabled={saving}
              />
            </FormField>
          </div>
          <FormField id="email" label="Email">
            <Input id="email" value={form.email} disabled readOnly />
          </FormField>
          <FormField id="phone" label="Mobile">
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              disabled={saving}
            />
          </FormField>
          <FormField id="language" label="Preferred language">
            <select
              id="language"
              className="box-border w-full min-h-10 border border-neutral-300 bg-white px-3 py-2 text-sm"
              value={form.preferredLanguage}
              onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}
              disabled={saving}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </FormField>
          <Checkbox
            checked={form.marketingOptIn}
            onChange={(e) => setForm((f) => ({ ...f, marketingOptIn: e.target.checked }))}
            label="Email me with news and offers"
          />
          <Button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save changes"}
          </Button>
        </form>
      </Card>
    </>
  );
}
