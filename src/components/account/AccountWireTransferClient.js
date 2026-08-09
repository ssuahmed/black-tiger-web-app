"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import { Alert, LoadingCenter } from "@/components/ui";
import { listAccountOrders, uploadWireReceipt } from "@/lib/api/account";
import { normalizeOrderRow } from "@/lib/account/mapAccount.mjs";
import { formatApiError } from "@/lib/formatApiError";

export default function AccountWireTransferClient() {
  const searchParams = useSearchParams();
  const presetOrderId = String(searchParams.get("orderId") || "").trim();
  const presetOrderNumber = String(searchParams.get("orderNumber") || "").trim();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderId, setOrderId] = useState(presetOrderId);
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [file, setFile] = useState(/** @type {File | null} */ (null));

  useEffect(() => {
    let alive = true;
    listAccountOrders({ page: 1, pageSize: 50 })
      .then((data) => {
        if (!alive) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        const rows = items.map((row) =>
          normalizeOrderRow(row && typeof row === "object" ? row : {}),
        );
        setOrders(rows);
        if (!presetOrderId && rows[0]?.id) {
          setOrderId(String(rows[0].id));
        }
      })
      .catch((err) => {
        if (!alive) return;
        setError(formatApiError(err, "Could not load orders."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [presetOrderId]);

  useEffect(() => {
    if (presetOrderId) setOrderId(presetOrderId);
  }, [presetOrderId]);

  const selectedOrder = useMemo(
    () => orders.find((row) => String(row.id) === String(orderId)) || null,
    [orders, orderId],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!orderId) {
      setError("Select an order.");
      return;
    }
    if (!amount.trim()) {
      setError("Enter the transfer amount.");
      return;
    }
    if (!transferDate.trim()) {
      setError("Enter the transfer date.");
      return;
    }
    if (!(file instanceof File)) {
      setError("Choose a receipt file (PDF or image).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be 10 MB or smaller.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await uploadWireReceipt({
        orderId: String(orderId),
        orderNumber:
          selectedOrder?.orderNumber ||
          presetOrderNumber ||
          undefined,
        amount: amount.trim(),
        transferDate: transferDate.trim(),
        file,
      });
      setSuccess(
        `Receipt submitted for order ${String(result?.orderNumber || selectedOrder?.orderNumber || orderId)}. Our team will verify it shortly.`,
      );
      setAmount("");
      setTransferDate("");
      setFile(null);
      const input = document.getElementById("wire-receipt-file");
      if (input instanceof HTMLInputElement) input.value = "";
    } catch (err) {
      setError(formatApiError(err, "Could not upload wire transfer receipt."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingCenter className="min-h-[30vh]" />;

  return (
    <>
      <AccountPageHeader
        title="Link Wire Transfer to orders"
        description="Upload your bank transfer receipt so we can match payment to your order."
      />
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      ) : null}

      <form className="acc-wire-form" onSubmit={handleSubmit}>
        <label className="acc-wire-form__field">
          <span className="sr-only">Order</span>
          <select
            className="acc-wire-form__control"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            required
          >
            {!orders.length ? <option value="">No orders available</option> : null}
            {orders.map((row) => (
              <option key={row.id || row.orderNumber} value={String(row.id)}>
                Order # {row.orderNumber || row.id}
              </option>
            ))}
          </select>
        </label>

        <label className="acc-wire-form__field">
          <span className="sr-only">Transfer amount</span>
          <input
            className="acc-wire-form__control"
            type="number"
            min="0"
            step="0.01"
            placeholder="Transfer Amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </label>

        <label className="acc-wire-form__field">
          <span className="sr-only">Transfer date</span>
          <input
            className="acc-wire-form__control"
            type="date"
            placeholder="Transfer Date"
            value={transferDate}
            onChange={(event) => setTransferDate(event.target.value)}
            required
          />
        </label>

        <label className="acc-wire-form__file">
          <span className="acc-wire-form__file-btn">Choose File</span>
          <span className="acc-wire-form__file-name">
            {file ? file.name : "No file chosen"}
          </span>
          <input
            id="wire-receipt-file"
            className="sr-only"
            type="file"
            accept=".pdf,image/jpeg,image/png,image/jpg,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>

        <button
          type="submit"
          className="acc-wire-form__submit"
          disabled={submitting || !orders.length}
        >
          {submitting ? "Submitting…" : "Submit for verification"}
        </button>
      </form>
    </>
  );
}
