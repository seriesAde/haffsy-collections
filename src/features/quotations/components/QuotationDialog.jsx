import { useEffect, useRef } from "react";
import { Field } from "../../admin/components/AdminUI";
import {
  inputClass,
  primaryClass,
  secondaryClass,
} from "../../admin/components/styles";
export default function QuotationDialog({
  entry,
  mode,
  onClose,
  onSave,
  onDelete,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  const view = mode === "view",
    remove = mode === "delete";
  function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!data.customer.trim()) return;
    onSave({
      ...entry,
      ...data,
      customer: data.customer.trim(),
      items: Number(data.items),
      amount: Number(data.amount),
    });
  }
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      aria-labelledby="quotation-title"
      className="m-auto w-[calc(100%-32px)] max-w-lg rounded-xl border border-outline bg-surface p-6 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <h2 id="quotation-title" className="mb-5 text-xl font-bold">
        {remove
          ? "Delete quotation?"
          : view
            ? entry.id
            : entry
              ? "Edit Quotation"
              : "Create Quotation"}
      </h2>
      {remove ? (
        <>
          <p className="text-muted">
            Delete {entry.id} for {entry.customer} from this demo session?
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded-lg bg-red-600 px-5 py-2 text-white"
            >
              Delete
            </button>
            <button className={secondaryClass} onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Customer *">
            <input
              readOnly={view}
              className={inputClass}
              name="customer"
              defaultValue={entry?.customer}
              required
              pattern=".*\S.*"
            />
          </Field>
          <Field label="Date *">
            <input
              readOnly={view}
              className={inputClass}
              type="date"
              name="date"
              defaultValue={
                entry?.date || new Date().toISOString().slice(0, 10)
              }
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Items *">
              <input
                readOnly={view}
                className={inputClass}
                type="number"
                name="items"
                min="1"
                step="1"
                defaultValue={entry?.items || 1}
                required
              />
            </Field>
            <Field label="Amount (USD) *">
              <input
                readOnly={view}
                className={inputClass}
                type="number"
                name="amount"
                min="0"
                step="0.01"
                defaultValue={entry?.amount}
                required
              />
            </Field>
          </div>
          <Field label="Status">
            <select
              disabled={view}
              className={inputClass}
              name="status"
              defaultValue={entry?.status || "Pending"}
            >
              {["Pending", "Accepted", "Rejected", "Expired"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <div className="mt-2 flex gap-3">
            {!view && <button className={primaryClass}>Save Quotation</button>}
            <button type="button" className={secondaryClass} onClick={onClose}>
              {view ? "Close" : "Cancel"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
