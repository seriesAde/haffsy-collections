import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useDemo } from "../../admin/DemoContext";
import { api } from "../../../services/api";
import { money } from "../../../lib/documents";
import { primaryClass } from "../../admin/components/styles";
import ManualPayments from "../../orders/components/ManualPayments";

export default function StoreOrderDetailsPage() {
  const { id } = useParams();
  const { orders, invoices, refresh } = useDemo();
  const order = orders[id],
    invoice = invoices.find((item) => item.id === id);
  const [details, setDetails] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!order) return;
    const controller = new AbortController();
    api("/orders/" + order.apiId, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setDetails(result.data.order);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [order?.apiId, order?.status]); // eslint-disable-line react-hooks/exhaustive-deps
  async function receive() {
    if (busy || !window.confirm("Confirm that you have received this order?"))
      return;
    setBusy(true);
    setError("");
    try {
      await api("/orders/" + order.apiId + "/stage", {
        method: "POST",
        body: { stage: "Received" },
      });
      await refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  if (!order || !invoice)
    return (
      <p>
        Order not found. <Link to="/orders">Your orders</Link>
      </p>
    );
  const rider =
    details?.id === order.apiId
      ? details.manualRider?.name
        ? details.manualRider
        : details.rider
      : null;
  return (
    <section className="space-y-6">
      <Link className="text-accent" to="/orders">
        Back to orders
      </Link>
      <h1 className="text-3xl font-bold">Order {id}</h1>
      <div className="grid gap-3 rounded-xl border border-outline p-5 sm:grid-cols-2">
        <p>Status: {order.status}</p>
        <p>{order.method}</p>
        <p>Location: {order.location || "Store pickup"}</p>
        <p>
          Delivery:{" "}
          {order.feeConfirmed
            ? money(order.fee, invoice.currency)
            : "To be confirmed"}
        </p>
        <p>Total: {money(order.total ?? invoice.amount, invoice.currency)}</p>
      </div>
      {order.method === "Delivery" &&
        ["Sent out", "Received"].includes(order.status) && (
          <div className="rounded-xl border border-outline p-5">
            <h2 className="font-semibold">Your delivery rider</h2>
            {rider?.name ? (
              <>
                <p>{rider.name}</p>
                <a className="text-accent" href={"tel:" + rider.phone}>
                  {rider.phone}
                </a>
              </>
            ) : (
              <p>Rider details are not available yet.</p>
            )}
          </div>
        )}
      <div className="rounded-xl border border-outline p-5">
        <h2 className="mb-3 text-xl font-bold">Items</h2>
        {invoice.lines.map((line, index) => (
          <div
            key={index}
            className="flex justify-between gap-4 border-b border-outline py-3"
          >
            <span>
              {line.name} ? {line.quantity}
            </span>
            <span>{money(line.quantity * line.price, invoice.currency)}</span>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold">Order timeline</h2>
        {order.timeline?.map((event, index) => (
          <p key={index} className="mt-2">
            {event.stage} ? {new Date(event.at).toLocaleString()}
          </p>
        ))}
      </div>
      {order.method === "Delivery" && order.status === "Sent out" && (
        <button disabled={busy} className={primaryClass} onClick={receive}>
          {busy ? "Confirming..." : "Mark as received"}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      <ManualPayments invoice={invoice} />
    </section>
  );
}
