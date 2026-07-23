"use client";

import { useEffect, useState } from "react";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import Card from "@/components/ui/Card";
import { Alert, Button, Checkbox, LoadingCenter, Spinner } from "@/components/ui";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/api/account";
import { formatApiError } from "@/lib/formatApiError";

export default function AccountNotificationsClient() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promotions: false,
    creditAlerts: true,
    smsEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    getNotificationPreferences()
      .then((data) => {
        if (!alive || !data) return;
        setPrefs({
          orderUpdates: Boolean(data.orderUpdates),
          promotions: Boolean(data.promotions),
          creditAlerts: Boolean(data.creditAlerts),
          smsEnabled: Boolean(data.smsEnabled),
        });
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load notification preferences."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateNotificationPreferences(prefs);
      setSaved(true);
    } catch (err) {
      setError(formatApiError(err, "Could not save preferences."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader title="Notifications" description="Choose how we contact you." />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" className="mb-4">
          Preferences saved.
        </Alert>
      ) : null}
      <Card>
        <form className="form-stack max-w-xl" onSubmit={onSave}>
          <Checkbox
            checked={prefs.orderUpdates}
            onChange={(e) => setPrefs((p) => ({ ...p, orderUpdates: e.target.checked }))}
            label="Order updates"
          />
          <Checkbox
            checked={prefs.promotions}
            onChange={(e) => setPrefs((p) => ({ ...p, promotions: e.target.checked }))}
            label="Promotions and offers"
          />
          <Checkbox
            checked={prefs.creditAlerts}
            onChange={(e) => setPrefs((p) => ({ ...p, creditAlerts: e.target.checked }))}
            label="Credit balance alerts"
          />
          <Checkbox
            checked={prefs.smsEnabled}
            onChange={(e) => setPrefs((p) => ({ ...p, smsEnabled: e.target.checked }))}
            label="SMS notifications"
          />
          <Button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save preferences"}
          </Button>
        </form>
      </Card>
    </>
  );
}
