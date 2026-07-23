"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { Alert, Button, Checkbox, FormField, LoadingCenter, Spinner } from "@/components/ui";
import { CommerceApiError } from "@/lib/api/client";
import * as accountApi from "@/lib/api/account";
import * as checkoutApi from "@/lib/api/checkout";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const CHECKOUT_LABELS = ["Address", "Shipping", "Payment", "Review"];

export default function CheckoutPageClient() {
  const router = useRouter();
  const { isAuthenticated, ready, user } = useAuth();
  const { cart, ensureCart, refreshCart, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [loadingBook, setLoadingBook] = useState(false);
  const [shippingOpts, setShippingOpts] = useState([]);
  const [shippingOptionId, setShippingOptionId] = useState("");
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [billingAddressId, setBillingAddressId] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace("/sign-in?intent=login&returnTo=%2Fcheckout");
    }
  }, [ready, isAuthenticated, router]);

  useEffect(() => {
    void ensureCart();
  }, [ensureCart]);

  useEffect(() => {
    if (!isAuthenticated || !ready) return;
    let alive = true;
    async function loadAddresses() {
      setLoadingBook(true);
      try {
        const rows = await accountApi.listAccountAddresses({});
        if (!alive) return;
        setAddresses(Array.isArray(rows) ? rows : rows?.items ?? []);
      } catch {
        if (!alive) return;
        setAddresses([]);
      } finally {
        if (alive) setLoadingBook(false);
      }
    }
    void loadAddresses();
    return () => {
      alive = false;
    };
  }, [isAuthenticated, ready]);

  const addressOptions = useMemo(() => {
    return addresses.map((raw) => {
      const a = raw && typeof raw === "object" ? /** @type {Record<string, unknown>} */ (raw) : {};
      const id = String(a.id ?? "");
      const label = String(a.label ?? id);
      const city = a.city ? String(a.city) : "";
      return { id, label: `${label}${city ? ` — ${city}` : ""}`, usageTypes: Array.isArray(a.usageTypes) ? a.usageTypes.map(String) : [] };
    });
  }, [addresses]);

  const shippingChoices = addressOptions.filter((a) => a.usageTypes.includes("shipping") || a.usageTypes.length === 0);
  const billingChoices = addressOptions.filter((a) => a.usageTypes.includes("billing") || a.usageTypes.length === 0);

  async function saveAddressStep(e) {
    e.preventDefault();
    if (!cart?.id) {
      setError("Cart not ready.");
      return;
    }
    if (!shippingAddressId) {
      setError("Select a shipping address.");
      return;
    }
    const billingId = billingSameAsShipping ? shippingAddressId : billingAddressId;
    if (!billingId) {
      setError("Select a billing address.");
      return;
    }
    const names = (user?.displayName ?? "Customer").split(/\s+/).filter(Boolean);
    const firstName = names[0] ?? "Customer";
    const lastName = names.slice(1).join(" ") || "User";
    setBusy(true);
    setError("");
    try {
      await checkoutApi.setCheckoutAddress(cart.id, {
        shippingAddressId,
        billingAddressId: billingId,
        billingSameAsShipping,
        deliveryContact: {
          usageTypes: ["delivery", "order_notifications"],
          firstName,
          lastName,
          email: user?.email ?? "customer@example.com",
          phone: user?.phone ?? "+966500000000",
        },
      });
      await refreshCart(cart.id);
      const opts = await checkoutApi.getShippingOptions(cart.id);
      const { unwrapShippingOptionsPayload } = await import("@/lib/checkout/mapCheckout.mjs");
      const { options } = unwrapShippingOptionsPayload(opts);
      setShippingOpts(options);
      setStep(1);
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Could not save address.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function saveShippingStep(e) {
    e.preventDefault();
    if (!cart?.id || !shippingOptionId) {
      setError("Pick a shipping option.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await checkoutApi.setCheckoutShipping(cart.id, { shippingOptionId });
      setStep(2);
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Could not save shipping.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function submitOrder(e) {
    e.preventDefault();
    if (!cart?.id) return;
    setBusy(true);
    setError("");
    try {
      const intent = await checkoutApi.createPaymentIntent(cart.id, { method: paymentMethod });
      if (paymentMethod === "card" && intent?.redirectUrl) {
        window.location.assign(intent.redirectUrl);
        return;
      }
      if (paymentMethod === "card" && intent?.paymentIntentId) {
        await checkoutApi.confirmPaymentIntent(cart.id, {
          paymentIntentId: intent.paymentIntentId,
        });
      }
      const result = await checkoutApi.submitCheckout(cart.id, {
        confirm: true,
        paymentMethod,
      });
      await clearCart();
      setDone(result);
    } catch (err) {
      const msg = err instanceof CommerceApiError ? err.message : "Checkout failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !isAuthenticated) {
    return <LoadingCenter className="py-24" />;
  }

  return (
    <>
      <h1 className="font-magistral text-2xl font-bold md:text-3xl">Checkout</h1>
      {error ? (
        <Alert variant="error" className="mb-4 mt-4">
          {error}
        </Alert>
      ) : null}

      {done ? (
        <div className="card card--padded mt-6 max-w-xl">
          <p className="m-0 text-lg font-semibold">Order submitted</p>
          <p className="mt-2 text-neutral-600">{String(done.message ?? "Thank you.")}</p>
          {done.orderNumber ? (
            <p className="mt-2 font-mono text-sm">
              Order #: <strong>{String(done.orderNumber)}</strong>
            </p>
          ) : null}
          <Link href="/account/orders" className="btn btn-primary mt-6 inline-flex">
            View orders
          </Link>
        </div>
      ) : (
        <>
          <CheckoutStepper stepIndex={Math.min(step, CHECKOUT_LABELS.length - 1)} labels={CHECKOUT_LABELS} className="mt-6" />
          {step === 0 ? (
            <form onSubmit={saveAddressStep} className="form-stack card card--padded max-w-xl">
              <p className="text-sm text-neutral-600">
                Using saved address IDs from your account. Manage addresses in{" "}
                <Link href="/account/addresses" className="text-primary hover:underline">
                  Address book
                </Link>
                .
              </p>
              {loadingBook ? <Spinner /> : null}
              <FormField id="ship" label="Shipping address" required>
                <select
                  id="ship"
                  className="select-field"
                  value={shippingAddressId}
                  onChange={(e) => setShippingAddressId(e.target.value)}
                  required
                >
                  <option value="">Select…</option>
                  {shippingChoices.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <Checkbox checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} label="Billing same as shipping" />
              {!billingSameAsShipping ? (
                <FormField id="bill" label="Billing address" required>
                  <select
                    id="bill"
                    className="select-field"
                    value={billingAddressId}
                    onChange={(e) => setBillingAddressId(e.target.value)}
                    required
                  >
                    <option value="">Select…</option>
                    {billingChoices.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : null}
              <p className="text-xs text-neutral-500">
                Delivery contact for this order is prefilled from your profile ({user?.email ?? "add email in profile"}).
              </p>
              <Button type="submit" className="btn-primary w-full max-w-xs" disabled={busy}>
                {busy ? <Spinner size="sm" /> : "Continue to shipping"}
              </Button>
            </form>
          ) : null}

          {step === 1 ? (
            <form onSubmit={saveShippingStep} className="form-stack card card--padded max-w-xl">
              <FormField id="shipopt" label="Shipping method" required>
                <select
                  id="shipopt"
                  className="select-field"
                  value={shippingOptionId}
                  onChange={(e) => setShippingOptionId(e.target.value)}
                  required
                >
                  <option value="">Select…</option>
                  {shippingOpts.map((raw) => {
                    const o = raw && typeof raw === "object" ? /** @type {{ id?: string; label?: string }} */ (raw) : {};
                    const id = String(o.id ?? "");
                    return (
                      <option key={id} value={id}>
                        {String(o.label ?? id)}
                      </option>
                    );
                  })}
                </select>
              </FormField>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="btn-outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button type="submit" className="btn-primary" disabled={busy}>
                  {busy ? <Spinner size="sm" /> : "Continue"}
                </Button>
              </div>
            </form>
          ) : null}

          {step === 2 ? (
            <div className="card card--padded max-w-xl form-stack">
              <FormField id="paymethod" label="Payment method" required>
                <select
                  id="paymethod"
                  className="select-field"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cod">Cash on delivery</option>
                  <option value="wire">Wire transfer</option>
                  <option value="card">
                    {(process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "sandbox").toLowerCase() === "paytabs"
                      ? "Debit / credit card (PayTabs)"
                      : "Debit / credit card (sandbox)"}
                  </option>
                </select>
              </FormField>
              <Button type="button" className="btn-primary max-w-xs" onClick={() => setStep(3)}>
                Continue to review
              </Button>
              <Button type="button" variant="outline" className="btn-outline max-w-xs" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          ) : null}

          {step === 3 ? (
            <form onSubmit={submitOrder} className="form-stack card card--padded max-w-xl">
              <p className="text-sm text-neutral-600">Confirm your order. Submit creates the sales order in the commerce API.</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="btn-outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" className="btn-primary" disabled={busy}>
                  {busy
                    ? "Working…"
                    : paymentMethod === "card" &&
                        (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "sandbox").toLowerCase() === "paytabs"
                      ? "Pay securely with PayTabs"
                      : "Place order"}
                </Button>
              </div>
            </form>
          ) : null}
        </>
      )}
    </>
  );
}
