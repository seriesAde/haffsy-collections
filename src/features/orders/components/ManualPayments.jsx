import ReceiptViewer from './ReceiptViewer';
import { useEffect, useRef, useState } from "react";
import { useDemo } from "../../admin/DemoContext";
import { useAuth } from "../../auth/AuthContext";
import { api, upload } from "../../../services/api";
import { Field } from "../../admin/components/AdminUI";
import { primaryClass, inputClass } from "../../admin/components/styles";
import { money } from "../../../lib/documents";
import PaymentProofInput from "./PaymentProofInput";
export default function ManualPayments({ invoice }) {
  const { orders, loadOrder, refresh } = useDemo(),
    { user } = useAuth(),
    order = orders[invoice.id];
  const submitting = useRef(false);
  const [proofKey, setProofKey] = useState(0);
  const [details, setDetails] = useState(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function reload() {
    if (order?.apiId) setDetails(await loadOrder(order.apiId));
  }
  useEffect(() => {
    let active = true;
    if (order?.apiId)
      loadOrder(order.apiId)
        .then((d) => {
          if (active) setDetails(d);
        })
        .catch((e) => {
          if (active) setNotice(e.message);
        });
    return () => {
      active = false;
    };
  }, [order?.apiId]); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(e) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const form = e.currentTarget,
      data = new FormData(form);
    setBusy(true);
    try {
      const file = data.get("evidence");
      if (!file?.size)
        throw new Error("Upload proof of payment before submitting.");
      if (
        !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          file.type,
        ) ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error("Use a JPG, PNG, WebP or PDF up to 10 MB.");
      const evidence = (await upload(file, "payment")).id;
      await api("/orders/" + order.apiId + "/payments", {
        method: "POST",
        body: {
          method: data.get("method"),
          amount: Number(data.get("amount")),
          ...(evidence ? { evidence } : {}),
        },
      });
      form.reset();
      setProofKey((key) => key + 1);
      setNotice(
        user.role === "Admin"
          ? "Payment confirmed and recorded."
          : "Payment recorded. Awaiting verification.",
      );
      await reload();
      await refresh();
    } catch (e) {
      setNotice(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  async function review(id, status) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    try {
      await api("/payments/" + id + "/review", {
        method: "POST",
        body: { status },
      });
      await reload();
      await refresh();
      setNotice(
        status === "Verified"
          ? "Payment confirmed."
          : "Payment declined. The customer can submit a new payment.",
      );
    } catch (e) {
      setNotice(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  if (!order) return <p>No order is attached to this invoice.</p>;
  const canReview = ["Admin", "Manager"].includes(user.role);
  const pending =
    details?.payments.filter((payment) => payment.status === "Pending") || [];
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p>Payment status: {details?.paymentStatus || "Loading..."}</p>
        <p>Verified paid: {money(details?.paid || 0, invoice.currency)}</p>
        <p>
          Outstanding balance: {money(details?.balance || 0, invoice.currency)}
        </p>
      </div>
      {!order.feeConfirmed && (
        <p className="text-sm text-muted">
          Confirm the delivery fee in Fulfillment before the order can be marked
          Paid.
        </p>
      )}
      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-500/10 p-4">
          <h3 className="font-semibold">
            {canReview
              ? "Payment awaiting your review"
              : "Payment submitted for review"}
          </h3>
          <p className="mt-1 text-sm">
            {canReview
              ? "Review the amount and attached receipt below, then confirm or decline. No new receipt upload is needed."
              : "Your receipt has been submitted. Please wait for confirmation before submitting another payment."}
          </p>
        </div>
      )}
      <div className="space-y-3">
        {details?.payments.map((p) => (
          <article
            key={p.id}
            className="space-y-3 rounded-xl border border-outline bg-surface p-5"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="font-semibold">
                {p.method}: {money(p.amount, invoice.currency)}
              </h3>
              <span className="text-sm text-muted">
                {p.status === "Verified"
                  ? "Confirmed"
                  : p.status === "Rejected"
                    ? "Declined"
                    : "Awaiting confirmation"}
              </span>
            </div>
            {p.evidence && <ReceiptViewer url={p.evidence.url}/>}
            {p.status === "Pending" && canReview && (
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={busy}
                  className={primaryClass}
                  onClick={() => review(p.id, "Verified")}
                >
                  Confirm payment
                </button>
                <button
                  disabled={busy}
                  className="rounded-lg border border-red-400 px-4 py-2 font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                  onClick={() => review(p.id, "Rejected")}
                >
                  Decline payment
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {details && !pending.length && details.paymentStatus !== "Paid" && (
        <form
          onSubmit={save}
          className="space-y-3 rounded-xl border border-outline p-5"
        >
          <h3 className="font-semibold">
            {canReview ? "Record a received payment" : "Submit payment"}
          </h3>
          <Field label="Method">
            <select name="method" className={inputClass}>
              <option>Cash</option>
              <option>Transfer</option>
            </select>
          </Field>
          <Field label="Amount paid">
            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              required
              className={inputClass}
            />
          </Field>
          <PaymentProofInput key={proofKey} disabled={busy} />
          <button disabled={busy} className={primaryClass}>
            {busy
              ? "Saving..."
              : user.role === "Admin"
                ? "Confirm received payment"
                : "Submit payment for review"}
          </button>
        </form>
      )}
      <p role="status">{notice}</p>
    </section>
  );
}
