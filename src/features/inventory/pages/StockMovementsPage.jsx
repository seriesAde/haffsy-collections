import { useState } from "react";
import { Filter, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeading, SearchBox } from "../../admin/components/AdminUI";
import { inputClass, tableClass } from "../../admin/components/styles";
import { useInventory } from "../InventoryContext";
import { cn } from "../../../lib/utils";
export default function StockMovementsPage() {
  const { movements } = useInventory();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const rows = movements.filter(
    (m) =>
      (m.name + " " + m.sku).toLowerCase().includes(query.toLowerCase()) &&
      (type === "all" || m.type === type),
  );
  return (
    <>
      <PageHeading
        title="Stock Movements"
        subtitle="Track all inventory movements and adjustments"
      />
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-outline p-4">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search by product name or SKU..."
        />
        <Filter size={20} className="text-muted" />
        <select
          aria-label="Movement type"
          className={inputClass + " sm:max-w-44"}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All types</option>
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
          <option value="adjustment">Adjustment</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-outline">
        <table className={tableClass}>
          <thead>
            <tr>
              {[
                "Product",
                "SKU",
                "Type",
                "Quantity",
                "Source/Destination",
                "Date & Time",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td className="font-medium">{m.name}</td>
                <td className="text-muted">{m.sku}</td>
                <td>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs",
                      m.type === "in"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : m.type === "out"
                          ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                    )}
                  >
                    {m.type === "in" ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {
                      {
                        in: "Stock In",
                        out: "Stock Out",
                        adjustment: "Adjustment",
                      }[m.type]
                    }
                  </span>
                </td>
                <td
                  className={
                    m.quantity > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500"
                  }
                >
                  {m.quantity > 0 ? "+" : ""}
                  {m.quantity}
                </td>
                <td className="text-muted">{m.source}</td>
                <td className="text-muted">
                  {new Date(m.date).toLocaleDateString("en-CA")}
                  <div className="mt-1 text-xs">
                    {new Date(m.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No stock movements match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
