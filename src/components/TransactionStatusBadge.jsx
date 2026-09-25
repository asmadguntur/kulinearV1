import { STATUS_LABELS, getStatusKey } from "@/lib/transaction";

// className: class tambahan dari pemanggil, mis. "uppercase tracking-wide".
export default function TransactionStatusBadge({ transaction, className = "" }) {
  const key = getStatusKey(transaction);
  // Jaga-jaga kalau suatu hari API menambah status baru.
  const status = STATUS_LABELS[key] || {
    label: key,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${status.className} ${className}`}
    >
      {status.label}
    </span>
  );
}
