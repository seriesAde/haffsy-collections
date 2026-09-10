import { Search } from "lucide-react";
export function PageHeading({ title, subtitle, children }) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-outline px-3 text-muted">
      <Search size={20} />
      <span className="sr-only">{placeholder}</span>
      <input
        className="w-full bg-transparent py-3 text-foreground outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
